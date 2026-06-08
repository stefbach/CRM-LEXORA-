import { PhoneCall, PhoneOff, CalendarClock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { CallBoard, type CallbackItem } from "@/components/call-board";
import { loadContacts, loadCallbacks } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function AppelsPage() {
  const [{ prospects, live }, callbacks] = await Promise.all([
    loadContacts(),
    loadCallbacks(),
  ]);

  // The call queue = contacts not yet engaged/closed, with a phone number.
  const callable = prospects.filter(
    (p) =>
      p.phone &&
      !p.optOut &&
      ["nouveau", "a_qualifier", "qualifie"].includes(p.status)
  );

  const today = new Date().toISOString().slice(0, 10);
  const dueToday = callbacks.filter((c) => c.callbackAt.slice(0, 10) <= today)
    .length;

  const callbackItems: CallbackItem[] = callbacks.map((c) => ({
    activityKey: c.activityId,
    contactId: c.contactId,
    contactName: c.contactName,
    companyName: c.companyName,
    callbackAt: c.callbackAt,
    note: c.note,
  }));

  const stats = [
    { label: "À appeler", value: callable.length, icon: PhoneCall, color: "#6366f1" },
    { label: "Rappels dus", value: dueToday, icon: CalendarClock, color: "#f59e0b" },
    { label: "Rappels planifiés", value: callbacks.length, icon: PhoneOff, color: "#06b6d4" },
    {
      label: "Contactés",
      value: prospects.filter((p) =>
        ["contacte", "en_discussion", "gagne"].includes(p.status)
      ).length,
      icon: CheckCircle2,
      color: "#10b981",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Appels"
        subtitle="Planifiez vos appels par flux, enregistrez l'issue et gérez vos rappels."
        action={
          !live ? (
            <span className="chip bg-amber-500/10 text-amber-300">
              Supabase non connecté
            </span>
          ) : undefined
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

      <CallBoard prospects={callable} callbacks={callbackItems} />
    </div>
  );
}
