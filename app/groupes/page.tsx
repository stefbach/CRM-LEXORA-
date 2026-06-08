import { PageHeader } from "@/components/ui";
import { GroupsManager } from "@/components/groups-manager";
import { loadGroups } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function GroupesPage() {
  const { groups, contacts, live } = await loadGroups();

  return (
    <div>
      <PageHeader
        title="Groupes"
        subtitle="Segments dynamiques : définissez des critères, les contacts y entrent automatiquement."
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
      <GroupsManager groups={groups} contacts={contacts} />
    </div>
  );
}
