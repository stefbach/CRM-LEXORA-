import { Users, MailCheck, PhoneCall, Flame, Database } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { ProspectsView } from "@/components/prospects-view";
import { prospectStats } from "@/lib/prospects";
import { loadProspects } from "@/lib/prospects-source";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const { prospects, live } = await loadProspects();
  const s = prospectStats(prospects);
  const stats = [
    { label: "Prospects", value: s.total, icon: Users, color: "#6366f1" },
    { label: "Emails vérifiés", value: s.verified, icon: MailCheck, color: "#10b981" },
    { label: "Avec téléphone", value: s.withPhone, icon: PhoneCall, color: "#06b6d4" },
    { label: "Prioritaires (A/A+)", value: s.hot, icon: Flame, color: "#ec4899" },
  ];

  return (
    <div>
      <PageHeader
        title="Prospects"
        subtitle="Base consolidée Maurice — emails et scripts d'appel personnalisés en un clic."
        action={
          <span
            className="chip"
            style={{
              color: live ? "#10b981" : "#94a3b8",
              background: live ? "#10b9811a" : "#94a3b81a",
            }}
            title={
              live
                ? "Données lues en direct depuis Supabase"
                : "Données embarquées (Supabase non configuré)"
            }
          >
            <Database className="h-3 w-3" />
            {live ? "Live · Supabase" : "Démo · embarqué"}
          </span>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div key={st.label} className="card flex items-center gap-3 p-4">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-white/10"
                style={{ background: `${st.color}22` }}
              >
                <Icon className="h-5 w-5" style={{ color: st.color }} />
              </div>
              <div>
                <p className="text-xl font-semibold text-white">{st.value}</p>
                <p className="text-xs text-slate-500">{st.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <ProspectsView prospects={prospects} />
    </div>
  );
}
