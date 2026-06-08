import {
  Phone,
  Mail,
  Calendar,
  StickyNote,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";
import { activities, personById, companyById } from "@/lib/data";
import { PageHeader, Avatar } from "@/components/ui";
import { relativeDate } from "@/lib/utils";
import type { Activity } from "@/lib/types";

const typeMeta: Record<
  Activity["type"],
  { icon: LucideIcon; color: string }
> = {
  call: { icon: Phone, color: "#6366f1" },
  email: { icon: Mail, color: "#06b6d4" },
  meeting: { icon: Calendar, color: "#ec4899" },
  note: { icon: StickyNote, color: "#f59e0b" },
  task: { icon: CheckSquare, color: "#10b981" },
};

export default function ActivitiesPage() {
  const sorted = [...activities].sort((a, b) => b.when.localeCompare(a.when));

  return (
    <div>
      <PageHeader
        title="Activities"
        subtitle="Every touchpoint across your accounts, in one timeline."
      />

      <div className="card p-6">
        <div className="relative space-y-6 before:absolute before:left-[18px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-white/5">
          {sorted.map((a) => {
            const meta = typeMeta[a.type];
            const Icon = meta.icon;
            const person = a.personId ? personById(a.personId) : undefined;
            const company = a.companyId ? companyById(a.companyId) : undefined;
            return (
              <div key={a.id} className="relative flex items-start gap-4">
                <div
                  className="z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-ink-900"
                  style={{ background: `${meta.color}22` }}
                >
                  <Icon className="h-4 w-4" style={{ color: meta.color }} />
                </div>
                <div className="flex flex-1 flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-ink-800/40 px-4 py-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium text-white">
                      {a.title}
                      {a.done && (
                        <span className="chip bg-emerald-500/10 text-emerald-400">
                          Done
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-slate-500">
                      {a.type}
                      {company ? ` · ${company.name}` : ""} ·{" "}
                      {relativeDate(a.when)}
                    </p>
                  </div>
                  {person && (
                    <Avatar
                      first={person.firstName}
                      last={person.lastName}
                      color={person.avatarColor}
                      size={30}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
