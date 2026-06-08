import "server-only";
import { getServerSupabase } from "./supabase-server";
import { getAllProspects, type Channel, type Prospect } from "./prospects";

interface ContactRow {
  id: string;
  prenom: string | null;
  nom: string | null;
  titre: string | null;
  email: string | null;
  email_verified: boolean | null;
  telephone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  statut: string | null;
  raw_data: Record<string, unknown> | null;
  company: { nom: string | null; ville: string | null; industrie: string | null } | null;
}

const validChannels: Channel[] = ["pme", "cabinet", "daf", "finance"];

function asChannel(v: unknown): Channel {
  return validChannels.includes(v as Channel) ? (v as Channel) : "pme";
}

function mapRow(r: ContactRow): Prospect {
  const raw = r.raw_data ?? {};
  const scoreRaw = raw["score"];
  return {
    id: r.id,
    firstName: r.prenom ?? "",
    lastName: r.nom ?? "",
    jobTitle: r.titre,
    company: r.company?.nom ?? null,
    channel: asChannel(raw["canal"]),
    channelLabel: (raw["canal_label"] as string) ?? null,
    sector: r.company?.industrie ?? null,
    headcount: null,
    city: (raw["ville"] as string) ?? r.company?.ville ?? null,
    email: r.email,
    emailStatus: (raw["email_status"] as string) ?? null,
    phone: r.telephone,
    linkedin: r.linkedin_url,
    score: typeof scoreRaw === "number" ? scoreRaw : null,
    priority: (raw["priorite"] as string) ?? null,
    note: r.notes,
    status: r.statut ?? "nouveau",
    source: "import_csv",
  };
}

/**
 * Returns prospects from Supabase (server-side, service-role) when configured,
 * otherwise the bundled snapshot. The UI is identical either way.
 */
export async function loadProspects(): Promise<{
  prospects: Prospect[];
  live: boolean;
}> {
  const supabase = getServerSupabase();
  if (!supabase) return { prospects: getAllProspects(), live: false };

  const { data, error } = await supabase
    .from("crm_contacts")
    .select(
      "id,prenom,nom,titre,email,email_verified,telephone,linkedin_url,notes,statut,raw_data,company:company_id(nom,ville,industrie)"
    )
    .eq("source", "import_csv")
    .limit(2000);

  if (error || !data) {
    return { prospects: getAllProspects(), live: false };
  }

  const prospects = (data as unknown as ContactRow[])
    .map(mapRow)
    .sort((a, b) => a.company?.localeCompare(b.company ?? "") ?? 0);

  return { prospects, live: true };
}
