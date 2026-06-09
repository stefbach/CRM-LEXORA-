import { PageHeader } from "@/components/ui";
import { TemplatesView } from "@/components/templates-view";
import { loadTemplates } from "@/lib/crm";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ModelesPage() {
  const { emails, scripts } = await loadTemplates();
  const live = isSupabaseConfigured;

  return (
    <div>
      <PageHeader
        title="Modèles"
        subtitle="Vos modèles d'email et scripts d'appel réutilisables dans les campagnes et le flux d'appel."
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
      <TemplatesView emails={emails} scripts={scripts} />
    </div>
  );
}
