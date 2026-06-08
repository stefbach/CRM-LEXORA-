"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/email";
import {
  callOutcomes,
  isCallOutcome,
  asStatus,
  type CallOutcome,
  type CrmStatus,
} from "@/lib/crm-meta";
import type { GroupRules } from "@/lib/groups";
import { getPreset } from "@/lib/lexora-emails";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function revalidateCrm() {
  revalidatePath("/");
  revalidatePath("/prospects");
  revalidatePath("/appels");
  revalidatePath("/emails");
  revalidatePath("/opportunities");
  revalidatePath("/activities");
  revalidatePath("/groupes");
  revalidatePath("/campagnes");
}

// ---------------------------------------------------------------------------
// Calls — record an outcome ("flux d'appel")
// ---------------------------------------------------------------------------

export async function recordCall(input: {
  contactId: string;
  companyId?: string | null;
  outcome: CallOutcome;
  note?: string;
  callbackAt?: string | null; // ISO date (yyyy-mm-dd) or null
  channel?: string;
  campaignId?: string | null;
}): Promise<ActionResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase non configuré." };
  if (!isCallOutcome(input.outcome))
    return { ok: false, error: "Issue d'appel invalide." };

  const meta = callOutcomes[input.outcome];
  const metadata: Record<string, unknown> = {
    outcome: input.outcome,
    outcome_label: meta.label,
    reached: meta.reached,
    channel: input.channel ?? null,
  };
  if (input.callbackAt) metadata.callback_at = input.callbackAt;
  if (input.campaignId) metadata.campaign_id = input.campaignId;

  const { error: actErr } = await supabase.from("crm_activities").insert({
    contact_id: input.contactId,
    company_id: input.companyId ?? null,
    type: "call",
    direction: "outbound",
    sujet: meta.label,
    contenu: input.note ?? null,
    metadata,
  });
  if (actErr) return { ok: false, error: actErr.message };

  const { error: upErr } = await supabase
    .from("crm_contacts")
    .update({
      statut: meta.nextStatus,
      last_contacted_at: new Date().toISOString(),
    })
    .eq("id", input.contactId);
  if (upErr) return { ok: false, error: upErr.message };

  revalidateCrm();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Pipeline — move a contact between statuses (kanban drag)
// ---------------------------------------------------------------------------

export async function updateContactStatus(
  contactId: string,
  status: CrmStatus
): Promise<ActionResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase non configuré." };
  const { error } = await supabase
    .from("crm_contacts")
    .update({ statut: asStatus(status) })
    .eq("id", contactId);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Email — send one, with opt-out guard + history logging
// ---------------------------------------------------------------------------

export interface EmailSendResult extends ActionResult {
  contactId: string;
  skipped?: boolean;
}

async function sendToContact(
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  item: {
    contactId: string;
    subject: string;
    body: string;
    html?: string;
    channel?: string;
    campaignId?: string | null;
  }
): Promise<EmailSendResult> {
  const { data: contact, error } = await supabase
    .from("crm_contacts")
    .select("id,email,opt_out,company_id,statut")
    .eq("id", item.contactId)
    .maybeSingle();

  if (error || !contact)
    return { ok: false, contactId: item.contactId, error: "Contact introuvable." };
  if (contact.opt_out)
    return {
      ok: false,
      skipped: true,
      contactId: item.contactId,
      error: "Contact désinscrit (opt-out).",
    };
  if (!contact.email)
    return {
      ok: false,
      skipped: true,
      contactId: item.contactId,
      error: "Pas d'adresse email.",
    };

  // Honour the global opt-out ledger by email too.
  const { data: optedOut } = await supabase
    .from("crm_opt_outs")
    .select("id")
    .eq("email", contact.email)
    .maybeSingle();
  if (optedOut)
    return {
      ok: false,
      skipped: true,
      contactId: item.contactId,
      error: "Email présent dans la liste d'opt-out.",
    };

  const sent = await sendEmail({
    to: contact.email,
    subject: item.subject,
    text: item.body,
    html: item.html,
  });

  await supabase.from("crm_activities").insert({
    contact_id: contact.id,
    company_id: contact.company_id ?? null,
    type: "email",
    direction: "outbound",
    sujet: item.subject,
    contenu: item.body,
    metadata: {
      provider: "resend",
      provider_id: sent.id ?? null,
      to: contact.email,
      status: sent.ok ? "sent" : "error",
      error: sent.error ?? null,
      channel: item.channel ?? null,
      campaign_id: item.campaignId ?? null,
    },
  });

  if (sent.ok && contact.statut === "nouveau") {
    await supabase
      .from("crm_contacts")
      .update({ statut: "contacte", last_contacted_at: new Date().toISOString() })
      .eq("id", contact.id);
  } else if (sent.ok) {
    await supabase
      .from("crm_contacts")
      .update({ last_contacted_at: new Date().toISOString() })
      .eq("id", contact.id);
  }

  return {
    ok: sent.ok,
    contactId: item.contactId,
    error: sent.error,
  };
}

export async function sendEmailToContact(item: {
  contactId: string;
  subject: string;
  body: string;
  html?: string;
  channel?: string;
  campaignId?: string | null;
}): Promise<EmailSendResult> {
  const supabase = getServerSupabase();
  if (!supabase)
    return { ok: false, contactId: item.contactId, error: "Supabase non configuré." };
  const result = await sendToContact(supabase, item);
  revalidateCrm();
  return result;
}

// ---------------------------------------------------------------------------
// Email — batch (semi-auto): send a list sequentially with light throttling
// ---------------------------------------------------------------------------

