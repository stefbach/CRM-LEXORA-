// Client-safe group/segment rules. A "groupe" is a saved set of criteria;
// membership is computed dynamically against the contact base — no membership
// table, contacts move in/out automatically as their data changes.

import { channelMeta, type Channel, type Prospect } from "./prospects";
import { statusMeta, type CrmStatus } from "./crm-meta";

export interface GroupRules {
  channels?: Channel[];
  priorities?: string[]; // "A+", "A", "B", "Direct"
  statuses?: CrmStatus[];
  cities?: string[];
  sectors?: string[]; // substring match (case-insensitive) on sector
  hasEmail?: boolean;
  hasPhone?: boolean;
  search?: string;
}

export function matchesRules(p: Prospect, r: GroupRules): boolean {
  if (r.channels && r.channels.length && !r.channels.includes(p.channel))
    return false;
  if (
    r.priorities &&
    r.priorities.length &&
    !(p.priority && r.priorities.includes(p.priority))
  )
    return false;
  if (r.statuses && r.statuses.length && !r.statuses.includes(p.status))
    return false;
  if (r.hasEmail && !p.email) return false;
  if (r.hasPhone && !p.phone) return false;
  if (r.cities && r.cities.length) {
    const city = (p.city ?? "").toLowerCase();
    if (!r.cities.some((c) => city === c.toLowerCase())) return false;
  }
  if (r.sectors && r.sectors.length) {
    const sector = (p.sector ?? "").toLowerCase();
    if (!r.sectors.some((s) => sector.includes(s.toLowerCase()))) return false;
  }
  if (r.search && r.search.trim()) {
    const needle = r.search.trim().toLowerCase();
    const hay = `${p.firstName} ${p.lastName} ${p.company ?? ""} ${
      p.jobTitle ?? ""
    } ${p.city ?? ""} ${p.email ?? ""}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

export function filterByRules(list: Prospect[], r: GroupRules): Prospect[] {
  return list.filter((p) => matchesRules(p, r));
}

export function isEmptyRules(r: GroupRules): boolean {
  return (
    !(r.channels && r.channels.length) &&
    !(r.priorities && r.priorities.length) &&
    !(r.statuses && r.statuses.length) &&
    !(r.cities && r.cities.length) &&
    !(r.sectors && r.sectors.length) &&
    !r.hasEmail &&
    !r.hasPhone &&
    !(r.search && r.search.trim())
  );
}

export function describeRules(r: GroupRules): string {
  const parts: string[] = [];
  if (r.channels?.length)
    parts.push(r.channels.map((c) => channelMeta[c].short).join("/"));
  if (r.priorities?.length) parts.push(`prio ${r.priorities.join("/")}`);
  if (r.statuses?.length)
    parts.push(r.statuses.map((s) => statusMeta[s].short).join("/"));
  if (r.cities?.length) parts.push(r.cities.join("/"));
  if (r.sectors?.length) parts.push(r.sectors.join("/"));
  if (r.hasEmail) parts.push("email connu");
  if (r.hasPhone) parts.push("tél connu");
  if (r.search?.trim()) parts.push(`« ${r.search.trim()} »`);
  return parts.length ? parts.join(" · ") : "Tous les contacts";
}
