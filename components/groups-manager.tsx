"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  X,
  Check,
} from "lucide-react";
import {
  channelMeta,
  priorityMeta,
  type Channel,
  type Prospect,
} from "@/lib/prospects";
import {
  statusMeta,
  pipelineColumns,
  type CrmStatus,
} from "@/lib/crm-meta";
import {
  filterByRules,
  describeRules,
  type GroupRules,
} from "@/lib/groups";
import { createGroup, updateGroup, deleteGroup } from "@/app/actions";

export interface GroupView {
  id: string;
  name: string;
  description: string | null;
  color: string;
  rules: GroupRules;
  memberCount: number;
}

const channels = Object.keys(channelMeta) as Channel[];
const priorities = ["A+", "A", "B", "Direct"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#06b6d4", "#ec4899", "#8b5cf6", "#ef4444"];

export function GroupsManager({
  groups,
  contacts,
}: {
  groups: GroupView[];
  contacts: Prospect[];
}) {
  const [editing, setEditing] = useState<GroupView | "new" | null>(null);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setEditing("new")}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 px-3 text-sm font-medium text-white shadow-glow transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nouveau groupe
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-slate-400">Aucun groupe pour l&apos;instant.</p>
          <p className="mt-1 text-xs text-slate-500">
            Créez un groupe en combinant des critères (canal, priorité, statut,
            ville…) — les contacts y entrent automatiquement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <div key={g.id} className="card group p-5">
              <div className="flex items-start justify-between">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `${g.color}22` }}
                >
                  <Users className="h-4 w-4" style={{ color: g.color }} />
                </span>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => setEditing(g)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 text-slate-400 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <DeleteButton id={g.id} />
                </div>
              </div>
              <h3 className="mt-3 text-base font-semibold text-white">{g.name}</h3>
              {g.description && (
                <p className="mt-0.5 text-xs text-slate-500">{g.description}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">{describeRules(g.rules)}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3">
                <span className="text-2xl font-semibold text-white">
                  {g.memberCount}
                </span>
                <span className="text-xs text-slate-500">contacts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <GroupEditor
          group={editing === "new" ? null : editing}
          contacts={contacts}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  return (
    <button
      onClick={() => {
        if (!confirm) {
          setConfirm(true);
          setTimeout(() => setConfirm(false), 2500);
          return;
        }
        start(async () => {
          await deleteGroup(id);
        });
      }}
      className={`grid h-7 w-7 place-items-center rounded-lg ${
        confirm ? "bg-red-500/20 text-red-300" : "bg-white/5 text-slate-400 hover:text-white"
      }`}
      title={confirm ? "Confirmer la suppression" : "Supprimer"}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function GroupEditor({
  group,
  contacts,
  onClose,
}: {
  group: GroupView | null;
  contacts: Prospect[];
  onClose: () => void;
}) {
  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [color, setColor] = useState(group?.color ?? COLORS[0]);
  const [rules, setRules] = useState<GroupRules>(group?.rules ?? {});
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const cities = useMemo(
    () =>
      Array.from(
        new Set(contacts.map((c) => c.city).filter(Boolean) as string[])
      )
        .sort()
        .slice(0, 40),
    [contacts]
  );
  const sectors = useMemo(
    () =>
      Array.from(
        new Set(contacts.map((c) => c.sector).filter(Boolean) as string[])
      )
        .sort()
        .slice(0, 40),
    [contacts]
  );

  const preview = useMemo(
    () => filterByRules(contacts, rules).length,
    [contacts, rules]
  );

  function toggle<T>(key: keyof GroupRules, value: T) {
    setRules((prev) => {
      const arr = (prev[key] as T[] | undefined) ?? [];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [key]: next.length ? next : undefined };
    });
  }

  function has<T>(key: keyof GroupRules, value: T) {
    return ((rules[key] as T[] | undefined) ?? []).includes(value);
  }

  function save() {
    setError(null);
    if (!name.trim()) {
      setError("Le nom est requis.");
      return;
    }
    start(async () => {
      const payload = { name, description, color, rules };
      const r = group
        ? await updateGroup(group.id, payload)
        : await createGroup(payload);
      if (r.ok) onClose();
      else setError(r.error ?? "Erreur.");
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-ink-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">
            {group ? "Modifier le groupe" : "Nouveau groupe"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/5 bg-ink-800/60 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-3 gap-3">
            <label className="col-span-2 block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Nom
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. PME prioritaires Ebène"
                className="w-full rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/40"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Couleur
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="h-6 w-6 rounded-full ring-2 transition"
                    style={{
                      background: c,
                      // @ts-expect-error css var
                      "--tw-ring-color": color === c ? c : "transparent",
                    }}
                  />
                ))}
              </div>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Description (optionnel)
            </span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/40"
            />
          </label>

          <RuleSection label="Canal">
            {channels.map((ch) => (
              <Chip
                key={ch}
                active={has("channels", ch)}
                color={channelMeta[ch].color}
                onClick={() => toggle("channels", ch)}
              >
                {channelMeta[ch].short}
              </Chip>
            ))}
          </RuleSection>

          <RuleSection label="Priorité">
            {priorities.map((p) => (
              <Chip
                key={p}
                active={has("priorities", p)}
                color={priorityMeta[p]}
                onClick={() => toggle("priorities", p)}
              >
                {p}
              </Chip>
            ))}
          </RuleSection>

          <RuleSection label="Statut">
            {pipelineColumns.concat("opt_out" as CrmStatus).map((s) => (
              <Chip
                key={s}
                active={has("statuses", s)}
                color={statusMeta[s].color}
                onClick={() => toggle("statuses", s)}
              >
                {statusMeta[s].short}
              </Chip>
            ))}
          </RuleSection>

          <RuleSection label="Coordonnées">
            <Chip
              active={Boolean(rules.hasEmail)}
              color="#10b981"
              onClick={() =>
                setRules((p) => ({ ...p, hasEmail: p.hasEmail ? undefined : true }))
              }
            >
              Email connu
            </Chip>
            <Chip
              active={Boolean(rules.hasPhone)}
              color="#06b6d4"
              onClick={() =>
                setRules((p) => ({ ...p, hasPhone: p.hasPhone ? undefined : true }))
              }
            >
              Téléphone connu
            </Chip>
          </RuleSection>

          {cities.length > 0 && (
            <RuleSection label="Ville">
              {cities.map((c) => (
                <Chip
                  key={c}
                  active={has("cities", c)}
                  onClick={() => toggle("cities", c)}
                >
                  {c}
                </Chip>
              ))}
            </RuleSection>
          )}

          {sectors.length > 0 && (
            <RuleSection label="Secteur">
              {sectors.map((s) => (
                <Chip
                  key={s}
                  active={has("sectors", s)}
                  onClick={() => toggle("sectors", s)}
                >
                  {s}
                </Chip>
              ))}
            </RuleSection>
          )}
        </div>

        <div className="border-t border-white/5 p-5">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-brand-500/20 bg-brand-500/[0.06] px-4 py-3">
            <span className="text-xs text-slate-400">Contacts correspondants</span>
            <span className="text-xl font-semibold text-white">{preview}</span>
          </div>
          {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-ink-800/60 py-2 text-sm text-slate-300 hover:text-white"
            >
              Annuler
            </button>
            <button
              onClick={save}
              disabled={pending}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 py-2 text-sm font-medium text-white shadow-glow hover:brightness-110"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function RuleSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="chip transition"
      style={{
        color: active ? "#fff" : color ?? "#94a3b8",
        background: active ? color ?? "#6366f1" : `${color ?? "#94a3b8"}1a`,
        boxShadow: active ? `inset 0 0 0 1px ${color ?? "#6366f1"}` : "none",
      }}
    >
      {children}
    </button>
  );
}
