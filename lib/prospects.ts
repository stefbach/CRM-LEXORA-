import type { CrmStatus } from "./crm-meta";

export type Channel = "pme" | "cabinet" | "daf" | "finance";

export interface Prospect {
  id: string;
  companyId: string | null;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  company: string | null;
  channel: Channel;
  channelLabel: string | null;
  sector: string | null;
  headcount: string | number | null;
  city: string | null;
  email: string | null;
  emailStatus: string | null;
  phone: string | null;
  linkedin: string | null;
  score: number | null;
  priority: string | null;
  note: string | null;
  /** raw pipeline status (Postgres enum crm_prospect_status) */
  status: CrmStatus;
  optOut: boolean;
  lastContactedAt: string | null;
  source: string | null;
}

export const channelMeta: Record<
  Channel,
  { label: string; short: string; color: string }
> = {
  pme: { label: "Client direct PME", short: "PME", color: "#6366f1" },
  cabinet: { label: "Cabinet partenaire", short: "Cabinet", color: "#10b981" },
  daf: { label: "DAF Premium (direct)", short: "DAF", color: "#f59e0b" },
  finance: { label: "Services financiers", short: "Finance", color: "#06b6d4" },
};

export const priorityMeta: Record<string, string> = {
  "A+": "#ec4899",
  A: "#f59e0b",
  B: "#3b82f6",
  Direct: "#8b5cf6",
};

export function fullName(p: Prospect) {
  return `${p.firstName} ${p.lastName}`.trim() || "Sans nom";
}

export function prospectStats(list: Prospect[]) {
  const total = list.length;
  const withEmail = list.filter((p) => p.email).length;
  const withPhone = list.filter((p) => p.phone).length;
  const verified = list.filter((p) => p.emailStatus === "Vérifié").length;

  const byChannel = (Object.keys(channelMeta) as Channel[]).map((ch) => ({
    channel: ch,
    label: channelMeta[ch].short,
    color: channelMeta[ch].color,
    count: list.filter((p) => p.channel === ch).length,
  }));

  const hot = list.filter(
    (p) => p.priority === "A+" || p.priority === "A"
  ).length;

  return { total, withEmail, withPhone, verified, byChannel, hot };
}
