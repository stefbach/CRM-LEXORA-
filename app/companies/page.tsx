import { Plus, Users2, MapPin, ExternalLink } from "lucide-react";
import { companies, people, opportunities } from "@/lib/data";
import { CompanyLogo, PageHeader } from "@/components/ui";
import { formatCompact } from "@/lib/utils";

export default function CompaniesPage() {
  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle={`${companies.length} accounts in your workspace.`}
        action={
          <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 px-3 text-sm font-medium text-white shadow-glow transition hover:brightness-110">
            <Plus className="h-4 w-4" />
            Add company
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {companies.map((c) => {
          const contacts = people.filter((p) => p.companyId === c.id).length;
          const openDeals = opportunities.filter(
            (o) => o.companyId === c.id && o.stage !== "won" && o.stage !== "lost"
          ).length;
          return (
            <div
              key={c.id}
              className="card group p-5 transition hover:border-white/15"
            >
              <div className="flex items-start justify-between">
                <CompanyLogo name={c.name} color={c.logoColor} size={44} />
                <ExternalLink className="h-4 w-4 text-slate-600 opacity-0 transition group-hover:opacity-100" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-white">
                {c.name}
              </h3>
              <p className="text-xs text-slate-500">{c.domain}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="chip bg-white/5 text-slate-300">
                  {c.industry}
                </span>
                <span className="chip bg-white/5 text-slate-400">
                  <MapPin className="h-3 w-3" />
                  {c.city}
                </span>
                <span className="chip bg-white/5 text-slate-400">
                  <Users2 className="h-3 w-3" />
                  {c.employees.toLocaleString()}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatCompact(c.arr)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    ARR
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{contacts}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Contacts
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{openDeals}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Open
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
