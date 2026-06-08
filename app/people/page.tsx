import { Mail, Phone, Plus, Search } from "lucide-react";
import { people, companyById } from "@/lib/data";
import { Avatar, CompanyLogo, PageHeader } from "@/components/ui";
import { relativeDate } from "@/lib/utils";

export default function PeoplePage() {
  return (
    <div>
      <PageHeader
        title="People"
        subtitle={`${people.length} contacts across your accounts.`}
        action={
          <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 px-3 text-sm font-medium text-white shadow-glow transition hover:brightness-110">
            <Plus className="h-4 w-4" />
            Add person
          </button>
        }
      />

      <div className="card overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Filter contacts…"
              className="h-9 w-full rounded-lg border border-white/5 bg-ink-800/60 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-brand-500/40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => {
                const company = companyById(p.companyId);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-white/[0.03] transition hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          first={p.firstName}
                          last={p.lastName}
                          color={p.avatarColor}
                          size={34}
                        />
                        <div>
                          <p className="font-medium text-white">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{p.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {company && (
                        <div className="flex items-center gap-2">
                          <CompanyLogo
                            name={company.name}
                            color={company.logoColor}
                            size={24}
                          />
                          <span className="text-slate-300">{company.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{p.jobTitle}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-slate-400">
                        <a
                          href={`mailto:${p.email}`}
                          className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 transition hover:text-white"
                          title={p.email}
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={`tel:${p.phone}`}
                          className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 transition hover:text-white"
                          title={p.phone}
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {relativeDate(p.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
