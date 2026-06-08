import "server-only";
import { getServerSupabase, isSupabaseConfigured } from "./supabase-server";
import {
  channelMeta,
  type Channel,
  type Prospect,
} from "./prospects";
import { asStatus, statusMeta, type CrmStatus } from "./crm-meta";
import { filterByRules, type GroupRules } from "./groups";

const VALID_CHANNELS: Channel[] = ["pme", "cabinet", "daf", "finance"];

function asChannel(v: unknown): Channel {
  return VALID_CHANNELS.includes(v as Channel) ? (v as Channel) : "pme";
}

interface CompanyJoin {
  nom: string | null;
  ville: string | null;
  industrie: string | null;
  taille_effectif: string | null;
  site_web: string | null;
}

interface ContactRow {
  id: string;
  company_id: string | null;
  prenom: string | null;
  nom: string | null;
  titre: string | null;
  email: string | null;
  email_verified: boolean | null;
  telephone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  statut: string | null;
  opt_out: boolean | null;
  last_contacted_at: string | null;
  raw_data: Record<string, unknown> | null;
  company: CompanyJoin | null;
}

const CONTACT_SELECT =
  "id,company_id,prenom,nom,titre,email,email_verified,telephone,linkedin_url,notes,statut,opt_out,last_contacted_at,raw_data,company:company_id(nom,ville,industrie,taille_effectif,site_web)";

function mapContact(r: ContactRow): Prospect {
  const raw = r.raw_data ?? {};
  const scoreRaw = raw["score"];
  return {
    id: r.id,
    companyId: r.company_id,
    firstName: r.prenom ?? "",
    lastName: r.nom ?? "",
    jobTitle: r.titre,
    company: r.company?.nom ?? null,
    channel: asChannel(raw["canal"]),
    channelLabel: (raw["canal_label"] as string) ?? null,
    sector: r.company?.industrie ?? null,
    headcount: r.company?.taille_effectif ?? null,
    city: (raw["ville"] as string) ?? r.company?.ville ?? null,
    email: r.email,
    emailStatus:
      (raw["email_status"] as string) ??
      (r.email_verified ? "Vérifié" : null),
    phone: r.telephone,
    linkedin: r.linkedin_url,
    score: typeof scoreRaw === "number" ? scoreRaw : null,
    priority: (raw["priorite"] as string) ?? null,
    note: r.notes,
    status: asStatus(r.statut),
    optOut: Boolean(r.opt_out),
    lastContactedAt: r.last_contacted_at,
    source: "import_csv",
  };
}

/**
 * Loads every CRM contact from Supabase (server-side, service-role). When the
 * service key is absent it returns an empty list with live=false so the UI can
 * surface a clear "connect Supabase" state — there is no bundled demo fallback.
 */
export async function loadContacts(): Promise<{
  prospects: Prospect[];
  live: boolean;
}> {
  const supabase = getServerSupabase();
  if (!supabase) return { prospects: [], live: false };

  const { data, error } = await supabase
    .from("crm_contacts")
    .select(CONTACT_SELECT)
    .order("last_contacted_at", { ascending: false, nullsFirst: false })
    .limit(5000);

  if (error || !data) {
    return { prospects: [], live: isSupabaseConfigured };
  }

  const prospects = (data as unknown as ContactRow[]).map(mapContact);
  return { prospects, live: true };
}

