import "server-only";
import { getServerSupabase, isSupabaseConfigured } from "./supabase-server";
import {
  channelMeta,
  type Channel,
  type Prospect,
} from "./prospects";
import { asStatus, statusMeta, type CrmStatus } from "./crm-meta";

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
