import { NextResponse } from "next/server";
import { sendEmail, emailConfigured, emailFrom } from "@/lib/email";

export const dynamic = "force-dynamic";

// Temporary diagnostic endpoint to verify Resend is wired correctly.
// Guarded by a token and hard-locked to the workspace owner's inbox so it can
// never be used to email prospects. Remove after validation.
const TEST_TOKEN = "lx-diag-7f3a9c2e51";
const OWNER_EMAIL = "sbach1964@gmail.com";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("token") !== TEST_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const configured = emailConfigured();
  const from = emailFrom();

  if (!configured) {
    return NextResponse.json({
      configured: false,
      from,
      hint: "RESEND_API_KEY et/ou RESEND_FROM manquants dans l'environnement Production.",
    });
  }

  const result = await sendEmail({
    to: OWNER_EMAIL,
    subject: "Test Lexora CRM — Resend ✅",
    text: `Ceci est un email de test envoyé par le CRM Lexora via Resend.\n\nSi vous le recevez, l'envoi en lot et unitaire est opérationnel.\n\n— Lexora`,
  });

  return NextResponse.json({
    configured: true,
    from,
    to: OWNER_EMAIL,
    sent: result.ok,
    id: result.id ?? null,
    error: result.error ?? null,
  });
}
