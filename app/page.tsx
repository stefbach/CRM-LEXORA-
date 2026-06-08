import { StatCard } from "@/components/stat-card";
import { RevenueChart, PipelineChart } from "@/components/charts";
import { Avatar, StageBadge, PageHeader } from "@/components/ui";
import {
  revenueTrend,
  pipelineByStage,
  totalPipeline,
  wonThisQuarter,
  weightedForecast,
  winRate,
  opportunities,
  companyById,
  personById,
  activities,
} from "@/lib/data";
import { formatCompact, formatCurrency, relativeDate } from "@/lib/utils";

export default function DashboardPage() {
  const topDeals = [...opportunities]
    .filter((o) => o.stage !== "won" && o.stage !== "lost")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const upcoming = activities
    .filter((a) => !a.done)
    .sort((a, b) => a.when.localeCompare(b.when))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Good morning, Stéphane 👋"
        subtitle="Here's what's moving across your pipeline today."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Open pipeline"
          value={formatCompact(totalPipeline())}
          delta={12}
          icon="trending"
          accent="#6366f1"
        />
        <StatCard
          index={1}
          label="Weighted forecast"
          value={formatCompact(weightedForecast())}
          delta={8}
          icon="dollar"
          accent="#06b6d4"
        />
        <StatCard
          index={2}
          label="Won this quarter"
          value={formatCompact(wonThisQuarter())}
          delta={23}
          icon="trophy"
          accent="#10b981"
        />
        <StatCard
          index={3}
          label="Win rate"
          value={`${winRate()}%`}
          delta={-4}
          icon="percent"
          accent="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Revenue trend
              </h2>
              <p className="text-xs text-slate-500">Closed-won, last 6 months</p>
            </div>
            <span className="chip bg-emerald-500/10 text-emerald-400">
              +18% YoY
            </span>
          </div>
          <RevenueChart data={revenueTrend} />
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">
              Pipeline by stage
            </h2>
            <p className="text-xs text-slate-500">Active opportunities</p>
          </div>
          <PipelineChart data={pipelineByStage()} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Top open deals</h2>
          <div className="space-y-1">
            {topDeals.map((deal) => {
              const company = companyById(deal.companyId);
              const owner = personById(deal.ownerId);
              return (
                <div
                  key={deal.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/[0.03]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {deal.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {company?.name} · closes {relativeDate(deal.closeDate)}
                    </p>
                  </div>
                  <StageBadge stage={deal.stage} />
                  <div className="hidden items-center gap-2 sm:flex">
                    {owner && (
                      <Avatar
                        first={owner.firstName}
                        last={owner.lastName}
                        color={owner.avatarColor}
                        size={28}
                      />
                    )}
                  </div>
                  <p className="w-24 text-right text-sm font-semibold text-white">
                    {formatCurrency(deal.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Up next</h2>
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-400 ring-4 ring-brand-500/10" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">{a.title}</p>
                  <p className="text-xs capitalize text-slate-500">
                    {a.type} · {relativeDate(a.when)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
