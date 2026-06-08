import { Users2, MapPin, ExternalLink, Factory } from "lucide-react";
import { loadCompanies } from "@/lib/crm";
import { statusMeta } from "@/lib/crm-meta";
import { CompanyLogo, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const palette = ["#6366f1", "#06b6d4", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#3b82f6"];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export default async function CompaniesPage() {
  const { companies, live } = await loadCompanies();

  return (
    <div>
      <PageHeader
        title="Sociétés"
        subtitle={`${companies.length} sociétés dans votre base.`}
        action={
          <span
            className="chip"
            style={{
              color: live ? "#10b981" : "#f59e0b",
              background: live ? "#10b9811a" : "#f59e0b1a",
            }}
          >
            {live ? "Live · Supabase" : "Supabase non connecté"}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {companies.map((c) => {
          const st = statusMeta[c.status];
          return (
            <div
              key={c.id}
              className="card group p-5 transition hover:border-white/15"
            >
              <div className="flex items-start justify-between">
                <CompanyLogo name={c.name} color={colorFor(c.name)} size={44} />
                {c.website && (
                  <a
                    href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 transition hover:text-slate-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <h3 className="mt-3 truncate text-base font-semibold text-white">
                {c.name}
              </h3>
              <span
                className="mt-1 inline-flex chip"
                style={{ color: st.color, background: `${st.color}1a` }}
              >
                {st.short}
              </span>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {c.industry && (
                  <span className="chip bg-white/5 text-slate-300">
                    <Factory className="h-3 w-3" />
                    {c.industry}
                  </span>
                )}
                {c.city && (
                  <span className="chip bg-white/5 text-slate-400">
                    <MapPin className="h-3 w-3" />
                    {c.city}
                  </span>
                )}
                {c.size && (
                  <span className="chip bg-white/5 text-slate-400">
                    <Users2 className="h-3 w-3" />
                    {c.size}
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-4 text-center">
                <div>
                  <p className="text-sm font-semibold text-white">{c.contacts}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Contacts
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{st.short}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Statut
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
