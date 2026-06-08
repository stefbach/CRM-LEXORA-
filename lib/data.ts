import type { Company, Person, Opportunity, Activity, Stage } from "./types";

export const companies: Company[] = [
  { id: "c1", name: "Aerolux", domain: "aerolux.io", industry: "Aerospace", employees: 540, city: "Toulouse", arr: 1240000, logoColor: "#6366f1" },
  { id: "c2", name: "Northwind", domain: "northwind.co", industry: "Logistics", employees: 2100, city: "Rotterdam", arr: 3400000, logoColor: "#06b6d4" },
  { id: "c3", name: "Velvet Labs", domain: "velvet.design", industry: "SaaS", employees: 48, city: "Berlin", arr: 480000, logoColor: "#ec4899" },
  { id: "c4", name: "Solstice Energy", domain: "solstice.com", industry: "Energy", employees: 880, city: "Austin", arr: 2750000, logoColor: "#f59e0b" },
  { id: "c5", name: "Cobalt Finance", domain: "cobalt.bank", industry: "Fintech", employees: 320, city: "London", arr: 1980000, logoColor: "#3b82f6" },
  { id: "c6", name: "Mirae Bio", domain: "miraebio.kr", industry: "Biotech", employees: 160, city: "Seoul", arr: 920000, logoColor: "#10b981" },
  { id: "c7", name: "Atlas Retail", domain: "atlasretail.com", industry: "Retail", employees: 4300, city: "Chicago", arr: 5100000, logoColor: "#ef4444" },
  { id: "c8", name: "Nimbus Cloud", domain: "nimbus.dev", industry: "SaaS", employees: 95, city: "Lisbon", arr: 640000, logoColor: "#8b5cf6" },
];

export const people: Person[] = [
  { id: "p1", firstName: "Amélie", lastName: "Renard", email: "amelie@aerolux.io", phone: "+33 6 12 44 88 02", jobTitle: "VP Engineering", companyId: "c1", avatarColor: "#6366f1", city: "Toulouse", createdAt: "2026-05-21" },
  { id: "p2", firstName: "Daan", lastName: "Visser", email: "daan@northwind.co", phone: "+31 6 22 19 03 71", jobTitle: "Head of Ops", companyId: "c2", avatarColor: "#06b6d4", city: "Rotterdam", createdAt: "2026-06-01" },
  { id: "p3", firstName: "Lena", lastName: "Brandt", email: "lena@velvet.design", phone: "+49 30 555 21 90", jobTitle: "Founder & CEO", companyId: "c3", avatarColor: "#ec4899", city: "Berlin", createdAt: "2026-06-04" },
  { id: "p4", firstName: "Marcus", lastName: "Hale", email: "marcus@solstice.com", phone: "+1 512 880 4412", jobTitle: "Procurement Lead", companyId: "c4", avatarColor: "#f59e0b", city: "Austin", createdAt: "2026-05-12" },
  { id: "p5", firstName: "Priya", lastName: "Anand", email: "priya@cobalt.bank", phone: "+44 20 7946 0991", jobTitle: "CTO", companyId: "c5", avatarColor: "#3b82f6", city: "London", createdAt: "2026-06-06" },
  { id: "p6", firstName: "Jisoo", lastName: "Park", email: "jisoo@miraebio.kr", phone: "+82 2 555 0192", jobTitle: "R&D Director", companyId: "c6", avatarColor: "#10b981", city: "Seoul", createdAt: "2026-04-28" },
  { id: "p7", firstName: "Tom", lastName: "Okafor", email: "tom@atlasretail.com", phone: "+1 312 444 7781", jobTitle: "SVP Digital", companyId: "c7", avatarColor: "#ef4444", city: "Chicago", createdAt: "2026-05-30" },
  { id: "p8", firstName: "Sofia", lastName: "Costa", email: "sofia@nimbus.dev", phone: "+351 21 880 1245", jobTitle: "Product Lead", companyId: "c8", avatarColor: "#8b5cf6", city: "Lisbon", createdAt: "2026-06-07" },
  { id: "p9", firstName: "Hugo", lastName: "Martin", email: "hugo@aerolux.io", phone: "+33 6 88 12 55 91", jobTitle: "Buyer", companyId: "c1", avatarColor: "#a855f7", city: "Toulouse", createdAt: "2026-05-18" },
  { id: "p10", firstName: "Erin", lastName: "Walsh", email: "erin@cobalt.bank", phone: "+44 20 7946 1188", jobTitle: "Head of Risk", companyId: "c5", avatarColor: "#14b8a6", city: "London", createdAt: "2026-06-03" },
];

