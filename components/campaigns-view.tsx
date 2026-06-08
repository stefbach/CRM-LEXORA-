"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Mail,
  PhoneCall,
  Loader2,
  X,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { createCampaign, deleteCampaign } from "@/app/actions";

export interface CampaignView {
  id: string;
  name: string;
  kind: "email" | "call";
  status: "draft" | "active" | "paused" | "done";
  groupName: string | null;
  groupColor: string | null;
  stats: {
    target: number;
    processed: number;
    sent: number;
    errors: number;
    reached: number;
  };
}

export interface GroupOption {
  id: string;
  name: string;
  color: string;
  memberCount: number;
}

const statusMeta: Record<
  CampaignView["status"],
  { label: string; color: string }
> = {
  draft: { label: "Brouillon", color: "#64748b" },
  active: { label: "Active", color: "#10b981" },
  paused: { label: "En pause", color: "#f59e0b" },
  done: { label: "Terminée", color: "#3b82f6" },
};

export function CampaignsView({
  campaigns,
  groups,
}: {
  campaigns: CampaignView[];
  groups: GroupOption[];
}) {
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 px-3 text-sm font-medium text-white shadow-glow transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nouvelle campagne
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-slate-400">Aucune campagne pour l&apos;instant.</p>
          <p className="mt-1 text-xs text-slate-500">
            Créez une campagne d&apos;email ou d&apos;appel ciblant un groupe.
            {groups.length === 0 && " Commencez par créer un groupe."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => {
            const st = statusMeta[c.status];
            const Icon = c.kind === "email" ? Mail : PhoneCall;
            const kindColor = c.kind === "email" ? "#06b6d4" : "#6366f1";
            const pct = c.stats.target
              ? Math.round((c.stats.processed / c.stats.target) * 100)
              : 0;
            return (
              <Link
                key={c.id}
                href={`/campagnes/${c.id}`}
                className="card group p-5 transition hover:border-white/15"
              >
                <div className="flex items-start justify-between">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: `${kindColor}22` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: kindColor }} />
                  </span>
                  <span
                    className="chip"
                    style={{ color: st.color, background: `${st.color}1a` }}
                  >
                    {st.label}
                  </span>
                </div>
                <h3 className="mt-3 truncate text-base font-semibold text-white">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {c.kind === "email" ? "Campagne email" : "Campagne d'appel"}
                  {c.groupName ? ` · ${c.groupName}` : ""}
                </p>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {c.stats.processed}/{c.stats.target} traités
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: kindColor }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-xs">
                  <span className="text-slate-500">
                    {c.kind === "email"
                      ? `${c.stats.sent} envoyés`
                      : `${c.stats.reached} joints`}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-brand-300">
                    Ouvrir <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {creating && (
        <CreateCampaign groups={groups} onClose={() => setCreating(false)} />
      )}
    </div>
  );
}

function CreateCampaign({
  groups,
  onClose,
}: {
  groups: GroupOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"email" | "call">("email");
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!name.trim()) return setError("Nom requis.");
    if (!groupId) return setError("Sélectionnez un groupe.");
    start(async () => {
      const r = await createCampaign({ name, kind, groupId });
      if (r.ok && r.id) router.push(`/campagnes/${r.id}`);
      else setError(r.error ?? "Erreur.");
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Nouvelle campagne</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/5 bg-ink-800/60 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Nom
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Relance PME T3"
              className="w-full rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/40"
            />
          </label>

          <div>
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Type
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(["email", "call"] as const).map((k) => {
                const active = kind === k;
                const color = k === "email" ? "#06b6d4" : "#6366f1";
                const Icon = k === "email" ? Mail : PhoneCall;
                return (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition"
                    style={{
                      color: active ? "#fff" : color,
                      background: active ? color : `${color}1a`,
                      borderColor: active ? color : "transparent",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {k === "email" ? "Email" : "Appel"}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Groupe cible
            </span>
            {groups.length === 0 ? (
              <p className="text-xs text-amber-300">
                Aucun groupe — créez-en un d&apos;abord dans Groupes.
              </p>
            ) : (
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/40"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.memberCount})
                  </option>
                ))}
              </select>
            )}
          </label>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={submit}
            disabled={pending || groups.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 py-2.5 text-sm font-medium text-white shadow-glow hover:brightness-110 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Créer la campagne
          </button>
        </div>
      </div>
    </>
  );
}

export function DeleteCampaignButton({ id }: { id: string }) {
  const router = useRouter();
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
          await deleteCampaign(id);
          router.push("/campagnes");
        });
      }}
      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition ${
        confirm
          ? "bg-red-500/20 text-red-300"
          : "border border-white/5 bg-ink-800/60 text-slate-400 hover:text-white"
      }`}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {confirm ? "Confirmer" : "Supprimer"}
    </button>
  );
}
