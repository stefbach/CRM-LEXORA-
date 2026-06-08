// Email-safe HTML templates (preset campaigns). Pure strings — no server-only
// import — so the campaign runner can import them client-side for live preview
// and personalization. Table-based layout, inline styles, web-safe fonts and
// bulletproof buttons so it renders consistently across Gmail / Outlook / Apple
// Mail. This is a faithful, full-length adaptation of the Lexora presentation
// page (hero, fondateur, parcours, principe, 4 piliers, écosystème, liens, CTA)
// — not a cut-down summary. Merge fields use {{...}} like lib/templates.ts.

export interface EmailPreset {
  subject: string;
  html: string;
  text: string;
}

const PRESENTATION_FR = "https://lexora-presentation.vercel.app/fr";
const PRESENTATION_EN = "https://lexora-presentation.vercel.app/en";
const RDV_URL = "https://www.lexora.finance/rdv";
const SITE_URL = "https://www.lexora.finance/";
const TIBOK_URL = "https://tibok.mu";
const AXON_URL = "https://axon-ai.tech/";
const DDS_URL = "https://www.digital-data-solutions.net/";
const TEL = "+230 5259 1043";
const ADDRESS = "Bourdet Road, Grand Baie · Maurice";
// Hosted from the CRM's own public/ folder (base64/AVIF don't render in email).
const FOUNDER_IMG = "https://crm-lexora.vercel.app/lexora-founder.jpg";

const BG = "#090E29";
const PANEL = "#0D1539";
const PANEL2 = "#111A42";
const INK = "#F2F4FB";
const TEXT = "#DCE0EE";
const MUTED = "#8B92AE";
const GOLD = "#E3C447";
const GREEN = "#34C68C";
const LINE = "#232C52";

const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "Arial,Helvetica,sans-serif";
const MONO = "'Courier New',monospace";

function label(text: string, color = GOLD): string {
  return `<div style="font-family:${MONO};font-size:11px;letter-spacing:3px;color:${color};text-transform:uppercase;">— ${text}</div>`;
}

function h2(text: string): string {
  return `<h2 style="margin:14px 0 0 0;font-family:${SERIF};font-weight:normal;font-size:27px;line-height:1.12;color:${INK};">${text}</h2>`;
}

function lead(text: string): string {
  return `<p style="margin:16px 0 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${MUTED};">${text}</p>`;
}

function sectionTd(inner: string): string {
  return `<tr><td style="padding:34px 8px 0 8px;">${inner}</td></tr>`;
}

function button(label: string, href: string, filled: boolean): string {
  const bg = filled ? GOLD : "transparent";
  const color = filled ? BG : INK;
  const border = filled ? GOLD : LINE;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-block;margin:0 6px 10px 0;"><tr><td align="center" style="border-radius:999px;background:${bg};border:1px solid ${border};"><a href="${href}" target="_blank" style="display:inline-block;padding:13px 24px;font-family:${SANS};font-size:14px;font-weight:bold;color:${color};text-decoration:none;border-radius:999px;">${label}</a></td></tr></table>`;
}

function stat(big: string, small: string): string {
  return `<td align="center" style="padding:14px 6px;">
    <div style="font-family:${SERIF};font-size:26px;color:${INK};line-height:1;">${big}</div>
    <div style="font-family:${MONO};font-size:9px;letter-spacing:2px;color:${MUTED};text-transform:uppercase;margin-top:6px;">${small}</div>
  </td>`;
}

function step(num: string, kicker: string, title: string, body: string, foot: string): string {
  return `<tr><td style="padding:0 0 12px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL};border:1px solid ${LINE};border-radius:14px;">
      <tr><td style="padding:18px 20px;">
        <div style="font-family:${MONO};font-size:10px;letter-spacing:2px;color:${GOLD};">${num} · ${kicker}</div>
        <div style="font-family:${SERIF};font-size:19px;color:${INK};margin-top:8px;">${title}</div>
        <div style="font-family:${SANS};font-size:14px;line-height:1.55;color:${MUTED};margin-top:7px;">${body}</div>
        <div style="font-family:${MONO};font-size:11px;color:${GREEN};margin-top:10px;">&#8627; ${foot}</div>
      </td></tr>
    </table>
  </td></tr>`;
}

