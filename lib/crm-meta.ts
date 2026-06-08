// Client-safe CRM metadata. NO server imports here — this module is imported by
// both Server Components and "use client" components.

// ---------------------------------------------------------------------------
// Pipeline status — mirrors the Postgres enum `crm_prospect_status` on Supabase
// (nouveau, a_qualifier, qualifie, contacte, en_discussion, gagne, perdu, opt_out)
// ---------------------------------------------------------------------------

export type CrmStatus =
  | "nouveau"
  | "a_qualifier"
  | "qualifie"
  | "contacte"
  | "en_discussion"
  | "gagne"
  | "perdu"
  | "opt_out";

export const ALL_STATUSES: CrmStatus[] = [
  "nouveau",
  "a_qualifier",
  "qualifie",
  "contacte",
  "en_discussion",
  "gagne",
  "perdu",
  "opt_out",
];

export const statusMeta: Record<
  CrmStatus,
  { label: string; short: string; color: string }
> = {
  nouveau: { label: "À contacter", short: "À contacter", color: "#64748b" },
  a_qualifier: { label: "À rappeler / relancer", short: "À rappeler", color: "#f59e0b" },
  qualifie: { label: "Qualifié", short: "Qualifié", color: "#3b82f6" },
  contacte: { label: "Contacté", short: "Contacté", color: "#8b5cf6" },
  en_discussion: { label: "En discussion", short: "Discussion", color: "#06b6d4" },
  gagne: { label: "Gagné", short: "Gagné", color: "#10b981" },
  perdu: { label: "Pas intéressé", short: "Perdu", color: "#ef4444" },
  opt_out: { label: "Désinscrit (opt-out)", short: "Opt-out", color: "#475569" },
};

export function asStatus(v: unknown): CrmStatus {
  return ALL_STATUSES.includes(v as CrmStatus) ? (v as CrmStatus) : "nouveau";
}

// Columns shown on the pipeline board, in order.
export const pipelineColumns: CrmStatus[] = [
  "nouveau",
  "a_qualifier",
  "contacte",
  "en_discussion",
  "gagne",
  "perdu",
];

// ---------------------------------------------------------------------------
// Call outcomes — the "flux d'appel". Each outcome moves the contact to a
// resulting pipeline status and optionally schedules a callback.
// ---------------------------------------------------------------------------

export type CallOutcome =
  | "joint_interesse"
  | "joint_rappeler"
  | "joint_pas_interesse"
  | "pas_joint"
  | "messagerie"
  | "mauvais_numero";

export const callOutcomes: Record<
  CallOutcome,
  {
    label: string;
    short: string;
    color: string;
    nextStatus: CrmStatus;
    /** whether this outcome should prompt for / default a callback date */
    callback: boolean;
    reached: boolean;
  }
> = {
  joint_interesse: {
    label: "Joint · intéressé",
    short: "Intéressé",
    color: "#10b981",
    nextStatus: "en_discussion",
    callback: true,
    reached: true,
  },
  joint_rappeler: {
    label: "Joint · à rappeler",
    short: "À rappeler",
    color: "#f59e0b",
    nextStatus: "contacte",
    callback: true,
    reached: true,
  },
  joint_pas_interesse: {
    label: "Joint · pas intéressé",
    short: "Pas intéressé",
    color: "#ef4444",
    nextStatus: "perdu",
    callback: false,
    reached: true,
  },
  pas_joint: {
    label: "Pas joint",
    short: "Pas joint",
    color: "#64748b",
    nextStatus: "a_qualifier",
    callback: true,
    reached: false,
  },
  messagerie: {
    label: "Messagerie vocale",
    short: "Messagerie",
    color: "#8b5cf6",
    nextStatus: "a_qualifier",
    callback: true,
    reached: false,
  },
  mauvais_numero: {
    label: "Mauvais numéro",
    short: "Mauvais n°",
    color: "#475569",
    nextStatus: "a_qualifier",
    callback: false,
    reached: false,
  },
};

export const CALL_OUTCOME_KEYS = Object.keys(callOutcomes) as CallOutcome[];

export function isCallOutcome(v: unknown): v is CallOutcome {
  return typeof v === "string" && v in callOutcomes;
}
