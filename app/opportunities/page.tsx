import { Plus, SlidersHorizontal } from "lucide-react";
import { KanbanBoard } from "@/components/kanban";
import { PageHeader } from "@/components/ui";

export default function OpportunitiesPage() {
  return (
    <div>
      <PageHeader
        title="Opportunities"
        subtitle="Drag deals across stages to update your pipeline."
        action={
          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/5 bg-ink-800/60 px-3 text-sm text-slate-300 transition hover:text-white">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 px-3 text-sm font-medium text-white shadow-glow transition hover:brightness-110">
              <Plus className="h-4 w-4" />
              Add deal
            </button>
          </div>
        }
      />
      <KanbanBoard />
    </div>
  );
}