export async function sendBatchEmails(
  items: {
    contactId: string;
    subject: string;
    body: string;
    html?: string;
    channel?: string;
    campaignId?: string | null;
  }[]
): Promise<{ ok: boolean; results: EmailSendResult[]; error?: string }> {
  const supabase = getServerSupabase();
  if (!supabase)
    return { ok: false, results: [], error: "Supabase non configuré." };

  const results: EmailSendResult[] = [];
  for (const item of items.slice(0, 200)) {
    // eslint-disable-next-line no-await-in-loop
    const r = await sendToContact(supabase, item);
    results.push(r);
    // gentle throttle to stay within provider rate limits
    // eslint-disable-next-line no-await-in-loop
    await new Promise((res) => setTimeout(res, 120));
  }
  revalidateCrm();
  return { ok: results.some((r) => r.ok), results };
}

// ---------------------------------------------------------------------------
// Groups (dynamic segments)
// ---------------------------------------------------------------------------

export interface IdResult extends ActionResult {
  id?: string;
}

export async function createGroup(input: {
  name: string;
  description?: string;
  color?: string;
  rules: GroupRules;
}): Promise<IdResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase non configuré." };
  if (!input.name.trim()) return { ok: false, error: "Nom requis." };
  const { data, error } = await supabase
    .from("crm_groups")
    .insert({
      name: input.name.trim(),
      description: input.description ?? null,
      color: input.color ?? "#6366f1",
      rules: input.rules ?? {},
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true, id: data?.id };
}

export async function updateGroup(
  id: string,
  patch: { name?: string; description?: string; color?: string; rules?: GroupRules }
): Promise<ActionResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase non configuré." };
  const { error } = await supabase
    .from("crm_groups")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

export async function deleteGroup(id: string): Promise<ActionResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase non configuré." };
  const { error } = await supabase.from("crm_groups").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export async function createCampaign(input: {
  name: string;
  kind: "email" | "call";
  groupId: string;
  template?: Record<string, unknown>;
}): Promise<IdResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase non configuré." };
  if (!input.name.trim()) return { ok: false, error: "Nom requis." };
  if (!input.groupId) return { ok: false, error: "Groupe cible requis." };
  const { data, error } = await supabase
    .from("crm_campaigns")
    .insert({
      name: input.name.trim(),
      kind: input.kind,
      group_id: input.groupId,
      template: input.template ?? {},
      status: "draft",
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true, id: data?.id };
}

export async function updateCampaign(
  id: string,
  patch: { name?: string; template?: Record<string, unknown> }
): Promise<ActionResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase non configuré." };
  const { error } = await supabase
    .from("crm_campaigns")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

export async function setCampaignStatus(
  id: string,
  status: "draft" | "active" | "paused" | "done"
): Promise<ActionResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase non configuré." };
  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "active") patch.started_at = new Date().toISOString();
  if (status === "done") patch.completed_at = new Date().toISOString();
  const { error } = await supabase
    .from("crm_campaigns")
    .update(patch)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase non configuré." };
  const { error } = await supabase.from("crm_campaigns").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

/**
 * Launch an email campaign: mark it active and send the (already personalized)
 * batch, tagging every send with the campaign id for stats/tracking.
 */
export async function launchEmailCampaign(
  campaignId: string,
  items: {
    contactId: string;
    subject: string;
    body: string;
    html?: string;
    channel?: string;
  }[]
): Promise<{ ok: boolean; results: EmailSendResult[]; error?: string }> {
  const supabase = getServerSupabase();
  if (!supabase)
    return { ok: false, results: [], error: "Supabase non configuré." };

  await supabase
    .from("crm_campaigns")
    .update({ status: "active", started_at: new Date().toISOString() })
    .eq("id", campaignId);

  const tagged = items.map((i) => ({ ...i, campaignId }));
  return sendBatchEmails(tagged);
}

/**
 * Send a one-off test of a campaign's email to an arbitrary address (e.g. the
 * owner) for visual validation before a mass send. Resolves the campaign
 * template (incl. presets) and personalizes with neutral sample values.
 */
export async function sendCampaignTest(
  campaignId: string,
  toEmail: string
): Promise<ActionResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase non configuré." };
  if (!toEmail || !toEmail.includes("@"))
    return { ok: false, error: "Adresse email de test invalide." };

  const { data, error } = await supabase
    .from("crm_campaigns")
    .select("template")
    .eq("id", campaignId)
    .maybeSingle();
  if (error || !data) return { ok: false, error: "Campagne introuvable." };

  const template = (data.template ?? {}) as {
    preset?: string;
    subject?: string;
    body?: string;
    html?: string;
  };
  const preset = getPreset(template.preset);
  const subjectRaw = template.subject ?? preset?.subject ?? "Test campagne";
  const htmlRaw = template.html ?? preset?.html;
  const textRaw = template.body ?? preset?.text ?? "Test";

  // Neutral personalization (no real contact): drop merge fields gracefully.
  const fill = (s: string) =>
    s
      .replaceAll("{{prenom}}", "")
      .replaceAll("{{nom}}", "")
      .replaceAll("{{fonction}}", "votre fonction")
      .replaceAll("{{entreprise}}", "votre entreprise")
      .replaceAll("{{ville}}", "Maurice")
      .replace(/Bonjour\s+,/g, "Bonjour,");

  const sent = await sendEmail({
    to: toEmail,
    subject: `[TEST] ${fill(subjectRaw)}`,
    text: fill(textRaw),
    html: htmlRaw ? fill(htmlRaw) : undefined,
  });
  if (!sent.ok) return { ok: false, error: sent.error };
  return { ok: true };
}
