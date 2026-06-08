import {
  Phone,
  Mail,
  StickyNote,
  Calendar,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";
import { loadActivities } from "@/lib/crm";
import { PageHeader } from "@/components/ui";
import { relativeDate } from "@/lib/utils";

const typeMeta: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  call: { icon: Phone, color: "#6366f1", label: "Appel" },
  email: { icon: Mail, color: "#06b6d4", label: "Email" },
  meeting: { icon: Calendar, color: "#ec4899", label: "RDV" },
  note: { icon: StickyNote, color: "#f59e0b", label: "Note" },
  task: { icon: CheckSquare, color: "#10b981", label: "Tâche" },
};

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const { activities, live } = await loadActivities(200);

  return (
    <div>
      <PageHeader
        title="Activités"
        subtitle="Tous les appels et emails de votre base, dans une timeline."
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

      <div className="card p-6">
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Aucune activité enregistrée pour l&apos;instant. Les appels et emails
            envoyés depuis le CRM apparaîtront ici.
          </p>
        ) : (
          <div className="relative space-y-6 before:absolute before:left-[18px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-white/5">
            {activities.map((a) => {
              const meta = typeMeta[a.type] ?? typeMeta.note;
              const Icon = meta.icon;
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
                      <p className="text-sm font-medium text-white">
                        {a.subject || meta.label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {meta.label}
                        {a.contactName ? ` · ${a.contactName}` : ""}
                        {a.companyName ? ` · ${a.companyName}` : ""} ·{" "}
                        {relativeDate(a.createdAt)}
                      </p>
                    </div>
                    {a.direction && (
                      <span className="chip bg-white/5 text-slate-400">
                        {a.direction === "outbound" ? "Sortant" : "Entrant"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
