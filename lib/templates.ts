import type { Channel, Prospect } from "./prospects";
import { fullName } from "./prospects";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface CallScript {
  id: string;
  name: string;
  sections: { label: string; text: string }[];
}

// Merge fields: {{prenom}} {{nom}} {{fonction}} {{entreprise}} {{ville}} {{moi}}
export const SENDER = "Stéphane — Lexora";

export function personalize(template: string, p: Prospect): string {
  return template
    .replaceAll("{{prenom}}", p.firstName || "")
    .replaceAll("{{nom}}", p.lastName || "")
    .replaceAll("{{fonction}}", p.jobTitle || "votre fonction")
    .replaceAll("{{entreprise}}", p.company || "votre entreprise")
    .replaceAll("{{ville}}", p.city || "Maurice")
    .replaceAll("{{moi}}", SENDER)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ---------------------------------------------------------------------------
// EMAIL TEMPLATES — one tailored default per channel
// ---------------------------------------------------------------------------

export const emailTemplates: Record<Channel, EmailTemplate[]> = {
  pme: [
    {
      id: "pme-intro",
      name: "Prise de contact PME",
      subject: "{{entreprise}} — externaliser votre gestion financière",
      body: `Bonjour {{prenom}},

Je me permets de vous écrire en tant que {{fonction}} chez {{entreprise}}.

Chez Lexora, nous aidons les PME mauriciennes à externaliser leur comptabilité et leur direction financière (DAF externalisé) : clôtures plus rapides, tableaux de bord clairs, et un interlocuteur unique — sans le coût d'une équipe interne.

Auriez-vous 15 minutes cette semaine pour un échange rapide ? Je vous montre concrètement ce que ça donnerait pour {{entreprise}}.

Bien à vous,
{{moi}}`,
    },
  ],
  cabinet: [
    {
      id: "cabinet-partner",
      name: "Partenariat cabinet",
      subject: "Partenariat Lexora × {{entreprise}}",
      body: `Bonjour {{prenom}},

En tant que {{fonction}} chez {{entreprise}}, vous gérez sûrement des pics de charge sur les clôtures et la production comptable.

Lexora travaille en marque blanche avec les cabinets et fiduciaires à Maurice : nous absorbons votre surcharge (saisie, révision, reporting) pour que vos équipes restent concentrées sur le conseil à forte valeur.

Seriez-vous ouvert à un appel de 15 minutes pour explorer un partenariat ?

Bien cordialement,
{{moi}}`,
    },
  ],
  daf: [
    {
      id: "daf-premium",
      name: "DAF Premium",
      subject: "Renfort financier à la demande pour {{entreprise}}",
      body: `Bonjour {{prenom}},

Votre rôle de {{fonction}} chez {{entreprise}} implique sans doute des projets (reporting groupe, budgets, financements) qui dépassent parfois la bande passante de l'équipe.

Lexora met à disposition des profils DAF/contrôle de gestion seniors, à la mission ou au forfait mensuel — opérationnels immédiatement, sans recrutement.

Puis-je vous proposer un créneau de 20 minutes pour voir où nous pourrions vous être utiles ?

Bien à vous,
{{moi}}`,
    },
  ],
  finance: [
    {
      id: "finance-intro",
      name: "Services financiers",
      subject: "Lexora — capacité financière externalisée",
      body: `Bonjour {{prenom}},

Je vous contacte concernant {{entreprise}}. En tant que {{fonction}}, la fiabilité du reporting et la conformité sont au cœur de vos enjeux.

Lexora accompagne les acteurs financiers à Maurice sur la production comptable, le contrôle et le reporting réglementaire, avec des équipes dédiées et des SLA clairs.

Auriez-vous un moment cette semaine pour en discuter ?

Cordialement,
{{moi}}`,
    },
  ],
};

// ---------------------------------------------------------------------------
// CALL SCRIPTS — one per channel
// ---------------------------------------------------------------------------

export const callScripts: Record<Channel, CallScript> = {
  pme: {
    id: "call-pme",
    name: "Script PME",
    sections: [
      { label: "Accroche", text: `Bonjour {{prenom}}, {{moi}}. Je vous appelle car nous aidons des PME comme {{entreprise}} à externaliser leur compta et leur gestion financière. Vous avez deux minutes ?` },
      { label: "Découverte", text: `Aujourd'hui, qui s'occupe de la comptabilité et du suivi financier chez {{entreprise}} ? Qu'est-ce qui vous prend le plus de temps ou vous inquiète le plus ?` },
      { label: "Valeur", text: `Nous prenons en charge la saisie, les clôtures et un reporting mensuel clair — vous gardez la visibilité sans gérer l'opérationnel ni recruter.` },
      { label: "Objection « on a déjà un comptable »", text: `Parfait, beaucoup de nos clients aussi. On vient en complément sur le pilotage et le reporting, là où un comptable s'arrête souvent.` },
      { label: "Closing", text: `Je vous propose un point de 15 min cette semaine pour vous montrer un exemple concret. Jeudi 11h ou vendredi 15h, qu'est-ce qui vous arrange ?` },
    ],
  },
  cabinet: {
    id: "call-cabinet",
    name: "Script Cabinet partenaire",
    sections: [
      { label: "Accroche", text: `Bonjour {{prenom}}, {{moi}}. J'appelle {{entreprise}} car nous travaillons en marque blanche avec les cabinets à Maurice sur la production comptable. Vous êtes la bonne personne ?` },
      { label: "Découverte", text: `Comment gérez-vous les pics de charge en période de clôture ? Vous arrive-t-il de refuser des dossiers faute de capacité ?` },
      { label: "Valeur", text: `On absorbe votre surcharge (saisie, révision, reporting) sous votre marque. Vos équipes restent sur le conseil, vous tenez les délais.` },
      { label: "Objection « confidentialité »", text: `On signe un NDA et on travaille sur vos outils. Vous gardez la relation client, on reste invisibles.` },
      { label: "Closing", text: `On se cale 15 minutes pour cadrer un test sur un ou deux dossiers ? Je peux mardi ou mercredi matin.` },
    ],
  },
  daf: {
    id: "call-daf",
    name: "Script DAF Premium",
    sections: [
      { label: "Accroche", text: `Bonjour {{prenom}}, {{moi}}. En tant que {{fonction}} chez {{entreprise}}, vous jonglez sûrement avec plus de projets que de temps disponible. C'est pour ça que j'appelle.` },
      { label: "Découverte", text: `Quels chantiers financiers aimeriez-vous avancer mais n'avez pas la bande passante pour traiter en interne ?` },
      { label: "Valeur", text: `On met à disposition des profils DAF/contrôle de gestion seniors, à la mission ou au forfait — opérationnels tout de suite, sans recrutement.` },
      { label: "Objection « budget »", text: `C'est de la capacité à la demande : vous payez l'usage, pas un poste fixe. Souvent moins cher qu'un mi-temps senior.` },
      { label: "Closing", text: `Je vous propose 20 minutes pour identifier un premier chantier. Vous préférez en fin de semaine ou début de semaine prochaine ?` },
    ],
  },
  finance: {
    id: "call-finance",
    name: "Script Services financiers",
    sections: [
      { label: "Accroche", text: `Bonjour {{prenom}}, {{moi}}. J'appelle {{entreprise}} concernant la production comptable et le reporting réglementaire. Vous avez un instant ?` },
      { label: "Découverte", text: `Comment est organisée aujourd'hui votre production financière et votre reporting de conformité ? Où sont les tensions ?` },
      { label: "Valeur", text: `On opère avec des équipes dédiées et des SLA clairs sur la compta, le contrôle et le reporting — fiabilité et délais maîtrisés.` },
      { label: "Objection « réglementé »", text: `On connaît les contraintes du secteur à Maurice. Process documentés, piste d'audit, et vos contrôles internes restent souverains.` },
      { label: "Closing", text: `On prend 20 minutes pour voir un périmètre pilote ? Je peux vous envoyer deux créneaux par mail juste après.` },
    ],
  },
};

export function buildMailto(p: Prospect, t: EmailTemplate): string {
  const subject = encodeURIComponent(personalize(t.subject, p));
  const body = encodeURIComponent(personalize(t.body, p));
  return `mailto:${p.email ?? ""}?subject=${subject}&body=${body}`;
}

export function callTitle(p: Prospect) {
  return `Appel — ${fullName(p)}`;
}
