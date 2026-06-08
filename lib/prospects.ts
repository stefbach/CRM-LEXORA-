import raw from "./prospects.json";

export type Channel = "pme" | "cabinet" | "daf" | "finance";

export interface Prospect {
  id: string;
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
  status: string;
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

const prospects = raw as Prospect[];

// ---- Data access layer ----
// Swap the body of these functions for Supabase queries later; the UI is
// written against this interface, so nothing else needs to change.

export function getAllProspects(): Prospect[] {
  return prospects;
}

export function getProspect(id: string): Prospect | undefined {
  return prospects.find((p) => p.id === id);
}

export function fullName(p: Prospect) {
  return `${p.firstName} ${p.lastName}`.trim();
}

export function prospectStats() {
  const total = prospects.length;
  const withEmail = prospects.filter((p) => p.email).length;
  const withPhone = prospects.filter((p) => p.phone).length;
  const verified = prospects.filter((p) => p.emailStatus === "Vérifié").length;

  const byChannel = (Object.keys(channelMeta) as Channel[]).map((ch) => ({
    channel: ch,
    label: channelMeta[ch].short,
    color: channelMeta[ch].color,
    count: prospects.filter((p) => p.channel === ch).length,
  }));

  const hot = prospects.filter(
    (p) => p.priority === "A+" || p.priority === "A"
  ).length;

  return { total, withEmail, withPhone, verified, byChannel, hot };
}

export const prospectCities = Array.from(
  new Set(prospects.map((p) => p.city).filter(Boolean) as string[])
).sort();