function pillar(num: string, title: string, body: string, exclusive = false): string {
  const accent = exclusive ? GREEN : GOLD;
  const border = exclusive ? "#1f5a45" : LINE;
  const bg = exclusive ? "#0c1f2a" : PANEL;
  const tag = exclusive
    ? `<span style="font-family:${MONO};font-size:8px;letter-spacing:1px;color:${GREEN};border:1px solid #1f5a45;border-radius:5px;padding:2px 6px;">EXCLUSIF</span>`
    : "";
  return `<tr><td style="padding:0 0 12px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border:1px solid ${border};border-radius:14px;">
      <tr><td style="padding:18px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-family:${MONO};font-size:11px;color:${accent};letter-spacing:1px;">/ ${num}</td>
          <td align="right">${tag}</td>
        </tr></table>
        <div style="font-family:${SERIF};font-size:19px;color:${INK};margin-top:8px;">${title}</div>
        <div style="font-family:${SANS};font-size:14px;line-height:1.55;color:${MUTED};margin-top:7px;">${body}</div>
      </td></tr>
    </table>
  </td></tr>`;
}

function ecoCard(eyebrow: string, name: string, body: string, urlLabel: string, href: string, color: string): string {
  return `<tr><td style="padding:0 0 12px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL};border:1px solid ${LINE};border-radius:14px;">
      <tr><td style="padding:18px 20px;">
        <div style="font-family:${MONO};font-size:10px;letter-spacing:2px;color:${color};text-transform:uppercase;">${eyebrow}</div>
        <div style="font-family:${SERIF};font-size:22px;color:${INK};margin:8px 0 6px 0;">${name}</div>
        <div style="font-family:${SANS};font-size:14px;line-height:1.55;color:${MUTED};">${body}</div>
        <a href="${href}" target="_blank" style="display:inline-block;margin-top:12px;font-family:${MONO};font-size:12px;color:${color};text-decoration:none;">${urlLabel} &rarr;</a>
      </td></tr>
    </table>
  </td></tr>`;
}

function linkRow(name: string, desc: string, url: string, href: string): string {
  return `<tr>
    <td style="padding:13px 4px;border-bottom:1px solid ${LINE};">
      <a href="${href}" target="_blank" style="text-decoration:none;">
        <span style="font-family:${SANS};font-size:15px;font-weight:bold;color:${INK};">${name}</span>
        <span style="font-family:${SANS};font-size:13px;color:${MUTED};"> — ${desc}</span><br>
        <span style="font-family:${MONO};font-size:11px;color:${GOLD};">${url}</span>
      </a>
    </td>
  </tr>`;
}

function proofRow(k: string, v: string, ok = false): string {
  return `<tr>
    <td style="padding:7px 0;font-family:${MONO};font-size:12px;color:${MUTED};border-bottom:1px solid ${LINE};">${k}</td>
    <td align="right" style="padding:7px 0;font-family:${MONO};font-size:12px;color:${ok ? GREEN : INK};border-bottom:1px solid ${LINE};">${v}</td>
  </tr>`;
}

