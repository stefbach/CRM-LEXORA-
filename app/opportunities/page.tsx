import { PageHeader } from "@/components/ui";
import { PipelineBoard } from "@/components/kanban";
import { loadContacts } from "@/lib/crm";

export const dynamic = "force-dynamic";

const ENGAGED = ["a_qualifier", "contacte", "en_discussion", "gagne", "perdu"];

export default async function OpportunitiesPage() {
  const { prospects, live } = await loadContacts();
  const engaged = prospects.filter((p) => ENGAGED.includes(p.status));

  return (
    <div>
      <PageHeader
        title="Pipeline"
        subtitle="Glissez les contacts entre les étapes pour faire avancer le pipeline."
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
      {engaged.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-slate-400">
            Aucun contact engagé pour l&apos;instant.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Passez des appels depuis la page <span className="text-slate-300">Appels</span>{" "}
            — dès qu&apos;un contact est qualifié, à rappeler ou en discussion, il
            apparaît ici.
          </p>
        </div>
      ) : (
        <PipelineBoard prospects={engaged} />
      )}
    </div>
  );
}
