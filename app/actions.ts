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
  item: { contactId: string; subject: string; body: string; channel?: string }
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
  channel?: string;
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
  items: { contactId: string; subject: string; body: string; channel?: string }[]
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