function chips(items: string[]): string {
  return items
    .map(
      (c) =>
        `<span style="display:inline-block;font-family:${MONO};font-size:11px;letter-spacing:1px;color:${MUTED};border:1px solid ${LINE};border-radius:999px;padding:7px 13px;margin:0 6px 8px 0;">${c}</span>`
    )
    .join("");
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
  Vous scannez, votre gestion se fait. Lexora, l'ERP mauricien piloté par l'IA — comptabilité, paie, fiscal et juridique orchestrés par des agents IA, 24h/24.
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
  <tr>
    <td align="center" style="padding:26px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="padding:6px 8px 18px 8px;border-bottom:1px solid ${LINE};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="font-family:${SANS};font-weight:bold;font-size:22px;letter-spacing:4px;color:${INK};">LE<span style="color:${GOLD};">X</span>ORA <span style="color:${GREEN};">&bull;</span></td>
              <td align="right" style="font-family:${MONO};font-size:9px;letter-spacing:2px;color:${MUTED};text-transform:uppercase;">Intelligent accounting<br>Powered by AI</td>
            </tr></table>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:30px 8px 0 8px;">
            ${label("Le monde de demain est déjà là · Maurice 2026")}
            <h1 style="margin:18px 0 0 0;font-family:${SERIF};font-weight:normal;font-size:40px;line-height:1.04;color:${INK};">
              Vous scannez.<br><span style="color:${GOLD};font-style:italic;">Votre gestion</span> se fait.
            </h1>
            <p style="margin:20px 0 0 0;font-family:${SANS};font-size:16px;line-height:1.6;color:${TEXT};">
              Bonjour {{prenom}},
            </p>
            <p style="margin:12px 0 0 0;font-family:${SANS};font-size:16px;line-height:1.6;color:${TEXT};">
              <strong style="color:${INK};">Lexora</strong> est l'ERP mauricien piloté par l'intelligence artificielle.
              La comptabilité, la paie, le fiscal et le juridique, orchestrés par une équipe
              d'agents IA, 24h/24.
            </p>
          </td>
        </tr>

        <!-- Stats -->
        <tr>
          <td style="padding:24px 8px 0 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL};border:1px solid ${LINE};border-radius:14px;">
              <tr>
                ${stat("6", "Agents IA")}
                ${stat("7", "Modules")}
                ${stat("24/7", "Temps réel")}
                ${stat("100%", "Conforme MRA")}
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero CTA -->
        <tr>
          <td align="center" style="padding:24px 8px 0 8px;">
            ${button("Réserver une démo", RDV_URL, true)}
            ${button("Voir la présentation vidéo", PRESENTATION_FR, false)}
          </td>
        </tr>

        <!-- Fondateur -->
        <tr><td style="padding:34px 8px 0 8px;">
          ${label("Le fondateur")}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr>
              <td width="150" valign="top">
                <img src="${FOUNDER_IMG}" alt="Dr Stéphane Bach" width="140" style="width:140px;height:auto;border-radius:12px;border:1px solid ${LINE};display:block;" />
              </td>
              <td valign="top" style="padding-left:18px;">
                <div style="font-family:${SERIF};font-size:23px;line-height:1.2;color:${INK};">Médecin avant d'être bâtisseur de technologies.</div>
                <p style="margin:12px 0 0 0;font-family:${SANS};font-size:15px;line-height:1.5;color:${TEXT};">
                  <strong style="color:${INK};">Dr Stéphane Bach</strong><br>
                  <span style="font-family:${MONO};font-size:12px;color:${MUTED};">Médecin · MD, MPH · Fondateur &amp; CEO</span>
                </p>
              </td>
            </tr>
          </table>
          ${lead(
            "Près de trente ans entre la clinique, le conseil en économie hospitalière et l'entrepreneuriat. Ce que la médecine m'a appris à exiger d'un outil, je l'ai mis au cœur de chacun de nos produits : fiabilité absolue, rigueur, et la capacité à décider vite et juste."
          )}
          <p style="margin:18px 0 0 0;padding-left:18px;border-left:2px solid ${GOLD};font-family:${SERIF};font-style:italic;font-size:18px;line-height:1.45;color:${INK};">
            « Le monde de demain n'est pas une promesse. Il est déjà là — et il fonctionne. »
          </p>
        </td></tr>

        <!-- Parcours -->
        ${sectionTd(
          label("De la santé à la finance") +
            h2("Tout a commencé avec TIBOK.") +
            lead(
              "Une plateforme de téléconsultation devenue un véritable système d'exploitation de santé. C'est là, en conditions réelles — là où l'erreur n'est pas permise — que nous avons appris à maîtriser l'intelligence artificielle."
            )
        )}
        <tr><td style="padding:18px 8px 0 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${step("01", "ORIGINE", "TIBOK, le système de santé", "AI Doctor adossé à des milliers de recommandations médicales indexées, suivi des maladies chroniques par WhatsApp avec alertes proactives, correspondances spécialistes dictées par IA.", "La preuve de notre maîtrise de l'IA")}
            ${step("02", "CONVICTION", "Disruptifs par nécessité", "Ce qui mobilisait hier plusieurs équipes peut aujourd'hui être orchestré par des agents IA, sans relâche. Nous avons cessé d'attendre le futur pour le mettre en production.", "L'IA comme infrastructure")}
            ${step("03", "ABOUTISSEMENT", "Lexora, la gestion réinventée", "La même exigence, appliquée à la gestion d'entreprise. Comptabilité, paie, fiscal et juridique réunis dans une seule plateforme intelligente, conçue pour Maurice.", "Le cœur de notre offre")}
          </table>
        </td></tr>

        <!-- Le principe -->
        ${sectionTd(
          label("Lexora · le principe") +
            h2("Vous scannez. Votre comptabilité et votre paie se font.")
        )}
        <tr><td style="padding:18px 8px 0 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${pillar("A", "Une photo suffit", "Facture, reçu, relevé : l'IA lit, classe et crée l'écriture comptable en deux secondes. Zéro double saisie.")}
            ${pillar("B", "La paie intégrée", "Bulletins conformes Workers' Rights Act 2019, congés, pointage et exports MRA (PAYE, CSG, NSF) en un clic.")}
            ${pillar("C", "Propulsé par Claude (Anthropic)", "Un moteur qui s'audite seul, anticipe les échéances et rédige ses propres rapports d'expertise comptable.")}
          </table>
        </td></tr>

        <!-- Preuves : écriture + paie -->
        <tr><td style="padding:6px 8px 0 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL2};border:1px solid ${LINE};border-radius:14px;">
            <tr><td style="padding:16px 18px;">
              <div style="font-family:${MONO};font-size:10px;letter-spacing:2px;color:${GOLD};text-transform:uppercase;">Facture EL-2841 · écriture générée</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                ${proofRow("601 · Achats", "+ 12 500,00")}
                ${proofRow("4456 · TVA déductible", "+ 1 875,00")}
                ${proofRow("401 · Fournisseur", "− 14 375,00")}
              </table>
              <div style="font-family:${MONO};font-size:10px;letter-spacing:2px;color:${GREEN};text-transform:uppercase;margin-top:18px;">Bulletin de paie · Mai 2026 &nbsp;·&nbsp; WRA 2019 ✓</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                ${proofRow("Salaire de base", "Rs 48 000,00")}
                ${proofRow("CSG (salarié)", "− Rs 720,00")}
                ${proofRow("NSF", "− Rs 480,00")}
                ${proofRow("PAYE", "− Rs 3 240,00")}
                ${proofRow("Net à payer", "Rs 43 560,00", true)}
                ${proofRow("Export e-MRA", "Généré · 1 clic ✓", true)}
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Plateforme : 4 piliers -->
        ${sectionTd(
          label("Une plateforme, quatre piliers") +
            h2("Quatre mondes qui dialoguent.") +
            lead(
              "La comptabilité nourrit la paie, la paie nourrit la santé, l'IA supervise l'ensemble. Aucune autre plateforme ne combine ces quatre dimensions à Maurice."
            )
        )}
        <tr><td style="padding:18px 8px 0 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${pillar("01", "Comptabilité", "Plan Comptable Mauricien natif, grand livre, balance, bilan &amp; P&amp;L, rapprochement bancaire par IA, multi-devises IFRS / IAS.")}
            ${pillar("02", "Agents IA", "6 agents spécialisés 24/7 : OCR &amp; documents, rapprochement, juridique, RH, fiscal, facturation. Pilotage autonome des modules.")}
            ${pillar("03", "RH &amp; Paie", "Conforme WRA 2019 : bulletins PAYE, CSG, NSF, congés, pointage, planning par IA. Exports e-MRA en un clic.")}
            ${pillar("04", "Santé · TIBOK", "Téléconsultation salariés incluse — médecins agréés à Maurice, ordonnances digitales. Unique sur le marché, sans coût additionnel.", true)}
          </table>
          <div style="margin-top:8px;">
            ${chips([
              "Telegram · Chief of Staff IA · 50+ outils",
              "Moteur PCM · SYSCOHADA · Full IFRS · GBC",
              "Robot e-filing MRA",
              "7 banques mauriciennes synchronisées",
              "Facturation IRN + QR Code",
              "Voix · Photo · FR / EN",
            ])}
          </div>
        </td></tr>

        <!-- Écosystème DDS -->
        ${sectionTd(
          label("Une marque de Digital Data Solutions", GREEN) +
            h2("Une seule maison. Une même maîtrise de l'IA.") +
            lead(
              "Lexora n'avance pas seule. Elle s'inscrit dans DDS, notre holding technologique mauricienne, qui décline l'intelligence artificielle sur tous les fronts de l'entreprise."
            )
        )}
        <tr><td style="padding:18px 8px 0 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${ecoCard("Finance & Gestion", "Lexora", "L'ERP piloté par l'IA : comptabilité, paie, fiscal, juridique et santé salariés, en une seule plateforme conforme MRA.", "lexora.finance", SITE_URL, GOLD)}
            ${ecoCard("Santé", "TIBOK", "Le système d'exploitation de santé : téléconsultation, AI Doctor, suivi des maladies chroniques par WhatsApp.", "tibok.mu", TIBOK_URL, GREEN)}
            ${ecoCard("Agents IA", "Axon AI", "Des agents vocaux et textuels qui décrochent, répondent sur WhatsApp et traitent vos demandes 24h/24, en 48h.", "axon-ai.tech", AXON_URL, GOLD)}
          </table>
        </td></tr>

        <!-- Liens -->
        ${sectionTd(label("Tout découvrir") + h2("Voir, plutôt que croire."))}
        <tr><td style="padding:14px 8px 0 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL};border:1px solid ${LINE};border-radius:14px;">
            <tr><td style="padding:6px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${linkRow("Présentation vidéo · FR", "La démo guidée de Lexora en quelques minutes", "lexora-presentation.vercel.app/fr", PRESENTATION_FR)}
                ${linkRow("Video presentation · EN", "The guided Lexora demo", "lexora-presentation.vercel.app/en", PRESENTATION_EN)}
                ${linkRow("Lexora", "Le site complet : modules, agents, tarifs", "lexora.finance", SITE_URL)}
                ${linkRow("TIBOK · Santé", "Le système d'exploitation de santé", "tibok.mu", TIBOK_URL)}
                ${linkRow("Axon AI · Agents IA", "Agents vocaux & textuels, opérationnels en 48h", "axon-ai.tech", AXON_URL)}
                ${linkRow("Digital Data Solutions", "La holding technologique mauricienne", "digital-data-solutions.net", DDS_URL)}
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Final CTA -->
        <tr><td align="center" style="padding:40px 8px 0 8px;">
          <h2 style="margin:0;font-family:${SERIF};font-weight:normal;font-size:30px;line-height:1.1;color:${INK};">
            Le monde de demain <span style="color:${GOLD};font-style:italic;">fonctionne déjà.</span>
          </h2>
          <p style="margin:16px auto 0;max-width:44ch;font-family:${SANS};font-size:15px;line-height:1.6;color:${MUTED};">
            J'aimerais vous le montrer. Une démo, vos enjeux, et une vision claire de ce que
            l'IA peut faire pour {{entreprise}} dès aujourd'hui.
          </p>
          <div style="margin-top:24px;">
            ${button("Réserver mon créneau", RDV_URL, true)}
            ${button("Revoir la vidéo", PRESENTATION_FR, false)}
          </div>
          <div style="margin-top:22px;font-family:${MONO};font-size:12px;letter-spacing:1px;color:${MUTED};">
            <a href="${RDV_URL}" style="color:${GOLD};text-decoration:none;">lexora.finance/rdv</a>
            &nbsp;·&nbsp;
            <a href="tel:+23052591043" style="color:${GOLD};text-decoration:none;">${TEL}</a>
            <br>${ADDRESS}
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:34px 8px 0 8px;">
          <div style="border-top:1px solid ${LINE};padding-top:18px;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};">
            <strong style="font-family:${SANS};letter-spacing:2px;color:${TEXT};">LEXORA</strong><br>
            © 2026 Lexora — Digital Data Solutions Ltd · Tous droits réservés.<br>
            Vous recevez cet email car vous figurez dans notre base professionnelle.
            Pour ne plus recevoir nos messages, répondez « STOP » à cet email.
          </div>
        </td></tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

const presentationText = `LEXORA — Intelligent accounting, powered by AI
Le monde de demain est déjà là · Maurice 2026

Bonjour {{prenom}},

VOUS SCANNEZ. VOTRE GESTION SE FAIT.
Lexora est l'ERP mauricien piloté par l'intelligence artificielle. La comptabilité,
la paie, le fiscal et le juridique, orchestrés par une équipe d'agents IA, 24h/24.

6 Agents IA · 7 Modules intégrés · 24/7 Temps réel · 100% Conforme MRA

Réserver une démo : ${RDV_URL}
Voir la présentation vidéo : ${PRESENTATION_FR}

— LE FONDATEUR —
Dr Stéphane Bach — Médecin · MD, MPH · Fondateur & CEO.
Médecin avant d'être bâtisseur de technologies. Près de trente ans entre la clinique,
le conseil en économie hospitalière et l'entrepreneuriat. Ce que la médecine m'a appris
à exiger d'un outil, je l'ai mis au cœur de chacun de nos produits : fiabilité absolue,
rigueur, et la capacité à décider vite et juste.
« Le monde de demain n'est pas une promesse. Il est déjà là — et il fonctionne. »

— DE LA SANTÉ À LA FINANCE —
Tout a commencé avec TIBOK, une plateforme de téléconsultation devenue un véritable
système d'exploitation de santé. C'est là, en conditions réelles, que nous avons appris
à maîtriser l'IA.
01 · ORIGINE — TIBOK, le système de santé : AI Doctor, suivi des maladies chroniques par
   WhatsApp, correspondances spécialistes dictées par IA.
02 · CONVICTION — Disruptifs par nécessité : ce qui mobilisait hier plusieurs équipes est
   aujourd'hui orchestré par des agents IA, sans relâche.
03 · ABOUTISSEMENT — Lexora : comptabilité, paie, fiscal et juridique dans une seule
   plateforme intelligente, conçue pour Maurice.

— LE PRINCIPE —
Vous scannez, votre comptabilité et votre paie se font.
• Une photo suffit : l'IA lit, classe et crée l'écriture comptable en deux secondes.
• La paie intégrée : bulletins conformes WRA 2019, exports MRA (PAYE, CSG, NSF) en un clic.
• Propulsé par Claude (Anthropic) : un moteur qui s'audite seul et rédige ses rapports.

— UNE PLATEFORME, QUATRE PILIERS —
01 Comptabilité — PCM natif, grand livre, balance, bilan & P&L, rapprochement IA, IFRS/IAS.
02 Agents IA — 6 agents 24/7 : OCR, rapprochement, juridique, RH, fiscal, facturation.
03 RH & Paie — conforme WRA 2019, bulletins, congés, pointage, exports e-MRA en un clic.
04 Santé · TIBOK (EXCLUSIF) — téléconsultation salariés incluse, sans coût additionnel.

— ÉCOSYSTÈME · DIGITAL DATA SOLUTIONS —
Lexora (finance & gestion) : ${SITE_URL}
TIBOK (santé) : ${TIBOK_URL}
Axon AI (agents IA) : ${AXON_URL}

— TOUT DÉCOUVRIR —
Présentation FR : ${PRESENTATION_FR}
Presentation EN : ${PRESENTATION_EN}
Lexora : ${SITE_URL}
TIBOK : ${TIBOK_URL}
Axon AI : ${AXON_URL}
Digital Data Solutions : ${DDS_URL}

Le monde de demain fonctionne déjà. J'aimerais vous le montrer.
Réserver mon créneau : ${RDV_URL}
${TEL} · ${ADDRESS}

© 2026 Lexora — Digital Data Solutions Ltd.
Pour ne plus recevoir nos messages, répondez « STOP » à cet email.`;

export const emailPresets: Record<string, EmailPreset> = {
  "lexora-presentation": {
    subject: "Lexora — vous scannez, votre gestion se fait",
    html: presentationHtml,
    text: presentationText,
  },
};

export function getPreset(key: string | undefined | null): EmailPreset | null {
  if (!key) return null;
  return emailPresets[key] ?? null;
}
