"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Mail,
  Phone,
  Linkedin,
  Copy,
  Check,
  Send,
  Sparkles,
  MapPin,
  Building2,
} from "lucide-react";
import {
  type Prospect,
  channelMeta,
  priorityMeta,
  fullName,
} from "@/lib/prospects";
import {
  emailTemplates,
  callScripts,
  personalize,
  buildMailto,
} from "@/lib/templates";
import { Avatar } from "@/components/ui";

function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-800/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
    >
      {done ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {done ? "Copié" : label}
    </button>
  );
}

export function ProspectDrawer({
  prospect,
  onClose,
}: {
  prospect: Prospect | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"email" | "call">("email");

  if (!prospect) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-ink-900 shadow-2xl">
        <DrawerHeader prospect={prospect} onClose={onClose} />

        <div className="flex gap-1 border-b border-white/5 px-5">
          {(["email", "call"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-3 py-3 text-sm font-medium transition ${
                tab === t ? "text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t === "email" ? "Email personnalisé" : "Script d'appel"}
              {tab === t && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-400" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "email" ? (
            <EmailComposer prospect={prospect} />
          ) : (
            <CallPanel prospect={prospect} />
          )}
        </div>
      </aside>
    </>
  );
}

function DrawerHeader({
  prospect,
  onClose,
}: {
  prospect: Prospect;
  onClose: () => void;
}) {
  const ch = channelMeta[prospect.channel];
  return (
    <div className="border-b border-white/5 p-5">
      <div className="flex items-start gap-3">
        <Avatar
          first={prospect.firstName}
          last={prospect.lastName}
          color={ch.color}
          size={44}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-white">
            {fullName(prospect)}
          </h2>
          <p className="truncate text-sm text-slate-400">
            {prospect.jobTitle || "—"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/5 bg-ink-800/60 text-slate-400 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span
          className="chip"
          style={{ color: ch.color, background: `${ch.color}1a` }}
        >
          {ch.label}
        </span>
        {prospect.priority && (
          <span
            className="chip"
            style={{
              color: priorityMeta[prospect.priority] ?? "#94a3b8",
              background: `${priorityMeta[prospect.priority] ?? "#94a3b8"}1a`,
            }}
          >
            Priorité {prospect.priority}
          </span>
        )}
        {prospect.company && (
          <span className="chip bg-white/5 text-slate-300">
            <Building2 className="h-3 w-3" />
            {prospect.company}
          </span>
        )}
        {prospect.city && (
          <span className="chip bg-white/5 text-slate-400">
            <MapPin className="h-3 w-3" />
            {prospect.city}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {prospect.email && (
          <a
            href={`mailto:${prospect.email}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:text-white"
          >
            <Mail className="h-3.5 w-3.5" />
            {prospect.email}
          </a>
        )}
        {prospect.phone && (
          <a
            href={`tel:${prospect.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:text-white"
          >
            <Phone className="h-3.5 w-3.5" />
            {prospect.phone}
          </a>
        )}
        {prospect.linkedin && (
          <a
            href={prospect.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:text-white"
          >
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}

function EmailComposer({ prospect }: { prospect: Prospect }) {
  const templates = emailTemplates[prospect.channel];
  const [templateId, setTemplateId] = useState(templates[0].id);
  const template = useMemo(
    () => templates.find((t) => t.id === templateId) ?? templates[0],
    [templates, templateId]
  );

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setSubject(personalize(template.subject, prospect));
    setBody(personalize(template.body, prospect));
  }, [template, prospect]);

  const mailto = buildMailto(prospect, {
    ...template,
    subject,
    body,
  });

  return (
    <div className="space-y-4">
      {templates.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`chip ${
                t.id === templateId
                  ? "bg-brand-500/20 text-brand-200"
                  : "bg-white/5 text-slate-400"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Objet
        </span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/40"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Message
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          className="w-full resize-none rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm leading-relaxed text-slate-100 outline-none focus:border-brand-500/40"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={prospect.email ? mailto : undefined}
          aria-disabled={!prospect.email}
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
            prospect.email
              ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow hover:brightness-110"
              : "cursor-not-allowed bg-white/5 text-slate-500"
          }`}
        >
          <Send className="h-4 w-4" />
          {prospect.email ? "Ouvrir dans la messagerie" : "Email indisponible"}
        </a>
        <CopyButton text={body} label="Copier le message" />
        <CopyButton text={subject} label="Copier l'objet" />
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-brand-500/20 bg-brand-500/[0.06] p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
        <p className="text-xs leading-relaxed text-slate-400">
          <span className="font-medium text-slate-200">Lexora AI</span> —
          bientôt : génération d'un email sur-mesure à partir du profil
          LinkedIn et de l'historique, puis envoi via un agent.
        </p>
      </div>
    </div>
  );
}

function CallPanel({ prospect }: { prospect: Prospect }) {
  const script = callScripts[prospect.channel];
  const fullScript = script.sections
    .map((s) => `${s.label} :\n${personalize(s.text, prospect)}`)
    .join("\n\n");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={
            prospect.phone
              ? `tel:${prospect.phone.replace(/\s/g, "")}`
              : undefined
          }
          aria-disabled={!prospect.phone}
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
            prospect.phone
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-glow hover:brightness-110"
              : "cursor-not-allowed bg-white/5 text-slate-500"
          }`}
        >
          <Phone className="h-4 w-4" />
          {prospect.phone ? `Appeler ${prospect.phone}` : "Téléphone indisponible"}
        </a>
        <CopyButton text={fullScript} label="Copier le script" />
      </div>

      <div className="space-y-2.5">
        {script.sections.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-ink-800/40 p-3.5"
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-300">
              {s.label}
            </p>
            <p className="text-sm leading-relaxed text-slate-200">
              {personalize(s.text, prospect)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