export const opportunities: Opportunity[] = [
  { id: "o1", name: "Aerolux — Platform license", companyId: "c1", ownerId: "p1", amount: 145000, stage: "negotiation", closeDate: "2026-06-25", probability: 70 },
  { id: "o2", name: "Northwind — Fleet rollout", companyId: "c2", ownerId: "p2", amount: 320000, stage: "proposal", closeDate: "2026-07-10", probability: 50 },
  { id: "o3", name: "Velvet — Annual plan", companyId: "c3", ownerId: "p3", amount: 28000, stage: "won", closeDate: "2026-06-02", probability: 100 },
  { id: "o4", name: "Solstice — Grid analytics", companyId: "c4", ownerId: "p4", amount: 210000, stage: "qualified", closeDate: "2026-08-01", probability: 35 },
  { id: "o5", name: "Cobalt — Risk suite", companyId: "c5", ownerId: "p5", amount: 188000, stage: "negotiation", closeDate: "2026-06-30", probability: 65 },
  { id: "o6", name: "Mirae — Lab integration", companyId: "c6", ownerId: "p6", amount: 92000, stage: "new", closeDate: "2026-09-15", probability: 15 },
  { id: "o7", name: "Atlas — Omnichannel", companyId: "c7", ownerId: "p7", amount: 510000, stage: "proposal", closeDate: "2026-07-22", probability: 45 },
  { id: "o8", name: "Nimbus — Team seats", companyId: "c8", ownerId: "p8", amount: 36000, stage: "qualified", closeDate: "2026-07-05", probability: 40 },
  { id: "o9", name: "Aerolux — Add-on modules", companyId: "c1", ownerId: "p9", amount: 54000, stage: "new", closeDate: "2026-08-20", probability: 20 },
  { id: "o10", name: "Cobalt — Expansion", companyId: "c5", ownerId: "p10", amount: 120000, stage: "lost", closeDate: "2026-05-28", probability: 0 },
  { id: "o11", name: "Atlas — Loyalty engine", companyId: "c7", ownerId: "p7", amount: 240000, stage: "won", closeDate: "2026-05-15", probability: 100 },
  { id: "o12", name: "Northwind — Customs API", companyId: "c2", ownerId: "p2", amount: 76000, stage: "negotiation", closeDate: "2026-07-01", probability: 60 },
];

export const activities: Activity[] = [
  { id: "a1", type: "call", title: "Discovery call with Amélie", personId: "p1", companyId: "c1", when: "2026-06-08", done: false },
  { id: "a2", type: "email", title: "Sent proposal to Northwind", personId: "p2", companyId: "c2", when: "2026-06-07", done: true },
  { id: "a3", type: "meeting", title: "Onboarding kickoff — Velvet", personId: "p3", companyId: "c3", when: "2026-06-09", done: false },
  { id: "a4", type: "task", title: "Prepare ROI deck for Solstice", personId: "p4", companyId: "c4", when: "2026-06-10", done: false },
  { id: "a5", type: "note", title: "Priya prefers Q3 start", personId: "p5", companyId: "c5", when: "2026-06-06", done: true },
  { id: "a6", type: "call", title: "Follow-up with Tom on pricing", personId: "p7", companyId: "c7", when: "2026-06-08", done: false },
  { id: "a7", type: "email", title: "Trial extension for Nimbus", personId: "p8", companyId: "c8", when: "2026-06-05", done: true },
];

export const stageMeta: Record<Stage, { label: string; color: string }> = {
  new: { label: "New", color: "#64748b" },
  qualified: { label: "Qualified", color: "#3b82f6" },
  proposal: { label: "Proposal", color: "#8b5cf6" },
  negotiation: { label: "Negotiation", color: "#f59e0b" },
  won: { label: "Won", color: "#10b981" },
  lost: { label: "Lost", color: "#ef4444" },
};

export const pipelineStages: Stage[] = ["new", "qualified", "proposal", "negotiation", "won"];

export function companyById(id: string) {
  return companies.find((c) => c.id === id);
}

export function personById(id: string) {
  return people.find((p) => p.id === id);
}

// ---- Derived dashboard metrics ----

export const revenueTrend = [
  { month: "Jan", revenue: 182, deals: 12 },
  { month: "Feb", revenue: 224, deals: 15 },
  { month: "Mar", revenue: 198, deals: 11 },
  { month: "Apr", revenue: 281, deals: 18 },
  { month: "May", revenue: 342, deals: 22 },
  { month: "Jun", revenue: 410, deals: 27 },
];

export function pipelineByStage() {
  return pipelineStages.map((s) => ({
    stage: stageMeta[s].label,
    value: opportunities
      .filter((o) => o.stage === s)
      .reduce((acc, o) => acc + o.amount, 0),
    fill: stageMeta[s].color,
  }));
}

export function totalPipeline() {
  return opportunities
    .filter((o) => o.stage !== "lost" && o.stage !== "won")
    .reduce((a, o) => a + o.amount, 0);
}

export function wonThisQuarter() {
  return opportunities
    .filter((o) => o.stage === "won")
    .reduce((a, o) => a + o.amount, 0);
}

export function weightedForecast() {
  return Math.round(
    opportunities
      .filter((o) => o.stage !== "lost" && o.stage !== "won")
      .reduce((a, o) => a + (o.amount * o.probability) / 100, 0)
  );
}

export function winRate() {
  const closed = opportunities.filter((o) => o.stage === "won" || o.stage === "lost");
  if (closed.length === 0) return 0;
  const won = closed.filter((o) => o.stage === "won").length;
  return Math.round((won / closed.length) * 100);
}
