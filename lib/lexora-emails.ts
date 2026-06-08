// Email-safe HTML templates (preset campaigns). Pure strings — no server-only
// import — so the campaign runner can import them client-side for live preview
// and personalization. Table-based layout, inline styles, web-safe fonts and
// bulletproof buttons so it renders consistently across Gmail / Outlook / Apple
// Mail. Merge fields use the same {{...}} syntax as lib/templates.ts.

export interface EmailPreset {
  subject: string;
  html: string;
  text: string;
}

const PRESENTATION_URL = "https://lexora-presentation.vercel.app/fr";
const RDV_URL = "https://www.lexora.finance/rdv";
const SITE_URL = "https://www.lexora.finance/";
const TEL = "+230 5259 1043";

const BG = "#090E29";
const PANEL = "#0D1539";
const INK = "#F2F4FB";
const TEXT = "#DCE0EE";
const MUTED = "#8B92AE";
const GOLD = "#E3C447";
const GREEN = "#34C68C";
const LINE = "#232C52";

function pillar(title: string, body: string, accent = GOLD): string {
  return `
  <tr>
    <td style="padding:0 0 14px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL};border:1px solid ${LINE};border-radius:14px;">
        <tr>
          <td style="padding:18px 20px;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:${INK};font-weight:bold;">
              <span style="color:${accent};">›</span>&nbsp;${title}
            </div>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:${MUTED};margin-top:7px;">${body}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function button(label: string, href: string, filled: boolean): string {
  const bg = filled ? GOLD : "transparent";
  const color = filled ? BG : INK;
  const border = filled ? GOLD : LINE;
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-block;margin:0 6px 10px 0;">
    <tr>
      <td align="center" style="border-radius:999px;background:${bg};border:1px solid ${border};">
        <a href="${href}" target="_blank"
           style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${color};text-decoration:none;border-radius:999px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

const presentationHtml = `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>LEXORA</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${BG};">
  Vous scannez, votre comptabilité et votre paie se font. Lexora, l'ERP mauricien piloté par l'IA.
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
  <tr>
    <td align="center" style="padding:28px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="padding:6px 8px 22px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:22px;letter-spacing:3px;color:${INK};">
                  LEXORA <span style="color:${GREEN};">&bull;</span>
                </td>
                <td align="right" style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:${MUTED};text-transform:uppercase;">
                  L'ERP piloté par l'IA
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:0 8px;">
            <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;color:${GOLD};text-transform:uppercase;">
              — Présentation
            </div>
            <h1 style="margin:16px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:38px;line-height:1.08;color:${INK};">
              Vous scannez.<br>Votre comptabilité<br>et votre paie <span style="color:${GOLD};font-style:italic;">se font.</span>
            </h1>
            <p style="margin:22px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:${TEXT};">
              Bonjour {{prenom}},
            </p>
            <p style="margin:14px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:${TEXT};">
              <strong style="color:${INK};">Lexora</strong> est l'ERP mauricien piloté par l'intelligence
              artificielle. Vous photographiez une facture ou un reçu&nbsp;: l'écriture comptable se crée,
              la TVA se ventile, la paie se prépare. Vous gardez le pilotage, l'IA fait la saisie.
            </p>
          </td>
        </tr>

        <!-- Pillars -->
        <tr>
          <td style="padding:30px 8px 8px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${pillar("Scan &rarr; écritures automatiques", "L'IA lit vos factures, reçus et relevés et génère les écritures comptables, prêtes à valider.")}
              ${pillar("Paie mauricienne conforme", "PAYE, CSG/NSF, déclarations MRA — la paie se calcule et se déclare automatiquement, dans les règles locales.")}
              ${pillar("Pilotage en temps réel", "Trésorerie, marges et tableaux de bord à jour en continu, avec des alertes intelligentes.")}
              ${pillar("Un écosystème connecté", "Pensé pour s'intégrer à vos outils (dont TIBOK) — une suite mauricienne signée Digital Data Solutions.", GREEN)}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:26px 8px 8px 8px;">
            ${button("Voir la présentation", PRESENTATION_URL, true)}
            ${button("Prendre rendez-vous", RDV_URL, false)}
          </td>
        </tr>

        <!-- Contact -->
        <tr>
          <td align="center" style="padding:18px 8px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">
            Une question&nbsp;? Répondez simplement à cet email ou appelez le
            <a href="tel:+23052591043" style="color:${GOLD};text-decoration:none;">${TEL}</a>.
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:24px 8px;"><div style="height:1px;background:${LINE};line-height:1px;font-size:1px;">&nbsp;</div></td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 8px 8px 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">
            <strong style="color:${TEXT};">Lexora</strong> — une marque de
            <a href="${SITE_URL}" style="color:${MUTED};text-decoration:underline;">Digital Data Solutions</a>, Maurice.<br>
            Vous recevez cet email car vous figurez dans notre base professionnelle.
            Pour ne plus recevoir nos messages, répondez « STOP » à cet email.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

const presentationText = `Bonjour {{prenom}},

Lexora est l'ERP mauricien piloté par l'intelligence artificielle.
Vous photographiez une facture ou un reçu : l'écriture comptable se crée,
la TVA se ventile, la paie se prépare. Vous gardez le pilotage, l'IA fait la saisie.

• Scan → écritures automatiques : l'IA lit factures, reçus et relevés et génère les écritures.
• Paie mauricienne conforme : PAYE, CSG/NSF, déclarations MRA, automatisées.
• Pilotage en temps réel : trésorerie, marges et tableaux de bord en continu.
• Un écosystème connecté (dont TIBOK), signé Digital Data Solutions.

Voir la présentation : ${PRESENTATION_URL}
Prendre rendez-vous : ${RDV_URL}

Une question ? Répondez à cet email ou appelez le ${TEL}.

Lexora — une marque de Digital Data Solutions, Maurice.
Pour ne plus recevoir nos messages, répondez « STOP » à cet email.`;

export const emailPresets: Record<string, EmailPreset> = {
  "lexora-presentation": {
    subject: "Lexora — vous scannez, votre comptabilité et votre paie se font",
    html: presentationHtml,
    text: presentationText,
  },
};

export function getPreset(key: string | undefined | null): EmailPreset | null {
  if (!key) return null;
  return emailPresets[key] ?? null;
}
