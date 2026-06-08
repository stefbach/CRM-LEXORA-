import { Mail, Phone, Linkedin } from "lucide-react";
import { loadContacts } from "@/lib/crm";
import { fullName } from "@/lib/prospects";
import { channelMeta } from "@/lib/prospects";
import { statusMeta } from "@/lib/crm-meta";
import { Avatar, PageHeader } from "@/components/ui";
import { relativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const { prospects, live } = await loadContacts();
  const shown = prospects.slice(0, 400);

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle={`${prospects.length} contacts dans votre base Lexora.`}
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

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Société</th>
                <th className="px-4 py-3 font-medium">Fonction</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Dernier contact</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const ch = channelMeta[p.channel];
                const st = statusMeta[p.status];
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
                          color={ch.color}
                          size={34}
                        />
                        <div>
                          <p className="font-medium text-white">{fullName(p)}</p>
                          <p className="text-xs text-slate-500">{p.city || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{p.company || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {p.jobTitle || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="chip"
                        style={{ color: st.color, background: `${st.color}1a` }}
                      >
                        {st.short}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span
                          className={p.email ? "text-brand-300" : "text-slate-700"}
                          title={p.email ?? "Email inconnu"}
                        >
                          <Mail className="h-4 w-4" />
                        </span>
                        <span
                          className={p.phone ? "text-emerald-300" : "text-slate-700"}
                          title={p.phone ?? "Téléphone inconnu"}
                        >
                          <Phone className="h-4 w-4" />
                        </span>
                        <span
                          className={p.linkedin ? "text-sky-300" : "text-slate-700"}
                        >
                          <Linkedin className="h-4 w-4" />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.lastContactedAt
                        ? relativeDate(p.lastContactedAt)
                        : "—"}
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