export async function loadContact(id: string): Promise<Prospect | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("crm_contacts")
    .select(CONTACT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapContact(data as unknown as ContactRow);
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export interface CrmCompany {
  id: string;
  name: string;
  industry: string | null;
  city: string | null;
  size: string | null;
  website: string | null;
  status: CrmStatus;
  contacts: number;
}

export async function loadCompanies(): Promise<{
  companies: CrmCompany[];
  live: boolean;
}> {
  const supabase = getServerSupabase();
  if (!supabase) return { companies: [], live: false };

  const [{ data: comps, error }, { data: contacts }] = await Promise.all([
    supabase
      .from("crm_companies")
      .select("id,nom,industrie,ville,taille_effectif,site_web,statut")
      .order("nom", { ascending: true })
      .limit(5000),
    supabase.from("crm_contacts").select("company_id").limit(10000),
  ]);

  if (error || !comps) return { companies: [], live: isSupabaseConfigured };

  const counts = new Map<string, number>();
  for (const c of (contacts ?? []) as { company_id: string | null }[]) {
    if (c.company_id)
      counts.set(c.company_id, (counts.get(c.company_id) ?? 0) + 1);
  }

  const companies: CrmCompany[] = (
    comps as unknown as {
      id: string;
      nom: string;
      industrie: string | null;
      ville: string | null;
      taille_effectif: string | null;
      site_web: string | null;
      statut: string | null;
    }[]
  ).map((c) => ({
    id: c.id,
    name: c.nom,
    industry: c.industrie,
    city: c.ville,
    size: c.taille_effectif,
    website: c.site_web,
    status: asStatus(c.statut),
    contacts: counts.get(c.id) ?? 0,
  }));

  return { companies, live: true };
}

// ---------------------------------------------------------------------------
// Activities (history of calls / emails / notes)
// ---------------------------------------------------------------------------

export interface CrmActivity {
  id: string;
  type: string;
  direction: string | null;
  subject: string | null;
  content: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  contactName: string | null;
  companyName: string | null;
}

interface ActivityRow {
  id: string;
  type: string;
  direction: string | null;
  sujet: string | null;
  contenu: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  contact: { prenom: string | null; nom: string | null } | null;
  company: { nom: string | null } | null;
}

function mapActivity(r: ActivityRow): CrmActivity {
  const name = [r.contact?.prenom, r.contact?.nom]
    .filter(Boolean)
    .join(" ")
    .trim();
  return {
    id: r.id,
    type: r.type,
    direction: r.direction,
    subject: r.sujet,
    content: r.contenu,
    metadata: r.metadata,
    createdAt: r.created_at,
    contactName: name || null,
    companyName: r.company?.nom ?? null,
  };
}

export async function loadActivities(limit = 100): Promise<{
  activities: CrmActivity[];
  live: boolean;
}> {
  const supabase = getServerSupabase();
  if (!supabase) return { activities: [], live: false };
  const { data, error } = await supabase
    .from("crm_activities")
    .select(
      "id,type,direction,sujet,contenu,metadata,created_at,contact:contact_id(prenom,nom),company:company_id(nom)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return { activities: [], live: isSupabaseConfigured };
  return {
    activities: (data as unknown as ActivityRow[]).map(mapActivity),
    live: true,
  };
}

// ---------------------------------------------------------------------------
// Callbacks ("rappels") — call activities with a future/today callback_at
// ---------------------------------------------------------------------------

export interface Callback {
  activityId: string;
  contactId: string | null;
  contactName: string | null;
  companyName: string | null;
  callbackAt: string;
  note: string | null;
}

export async function loadCallbacks(limit = 200): Promise<Callback[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("crm_activities")
    .select(
      "id,contact_id,contenu,metadata,created_at,contact:contact_id(prenom,nom),company:company_id(nom)"
    )
    .eq("type", "call")
    .not("metadata->>callback_at", "is", null)
    .order("metadata->>callback_at", { ascending: true })
    .limit(limit);
  if (error || !data) return [];

  return (
    data as unknown as (ActivityRow & {
      contact_id: string | null;
    })[]
  ).map((r) => ({
    activityId: r.id,
    contactId: r.contact_id,
    contactName:
      [r.contact?.prenom, r.contact?.nom].filter(Boolean).join(" ").trim() ||
      null,
    companyName: r.company?.nom ?? null,
    callbackAt: String((r.metadata ?? {})["callback_at"]),
    note: r.contenu,
  }));
}

// ---------------------------------------------------------------------------
// Dashboard aggregates
// ---------------------------------------------------------------------------

export interface DashboardData {
  live: boolean;
  total: number;
  withEmail: number;
  withPhone: number;
  byStatus: { status: CrmStatus; label: string; color: string; count: number }[];
  byChannel: { channel: Channel; label: string; color: string; count: number }[];
  reached: number;
  callbacksDue: number;
  activity14: { day: string; calls: number; emails: number }[];
  recent: CrmActivity[];
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export async function loadDashboard(): Promise<DashboardData> {
  const [{ prospects, live }, { activities }, callbacks] = await Promise.all([
    loadContacts(),
    loadActivities(400),
    loadCallbacks(500),
  ]);

  const byStatus = (Object.keys(statusMeta) as CrmStatus[])
    .map((s) => ({
      status: s,
      label: statusMeta[s].short,
      color: statusMeta[s].color,
      count: prospects.filter((p) => p.status === s).length,
    }))
    .filter((s) => s.count > 0 || ["nouveau", "contacte", "en_discussion", "gagne"].includes(s.status));

  const byChannel = (Object.keys(channelMeta) as Channel[]).map((ch) => ({
    channel: ch,
    label: channelMeta[ch].short,
    color: channelMeta[ch].color,
    count: prospects.filter((p) => p.channel === ch).length,
  }));

  // 14-day activity sparkline
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const activity14 = days.map((day) => ({
    day: day.slice(5),
    calls: activities.filter(
      (a) => a.type === "call" && dayKey(a.createdAt) === day
    ).length,
    emails: activities.filter(
      (a) => a.type === "email" && dayKey(a.createdAt) === day
    ).length,
  }));

  const today = new Date().toISOString().slice(0, 10);

  return {
    live,
    total: prospects.length,
    withEmail: prospects.filter((p) => p.email).length,
    withPhone: prospects.filter((p) => p.phone).length,
    byStatus,
    byChannel,
    reached: prospects.filter((p) =>
      ["contacte", "en_discussion", "gagne"].includes(p.status)
    ).length,
    callbacksDue: callbacks.filter((c) => c.callbackAt.slice(0, 10) <= today)
      .length,
    activity14,
    recent: activities.slice(0, 6),
  };
}

// ---------------------------------------------------------------------------
// Groups (dynamic segments)
// ---------------------------------------------------------------------------

export interface CrmGroup {
  id: string;
  name: string;
  description: string | null;
  color: string;
  rules: GroupRules;
  memberCount: number;
  createdAt: string;
}

interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  rules: GroupRules | null;
  created_at: string;
}

function mapGroup(r: GroupRow, contacts: Prospect[]): CrmGroup {
  const rules = r.rules ?? {};
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    color: r.color ?? "#6366f1",
    rules,
    memberCount: filterByRules(contacts, rules).length,
    createdAt: r.created_at,
  };
}

export async function loadGroups(): Promise<{
  groups: CrmGroup[];
  contacts: Prospect[];
  live: boolean;
}> {
  const supabase = getServerSupabase();
  if (!supabase) return { groups: [], contacts: [], live: false };

  const [{ prospects, live }, { data, error }] = await Promise.all([
    loadContacts(),
    supabase
      .from("crm_groups")
      .select("id,name,description,color,rules,created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (error || !data) return { groups: [], contacts: prospects, live };
  const groups = (data as unknown as GroupRow[]).map((r) =>
    mapGroup(r, prospects)
  );
  return { groups, contacts: prospects, live };
}

export async function loadGroup(
  id: string
): Promise<{ group: CrmGroup; members: Prospect[] } | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const [{ prospects }, { data, error }] = await Promise.all([
    loadContacts(),
    supabase
      .from("crm_groups")
      .select("id,name,description,color,rules,created_at")
      .eq("id", id)
      .maybeSingle(),
  ]);
  if (error || !data) return null;
  const group = mapGroup(data as unknown as GroupRow, prospects);
  return { group, members: filterByRules(prospects, group.rules) };
}

// ---------------------------------------------------------------------------
// Campaigns (email on one side, call on the other)
// ---------------------------------------------------------------------------

export type CampaignKind = "email" | "call";
export type CampaignStatus = "draft" | "active" | "paused" | "done";

export interface CampaignStats {
  target: number;
  processed: number; // distinct contacts touched
  sent: number; // email: successful sends
  errors: number; // email: failures
  reached: number; // call: reached outcomes
  byOutcome: Record<string, number>;
}

export interface CrmCampaign {
  id: string;
  name: string;
  kind: CampaignKind;
  status: CampaignStatus;
  groupId: string | null;
  groupName: string | null;
  groupColor: string | null;
  template: Record<string, unknown>;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  stats: CampaignStats;
}

interface CampaignRow {
  id: string;
  name: string;
  kind: CampaignKind;
  status: CampaignStatus;
  group_id: string | null;
  template: Record<string, unknown> | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  group: { name: string | null; color: string | null; rules: GroupRules | null } | null;
}

interface CampaignActivityRow {
  type: string;
  contact_id: string | null;
  metadata: Record<string, unknown> | null;
}

// Aggregate per-campaign activity into a stats map.
function aggregate(rows: CampaignActivityRow[]) {
  const map = new Map<
    string,
    {
      contacts: Set<string>;
      sent: number;
      errors: number;
      reached: number;
      byOutcome: Record<string, number>;
    }
  >();
  for (const r of rows) {
    const meta = r.metadata ?? {};
    const cid = meta["campaign_id"];
    if (typeof cid !== "string") continue;
    let acc = map.get(cid);
    if (!acc) {
      acc = { contacts: new Set(), sent: 0, errors: 0, reached: 0, byOutcome: {} };
      map.set(cid, acc);
    }
    if (r.contact_id) acc.contacts.add(r.contact_id);
    if (r.type === "email") {
      if (meta["status"] === "sent") acc.sent++;
      else if (meta["status"] === "error") acc.errors++;
    } else if (r.type === "call") {
      if (meta["reached"] === true) acc.reached++;
      const o = meta["outcome"];
      if (typeof o === "string") acc.byOutcome[o] = (acc.byOutcome[o] ?? 0) + 1;
    }
  }
  return map;
}

export async function loadCampaigns(): Promise<{
  campaigns: CrmCampaign[];
  live: boolean;
}> {
  const supabase = getServerSupabase();
  if (!supabase) return { campaigns: [], live: false };

  const [{ prospects, live }, { data, error }, { data: acts }] =
    await Promise.all([
      loadContacts(),
      supabase
        .from("crm_campaigns")
        .select(
          "id,name,kind,status,group_id,template,created_at,started_at,completed_at,group:group_id(name,color,rules)"
        )
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("crm_activities")
        .select("type,contact_id,metadata")
        .not("metadata->>campaign_id", "is", null)
        .limit(20000),
    ]);

  if (error || !data) return { campaigns: [], live };

  const agg = aggregate((acts ?? []) as CampaignActivityRow[]);

  const campaigns = (data as unknown as CampaignRow[]).map((r) => {
    const rules = r.group?.rules ?? {};
    const target = r.group ? filterByRules(prospects, rules).length : 0;
    const a = agg.get(r.id);
    const stats: CampaignStats = {
      target,
      processed: a ? a.contacts.size : 0,
      sent: a?.sent ?? 0,
      errors: a?.errors ?? 0,
      reached: a?.reached ?? 0,
      byOutcome: a?.byOutcome ?? {},
    };
    return {
      id: r.id,
      name: r.name,
      kind: r.kind,
      status: r.status,
      groupId: r.group_id,
      groupName: r.group?.name ?? null,
      groupColor: r.group?.color ?? null,
      template: r.template ?? {},
      createdAt: r.created_at,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      stats,
    } satisfies CrmCampaign;
  });

  return { campaigns, live };
}

export async function loadCampaign(id: string): Promise<{
  campaign: CrmCampaign;
  members: Prospect[];
  doneContactIds: string[];
} | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const [{ prospects }, { data, error }, { data: acts }] = await Promise.all([
    loadContacts(),
    supabase
      .from("crm_campaigns")
      .select(
        "id,name,kind,status,group_id,template,created_at,started_at,completed_at,group:group_id(name,color,rules)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("crm_activities")
      .select("type,contact_id,metadata")
      .eq("metadata->>campaign_id", id)
      .limit(20000),
  ]);

  if (error || !data) return null;
  const r = data as unknown as CampaignRow;
  const rules = r.group?.rules ?? {};
  const members = r.group ? filterByRules(prospects, rules) : [];
  const rows = (acts ?? []) as CampaignActivityRow[];
  const agg = aggregate(rows).get(r.id);

  const campaign: CrmCampaign = {
    id: r.id,
    name: r.name,
    kind: r.kind,
    status: r.status,
    groupId: r.group_id,
    groupName: r.group?.name ?? null,
    groupColor: r.group?.color ?? null,
    template: r.template ?? {},
    createdAt: r.created_at,
    startedAt: r.started_at,
    completedAt: r.completed_at,
    stats: {
      target: members.length,
      processed: agg ? agg.contacts.size : 0,
      sent: agg?.sent ?? 0,
      errors: agg?.errors ?? 0,
      reached: agg?.reached ?? 0,
      byOutcome: agg?.byOutcome ?? {},
    },
  };

  const doneContactIds = Array.from(
    new Set(rows.map((x) => x.contact_id).filter(Boolean) as string[])
  );

  return { campaign, members, doneContactIds };
}
