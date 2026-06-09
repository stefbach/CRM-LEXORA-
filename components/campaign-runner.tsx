"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Flag,
  Save,
  Phone,
  ArrowRight,
  Search,
} from "lucide-react";
import {
  channelMeta,
  fullName,
  type Channel,
  type Prospect,
} from "@/lib/prospects";
import { statusMeta } from "@/lib/crm-meta";
import { emailTemplates, personalize } from "@/lib/templates";
import {
  buildEmailModels,
  type EmailModel,
  type CustomEmailModel,
} from "@/lib/email-models";
import { Avatar } from "@/components/ui";
import { ProspectDrawer } from "@/components/prospect-drawer";
import {
  launchEmailCampaign,
  setCampaignStatus,
  updateCampaign,
  sendCampaignTest,
  type EmailSendResult,
} from "@/app/actions";

// personalize + tidy the empty-name greeting ("Bonjour ," -> "Bonjour,")
function personalizeEmail(tpl: string, p: Prospect): string {
  return personalize(tpl, p).replace(/Bonjour\s+,/g, "Bonjour,");
}


type Status = "draft" | "active" | "paused" | "done";

export function CampaignStatusControls({
  id,
  status,
  configured,
}: {
  id: string;
  status: Status;
  configured?: boolean;
}) {
  const [pending, start] = useTransition();
  function set(s: Status) {
    start(async () => {
      await setCampaignStatus(id, s);
    });
  }
  return (
    <div className="flex items-center gap-2">
      {status !== "active" && status !== "done" && (
        <button
          onClick={() => set("active")}
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-500/15 px-3 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/25"
        >
          <Play className="h-4 w-4" /> Activer
        </button>
      )}
      {status === "active" && (
        <button
          onClick={() => set("paused")}
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-amber-500/15 px-3 text-sm font-medium text-amber-300 transition hover:bg-amber-500/25"
        >
          <Pause className="h-4 w-4" /> Pause
        </button>
      )}
      {status !== "done" && (
        <button
          onClick={() => set("done")}
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/5 bg-ink-800/60 px-3 text-sm text-slate-300 transition hover:text-white"
        >
          <Flag className="h-4 w-4" /> Terminer
        </button>
      )}
      {pending && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Email campaign runner
// ---------------------------------------------------------------------------

export function CampaignEmailRunner({
  campaignId,
  members,
  doneContactIds,
  template,
  configured,
  customEmailModels = [],
}: {
  campaignId: string;
  members: Prospect[];
  doneContactIds: string[];
  template: { subject?: string; body?: string; preset?: string; html?: string };
  configured: boolean;
  customEmailModels?: CustomEmailModel[];
}) {
  const done = useMemo(() => new Set(doneContactIds), [doneContactIds]);
  const recipients = useMemo(
    () => members.filter((m) => m.email && !m.optOut),
    [members]
  );
  const seedChannel: Channel = recipients[0]?.channel ?? "pme";
  const seed = emailTemplates[seedChannel][0];

  // ---- Available email models: presets + custom + per-channel text ----------
  const models = useMemo<EmailModel[]>(() => {
    const campaignCustom: EmailModel[] =
      !template.preset && (template.subject || template.body)
        ? [
            {
              id: "campaign",
              label: "Modèle enregistré (cette campagne)",
              html: false,
              subject: template.subject ?? seed.subject,
              body: template.body ?? seed.body,
            },
          ]
        : [];
    return [...campaignCustom, ...buildEmailModels(customEmailModels)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customEmailModels]);

  const initialModelId = template.preset
    ? `preset:${template.preset}`
    : template.subject || template.body
    ? "campaign"
    : `text:${seed.id}`;
  const initialModel = models.find((m) => m.id === initialModelId) ?? models[0];

  const [modelId, setModelId] = useState(initialModel.id);
  const [subject, setSubject] = useState(initialModel.subject);
  const [body, setBody] = useState(initialModel.body);
  const [htmlBody, setHtmlBody] = useState(initialModel.htmlBody ?? "");
  const isHtml = Boolean(htmlBody);

  function selectModel(id: string) {
    const m = models.find((x) => x.id === id);
    if (!m) return;
    setModelId(id);
    setSubject(m.subject);
    setBody(m.body);
    setHtmlBody(m.html ? m.htmlBody ?? "" : "");
  }

  const [q, setQ] = useState("");
  const [batchSize, setBatchSize] = useState(50);
  const [localDone, setLocalDone] = useState<Set<string>>(new Set());
  const doneAll = useMemo(() => {
    const s = new Set<string>(done);
    localDone.forEach((id) => s.add(id));
    return s;
  }, [done, localDone]);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(recipients.filter((r) => !done.has(r.id)).map((r) => r.id))
  );
  const [pending, start] = useTransition();
  const [results, setResults] = useState<EmailSendResult[] | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testMsg, setTestMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return recipients;
    return recipients.filter((p) =>
      `${p.firstName} ${p.lastName} ${p.company ?? ""} ${p.email ?? ""}`
        .toLowerCase()
        .includes(needle)
    );
  }, [recipients, q]);

  const preview = recipients.find((r) => selected.has(r.id)) ?? recipients[0];

  function toggle(id: string) {
    setSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  const allSel = filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  function saveTemplate() {
    const tpl = modelId.startsWith("preset:")
      ? { preset: modelId.slice("preset:".length), subject }
      : { subject, body };
    start(async () => {
      await updateCampaign(campaignId, { template: tpl });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 1500);
    });
  }

  function sendTest() {
    setTestMsg(null);
    if (!testEmail.includes("@")) {
      setTestMsg("Adresse invalide.");
      return;
    }
    start(async () => {
      const r = await sendCampaignTest(campaignId, testEmail, {
        subject,
        text: body,
        html: isHtml ? htmlBody : undefined,
      });
      setTestMsg(r.ok ? "Test envoyé ✓" : r.error ?? "Échec.");
    });
  }

  // Recipients still to send (selected, not already sent), in list order.
  const queue = recipients.filter(
    (r) => selected.has(r.id) && !doneAll.has(r.id)
  );
  const nextBatch = queue.slice(0, Math.max(1, batchSize));

  function send() {
    if (nextBatch.length === 0) return;
    const items = nextBatch.map((p) => ({
      contactId: p.id,
      subject: personalizeEmail(subject, p),
      body: personalizeEmail(body, p),
      html: isHtml ? personalizeEmail(htmlBody, p) : undefined,
      channel: p.channel,
    }));
    const ids = nextBatch.map((p) => p.id);
    start(async () => {
      const r = await launchEmailCampaign(campaignId, items);
      setResults(r.results);
      setLocalDone((prev) => {
        const n = new Set(prev);
        ids.forEach((id) => n.add(id));
        return n;
      });
      setSelected((prev) => {
        const n = new Set(prev);
        ids.forEach((id) => n.delete(id));
        return n;
      });
    });
  }

  const sentOk = results?.filter((r) => r.ok).length ?? 0;
  const failed = results?.filter((r) => !r.ok && !r.skipped).length ?? 0;
  const skipped = results?.filter((r) => r.skipped).length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        {!configured && (
          <div className="card flex items-start gap-3 border-amber-500/20 bg-amber-500/[0.05] p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <p className="text-xs text-slate-300">
              Resend non configuré — vous pouvez préparer la campagne, l&apos;envoi
              réel sera actif une fois <code>RESEND_API_KEY</code> /{" "}
              <code>RESEND_FROM</code> en place.
            </p>
          </div>
        )}
        <div className="card space-y-3 p-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Modèle d&apos;email
            </span>
            <select
              value={modelId}
              onChange={(e) => selectModel(e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/40"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
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
          {isHtml ? (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-2 text-xs text-slate-300">
              ✦ Modèle HTML — design fixe, aperçu ci-dessous. La personnalisation
              ({"{{prenom}}"}) est appliquée à l&apos;envoi.
            </div>
          ) : (
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Message (variables {"{{prenom}} {{entreprise}} {{ville}}"})
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full resize-none rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-sm leading-relaxed text-slate-100 outline-none focus:border-brand-500/40"
              />
            </label>
          )}
          <button
            onClick={saveTemplate}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-800/60 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
          >
            <Save className="h-3.5 w-3.5" />
            {savedMsg ? "Objet enregistré ✓" : "Enregistrer le modèle"}
          </button>
        </div>

        {preview && (
          <div className="card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Aperçu — {fullName(preview)}
            </p>
            <p className="text-sm font-medium text-white">
              {personalizeEmail(subject, preview)}
            </p>
            {isHtml ? (
              <iframe
                title="Aperçu email"
                className="mt-3 h-[520px] w-full rounded-lg border border-white/10 bg-white"
                sandbox=""
                srcDoc={personalizeEmail(htmlBody, preview)}
              />
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {personalizeEmail(body, preview)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="card flex h-full flex-col p-0">
          <div className="border-b border-white/5 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filtrer…"
                className="h-9 w-full rounded-lg border border-white/5 bg-ink-800/60 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-brand-500/40"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <button
                onClick={() =>
                  setSelected(
                    allSel ? new Set() : new Set(filtered.map((p) => p.id))
                  )
                }
                className="font-medium text-brand-300 hover:text-brand-200"
              >
                {allSel ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
              <span className="text-slate-500">
                {selected.size} sél. · {doneAll.size} envoyés / {recipients.length}
              </span>
            </div>
          </div>

          <div className="max-h-[460px] flex-1 overflow-y-auto">
            {filtered.map((p) => {
              const ch = channelMeta[p.channel];
              const isDone = doneAll.has(p.id);
              const checked = selected.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={`flex w-full items-center gap-3 border-b border-white/[0.03] px-3 py-2.5 text-left transition hover:bg-white/[0.03] ${
                    checked ? "bg-brand-500/[0.06]" : ""
                  }`}
                >
                  <input type="checkbox" readOnly checked={checked} className="accent-brand-500" />
                  <Avatar first={p.firstName} last={p.lastName} color={ch.color} size={26} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {fullName(p)}
                    </p>
                    <p className="truncate text-xs text-slate-500">{p.email}</p>
                  </div>
                  {isDone && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  )}
                </button>
              );
            })}
            {recipients.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-500">
                Aucun destinataire avec email dans ce groupe.
              </p>
            )}
          </div>

          <div className="border-t border-white/5 p-3">
            <div className="mb-3 rounded-lg border border-white/5 bg-ink-800/40 p-2.5">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Tester avant envoi
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="vous@email.com"
                  className="h-8 flex-1 rounded-md border border-white/5 bg-ink-900/60 px-2 text-xs text-slate-200 outline-none focus:border-brand-500/40"
                />
                <button
                  onClick={sendTest}
                  disabled={pending || !testEmail}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-ink-800/60 px-2.5 text-xs text-slate-300 hover:text-white disabled:opacity-50"
                >
                  <Send className="h-3 w-3" /> Test
                </button>
              </div>
              {testMsg && (
                <p
                  className={`mt-1.5 text-[11px] ${
                    testMsg.includes("✓") ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {testMsg}
                </p>
              )}
            </div>
            <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-400">
              <span>Envoyer par lots de</span>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="rounded-md border border-white/10 bg-ink-800/60 px-2 py-1 text-xs text-slate-200 outline-none focus:border-brand-500/40"
              >
                {[10, 25, 50, 100, 200].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={send}
              disabled={nextBatch.length === 0 || pending}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                nextBatch.length > 0
                  ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow hover:brightness-110"
                  : "cursor-not-allowed bg-white/5 text-slate-500"
              }`}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Envoyer le lot ({nextBatch.length})
            </button>
            {queue.length > nextBatch.length && (
              <p className="mt-1.5 text-center text-[11px] text-slate-500">
                {queue.length - nextBatch.length} en attente après ce lot
              </p>
            )}
            {results && (
              <div className="mt-3 space-y-1 text-xs">
                <p className="text-emerald-400">{sentOk} envoyés</p>
                {skipped > 0 && (
                  <p className="text-amber-400">{skipped} ignorés (opt-out)</p>
                )}
                {failed > 0 && <p className="text-red-400">{failed} échecs</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Call campaign runner
// ---------------------------------------------------------------------------

export function CampaignCallRunner({
  campaignId,
  members,
  doneContactIds,
}: {
  campaignId: string;
  members: Prospect[];
  doneContactIds: string[];
}) {
  const done = useMemo(() => new Set(doneContactIds), [doneContactIds]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Prospect | null>(null);

  const ordered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = members.filter((p) =>
      needle
        ? `${p.firstName} ${p.lastName} ${p.company ?? ""}`
            .toLowerCase()
            .includes(needle)
        : true
    );
    // not-yet-called first
    return [...list].sort(
      (a, b) => Number(done.has(a.id)) - Number(done.has(b.id))
    );
  }, [members, q, done]);

  return (
    <div>
      <div className="card mb-4 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher dans la file d'appel de la campagne…"
            className="h-10 w-full rounded-xl border border-white/5 bg-ink-800/60 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-brand-500/40"
          />
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Téléphone</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {ordered.map((p) => {
                const ch = channelMeta[p.channel];
                const st = statusMeta[p.status];
                const isDone = done.has(p.id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`cursor-pointer border-b border-white/[0.03] transition hover:bg-white/[0.03] ${
                      isDone ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar first={p.firstName} last={p.lastName} color={ch.color} size={32} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {fullName(p)}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {p.company || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="chip"
                        style={{ color: st.color, background: `${st.color}1a` }}
                      >
                        {st.short}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">
                      {p.phone || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {isDone ? (
                        <CheckCircle2 className="inline h-4 w-4 text-emerald-400" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-300">
                          <Phone className="h-3.5 w-3.5" /> Appeler{" "}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {ordered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                    Aucun contact dans ce groupe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProspectDrawer
        prospect={selected}
        initialTab="call"
        campaignId={campaignId}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
