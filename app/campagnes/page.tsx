import { PageHeader } from "@/components/ui";
import {
  CampaignsView,
  type CampaignView,
  type GroupOption,
} from "@/components/campaigns-view";
import { loadCampaigns, loadGroups } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function CampagnesPage() {
  const [{ campaigns, live }, { groups }] = await Promise.all([
    loadCampaigns(),
    loadGroups(),
  ]);

  const views: CampaignView[] = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    kind: c.kind,
    status: c.status,
    groupName: c.groupName,
    groupColor: c.groupColor,
    stats: {
      target: c.stats.target,
      processed: c.stats.processed,
      sent: c.stats.sent,
      errors: c.stats.errors,
      reached: c.stats.reached,
    },
  }));

  const groupOptions: GroupOption[] = groups.map((g) => ({
    id: g.id,
    name: g.name,
    color: g.color,
    memberCount: g.memberCount,
  }));

  return (
    <div>
      <PageHeader
        title="Campagnes"
        subtitle="Pilotez vos campagnes d'email et d'appel par groupe, avec suivi et statistiques."
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
      <CampaignsView campaigns={views} groups={groupOptions} />
    </div>
  );
}
