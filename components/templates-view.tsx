"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  PhoneCall,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { channelMeta, type Channel } from "@/lib/prospects";
import type {
  CustomEmailTemplate,
  CustomScriptTemplate,
  ScriptSection,
} from "@/lib/crm";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/app/actions";

const channels = Object.keys(channelMeta) as Channel[];
const MERGE_HINT = "Variables : {{prenom}} {{nom}} {{fonction}} {{entreprise}} {{ville}} {{moi}}";

type EmailDraft = {
  id?: string;
  name: string;
  channel: string;
  subject: string;
  body: string;
};
type ScriptDraft = {
  id?: string;
  name: string;
  channel: string;
  sections: ScriptSection[];
};

export function TemplatesView({
  emails,
  scripts,
}: {
  emails: CustomEmailTemplate[];
  scripts: CustomScriptTemplate[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [scriptDraft, setScriptDraft] = useState<ScriptDraft | null>(null);

  function refresh() {
    router.refresh();
  }

  function saveEmail() {
    if (!emailDraft || !emailDraft.name.trim()) return;
    start(async () => {
      const payload = {
        name: emailDraft.name,
        channel: emailDraft.channel || null,
        subject: emailDraft.subject,
        body: emailDraft.body,
      };
      if (emailDraft.id) await updateTemplate(emailDraft.id, payload);
      else await createTemplate({ kind: "email", ...payload });
      setEmailDraft(null);
      refresh();
    });
  }

  function saveScript() {
    if (!scriptDraft || !scriptDraft.name.trim()) return;
    start(async () => {
      const sections = scriptDraft.sections.filter(
        (s) => s.label.trim() || s.text.trim()
      );
      const payload = {
        name: scriptDraft.name,
        channel: scriptDraft.channel || null,
        sections,
      };
      if (scriptDraft.id) await updateTemplate(scriptDraft.id, payload);
      else await createTemplate({ kind: "script", ...payload });
      setScriptDraft(null);
      refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Supprimer ce modèle ?")) return;
    start(async () => {
      await deleteTemplate(id);
      refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* ---- Email models ---- */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <Mail className="h-4 w-4 text-cyan-400" /> Modèles d&apos;email
          </h2>
          <button
            onClick={() =>
              setEmailDraft({ name: "", channel: "", subject: "", body: "" })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs font-medium text-brand-200 hover:bg-brand-500/25"
          >
            <Plus className="h-3.5 w-3.5" /> Nouveau modèle
          </button>
        </div>

        {emailDraft && (
          <EmailEditor
            draft={emailDraft}
            setDraft={setEmailDraft}
            onSave={saveEmail}
            onCancel={() => setEmailDraft(null)}
            pending={pending}
          />
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {emails.map((e) => (
            <div key={e.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{e.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {e.subject || "(sans objet)"}
                  </p>
                </div>
                <ChannelChip channel={e.channel} />
              </div>
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-slate-400">
                {e.body}
              </p>
              <div className="mt-3 flex gap-2">
                <IconBtn
                  onClick={() =>
                    setEmailDraft({
                      id: e.id,
                      name: e.name,
                      channel: e.channel ?? "",
                      subject: e.subject,
                      body: e.body,
                    })
                  }
                  icon={Pencil}
                  label="Éditer"
                />
                <IconBtn onClick={() => remove(e.id)} icon={Trash2} label="Suppr." danger />
              </div>
            </div>
          ))}
          {emails.length === 0 && !emailDraft && (
            <EmptyHint text="Aucun modèle d'email. Créez-en un pour le réutiliser dans vos campagnes et après vos appels." />
          )}
        </div>
      </section>

      {/* ---- Call scripts ---- */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <PhoneCall className="h-4 w-4 text-indigo-400" /> Scripts d&apos;appel
          </h2>
          <button
            onClick={() =>
              setScriptDraft({
                name: "",
                channel: "",
                sections: [{ label: "Accroche", text: "" }],
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs font-medium text-brand-200 hover:bg-brand-500/25"
          >
            <Plus className="h-3.5 w-3.5" /> Nouveau script
          </button>
        </div>

        {scriptDraft && (
          <ScriptEditor
            draft={scriptDraft}
            setDraft={setScriptDraft}
            onSave={saveScript}
            onCancel={() => setScriptDraft(null)}
            pending={pending}
          />
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {scripts.map((s) => (
            <div key={s.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate font-medium text-white">{s.name}</p>
                <ChannelChip channel={s.channel} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {s.sections.length} section{s.sections.length > 1 ? "s" : ""}
              </p>
              <ul className="mt-2 space-y-0.5">
                {s.sections.slice(0, 4).map((sec, i) => (
                  <li key={i} className="truncate text-xs text-slate-400">
                    • {sec.label}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <IconBtn
                  onClick={() =>
                    setScriptDraft({
                      id: s.id,
                      name: s.name,
                      channel: s.channel ?? "",
                      sections:
                        s.sections.length > 0
                          ? s.sections
                          : [{ label: "Accroche", text: "" }],
                    })
                  }
                  icon={Pencil}
                  label="Éditer"
                />
                <IconBtn onClick={() => remove(s.id)} icon={Trash2} label="Suppr." danger />
              </div>
            </div>
          ))}
          {scripts.length === 0 && !scriptDraft && (
            <EmptyHint text="Aucun script personnalisé. Créez-en un pour l'utiliser dans vos campagnes d'appel." />
          )}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------

function EmailEditor({
  draft,
  setDraft,
  onSave,
  onCancel,
  pending,
}: {
  draft: EmailDraft;
  setDraft: (d: EmailDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <div className="card mb-3 space-y-3 border-brand-500/30 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nom du modèle">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Ex. Relance après appel"
            className={inputCls}
          />
        </Field>
        <Field label="Canal (optionnel)">
          <ChannelSelect
            value={draft.channel}
            onChange={(v) => setDraft({ ...draft, channel: v })}
          />
        </Field>
      </div>
      <Field label="Objet">
        <input
          value={draft.subject}
          onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label={`Message — ${MERGE_HINT}`}>
        <textarea
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          rows={9}
          className={`${inputCls} resize-none leading-relaxed`}
        />
      </Field>
      <EditorActions onSave={onSave} onCancel={onCancel} pending={pending} disabled={!draft.name.trim()} />
    </div>
  );
}

function ScriptEditor({
  draft,
  setDraft,
  onSave,
  onCancel,
  pending,
}: {
  draft: ScriptDraft;
  setDraft: (d: ScriptDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  function setSection(i: number, patch: Partial<ScriptSection>) {
    const sections = draft.sections.map((s, idx) =>
      idx === i ? { ...s, ...patch } : s
    );
    setDraft({ ...draft, sections });
  }
  return (
    <div className="card mb-3 space-y-3 border-brand-500/30 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nom du script">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Ex. Script découverte PME"
            className={inputCls}
          />
        </Field>
        <Field label="Canal (optionnel)">
          <ChannelSelect
            value={draft.channel}
            onChange={(v) => setDraft({ ...draft, channel: v })}
          />
        </Field>
      </div>
      <p className="text-[11px] text-slate-500">{MERGE_HINT}</p>
      <div className="space-y-2">
        {draft.sections.map((s, i) => (
          <div key={i} className="rounded-lg border border-white/5 bg-ink-800/40 p-2.5">
            <div className="mb-1.5 flex items-center gap-2">
              <input
                value={s.label}
                onChange={(e) => setSection(i, { label: e.target.value })}
                placeholder="Titre de section (ex. Accroche)"
                className="h-8 flex-1 rounded-md border border-white/5 bg-ink-900/60 px-2 text-xs font-medium text-slate-100 outline-none focus:border-brand-500/40"
              />
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    sections: draft.sections.filter((_, idx) => idx !== i),
                  })
                }
                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <textarea
              value={s.text}
              onChange={(e) => setSection(i, { text: e.target.value })}
              rows={3}
              placeholder="Texte de la section…"
              className={`${inputCls} resize-none text-sm`}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          setDraft({
            ...draft,
            sections: [...draft.sections, { label: "", text: "" }],
          })
        }
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-800/60 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
      >
        <Plus className="h-3.5 w-3.5" /> Ajouter une section
      </button>
      <EditorActions onSave={onSave} onCancel={onCancel} pending={pending} disabled={!draft.name.trim()} />
    </div>
  );
}

// ---------------------------------------------------------------------------

const inputCls =
  "w-full rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function ChannelSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    >
      <option value="">— Tous canaux —</option>
      {channels.map((c) => (
        <option key={c} value={c}>
          {channelMeta[c].label}
        </option>
      ))}
    </select>
  );
}

function ChannelChip({ channel }: { channel: string | null }) {
  if (!channel || !(channel in channelMeta)) return null;
  const m = channelMeta[channel as Channel];
  return (
    <span className="chip shrink-0" style={{ color: m.color, background: `${m.color}1a` }}>
      {m.label}
    </span>
  );
}

function EditorActions({
  onSave,
  onCancel,
  pending,
  disabled,
}: {
  onSave: () => void;
  onCancel: () => void;
  pending: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onSave}
        disabled={pending || disabled}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-glow hover:brightness-110 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </button>
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-800/60 px-3 py-2 text-sm text-slate-300 hover:text-white"
      >
        <X className="h-4 w-4" /> Annuler
      </button>
    </div>
  );
}

function IconBtn({
  onClick,
  icon: Icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: typeof Pencil;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-800/60 px-2.5 py-1.5 text-xs hover:text-white ${
        danger ? "text-red-300/80 hover:border-red-500/30" : "text-slate-300"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="card col-span-full p-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
