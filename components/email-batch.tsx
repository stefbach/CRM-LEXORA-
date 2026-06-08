"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Search,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  channelMeta,
  fullName,
  type Channel,
  type Prospect,
} from "@/lib/prospects";
import { emailTemplates, personalize } from "@/lib/templates";
import { Avatar } from "@/components/ui";
import { sendBatchEmails, type EmailSendResult } from "@/app/actions";

const channels = Object.keys(channelMeta) as Channel[];

export function EmailBatch({
  prospects,
  configured,
  from,
}: {
  prospects: Prospect[];
  configured: boolean;
  from: string | null;
}) {
  const [channel, setChannel] = useState<Channel>("pme");
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const [results, setResults] = useState<EmailSendResult[] | null>(null);
  const [confirm, setConfirm] = useState(false);

  // Seed the template when the flux changes.
  useEffect(() => {
    const t = emailTemplates[channel][0];
    setSubject(t.subject);
    setBody(t.body);
    setSelected(new Set());
    setResults(null);
    setConfirm(false);
  }, [channel]);

  const recipients = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return prospects.filter((p) => {
      if (p.channel !== channel) return false;
      if (!p.email || p.optOut) return false;
      if (needle) {
        const hay = `${p.firstName} ${p.lastName} ${p.company ?? ""} ${
          p.email ?? ""
        }`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [prospects, channel, q]);

  const allSelected =
    recipients.length > 0 && recipients.every((p) => selected.has(p.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(recipients.map((p) => p.id)));
  }

  const selectedProspects = recipients.filter((p) => selected.has(p.id));
  const preview = selectedProspects[0] ?? recipients[0];

  function doSend() {
    setResults(null);
    start(async () => {
      const items = selectedProspects.map((p) => ({
        contactId: p.id,
        subject: personalize(subject, p),
        body: personalize(body, p),
        channel: p.channel,
      }));
      const r = await sendBatchEmails(items);
      setResults(r.results);
      setConfirm(false);
      setSelected(new Set());
    });
  }

  const sentOk = results?.filter((r) => r.ok).length ?? 0;
  const failed = results?.filter((r) => !r.ok && !r.skipped).length ?? 0;
  const skipped = results?.filter((r) => r.skipped).length ?? 0;

  return (
    <div className="space-y-4">
      {!configured && (
        <div className="card flex items-start gap-3 border-amber-500/20 bg-amber-500/[0.05] p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="text-sm text-slate-300">
            <p className="font-medium text-amber-200">Resend non configuré</p>
            <p className="mt-0.5 text-xs text-slate-400">
              Ajoutez <code className="text-slate-200">RESEND_API_KEY</code> et{" "}
              <code className="text-slate-200">RESEND_FROM</code> (ex.{" "}
              <code className="text-slate-200">
                Stéphane &lt;stephane@lexora.mu&gt;
              </code>
              ) dans les variables d&apos;environnement Vercel, puis redéployez.
              Vous pouvez préparer et sélectionner les envois dès maintenant.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Composer */}
        <div className="space-y-4 lg:col-span-3">
          <div className="card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Flux (segment)
            </p>
            <div className="flex flex-wrap gap-2">
              {channels.map((ch) => {
                const active = channel === ch;
                const color = channelMeta[ch].color;
                return (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className="chip transition"
                    style={{
                      color: active ? "#fff" : color,
                      background: active ? color : `${color}1a`,
                      boxShadow: active ? `inset 0 0 0 1px ${color}` : "none",
                    }}
                  >
                    {channelMeta[ch].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card space-y-3 p-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Objet (variables : {"{{prenom}} {{entreprise}} {{ville}}"})
              </span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/40"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Modèle du message
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full resize-none rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm leading-relaxed text-slate-100 outline-none focus:border-brand-500/40"
              />
            </label>
          </div>

          {preview && (
            <div className="card p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Aperçu — {fullName(preview)}
              </p>
              <p className="text-sm font-medium text-white">
                {personalize(subject, preview)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {personalize(body, preview)}
              </p>
            </div>
          )}
        </div>

        {/* Recipients */}
        <div className="lg:col-span-2">
          <div className="card flex h-full flex-col p-0">
            <div className="border-b border-white/5 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Filtrer les destinataires…"
                  className="h-9 w-full rounded-lg border border-white/5 bg-ink-800/60 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-brand-500/40"
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button
                  onClick={toggleAll}
                  className="text-xs font-medium text-brand-300 hover:text-brand-200"
                >
                  {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                </button>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  {selected.size}/{recipients.length}
                </span>
              </div>
            </div>

            <div className="max-h-[420px] flex-1 overflow-y-auto">
              {recipients.map((p) => {
                const ch = channelMeta[p.channel];
                const checked = selected.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`flex w-full items-center gap-3 border-b border-white/[0.03] px-3 py-2.5 text-left transition hover:bg-white/[0.03] ${
                      checked ? "bg-brand-500/[0.06]" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={checked}
                      className="accent-brand-500"
                    />
                    <Avatar
                      first={p.firstName}
                      last={p.lastName}
                      color={ch.color}
                      size={28}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {fullName(p)}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {p.email}
                      </p>
                    </div>
                  </button>
                );
              })}
              {recipients.length === 0 && (
                <p className="p-6 text-center text-sm text-slate-500">
                  Aucun destinataire avec email dans ce flux.
                </p>
              )}
            </div>

            <div className="border-t border-white/5 p-3">
              {!confirm ? (
                <button
                  onClick={() => setConfirm(true)}
                  disabled={selected.size === 0 || pending}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                    selected.size > 0
                      ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow hover:brightness-110"
                      : "cursor-not-allowed bg-white/5 text-slate-500"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  Préparer l&apos;envoi ({selected.size})
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-center text-xs text-slate-400">
                    Envoyer {selected.size} email
                    {selected.size > 1 ? "s" : ""}
                    {from ? ` depuis ${from}` : ""} ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirm(false)}
                      className="flex-1 rounded-lg border border-white/10 bg-ink-800/60 py-2 text-sm text-slate-300 transition hover:text-white"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={doSend}
                      disabled={pending}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 py-2 text-sm font-medium text-white shadow-glow transition hover:brightness-110"
                    >
                      {pending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Confirmer l&apos;envoi
                    </button>
                  </div>
                </div>
              )}

              {results && (
                <div className="mt-3 space-y-1 text-xs">
                  <p className="inline-flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {sentOk} envoyé
                    {sentOk > 1 ? "s" : ""}
                  </p>
                  {skipped > 0 && (
                    <p className="inline-flex items-center gap-1 text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" /> {skipped} ignoré
                      {skipped > 1 ? "s" : ""} (opt-out / sans email)
                    </p>
                  )}
                  {failed > 0 && (
                    <p className="inline-flex items-center gap-1 text-red-400">
                      <XCircle className="h-3.5 w-3.5" /> {failed} échec
                      {failed > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
