import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, PhoneCall, Users, Target, CheckCircle2 } from "lucide-react";
import { loadCampaign } from "@/lib/crm";
import { emailConfigured } from "@/lib/email";
import {
  CampaignStatusControls,
  CampaignEmailRunner,
  CampaignCallRunner,
} from "@/components/campaign-runner";
import { DeleteCampaignButton } from "@/components/campaigns-view";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "#64748b" },
  active: { label: "Active", color: "#10b981" },
  paused: { label: "En pause", color: "#f59e0b" },
  done: { label: "Terminée", color: "#3b82f6" },
};

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await loadCampaign(params.id);
  if (!data) notFound();
  const { campaign: c, members, doneContactIds } = data;
  const configured = emailConfigured();
  const st = statusLabel[c.status] ?? statusLabel.draft;
  const kindColor = c.kind === "email" ? "#06b6d4" : "#6366f1";
  const KindIcon = c.kind === "email" ? Mail : PhoneCall;

  const stats =
    c.kind === "email"
      ? [
          { label: "Cible", value: c.stats.target, icon: Target, color: "#6366f1" },
          { label: "Envoyés", value: c.stats.sent, icon: Mail, color: "#10b981" },
          { label: "Échecs", value: c.stats.errors, icon: Users, color: "#ef4444" },
          {
            label: "Restants",
            value: Math.max(c.stats.target - c.stats.processed, 0),
            icon: Users,
            color: "#f59e0b",
          },
        ]
      : [
          { label: "Cible", value: c.stats.target, icon: Target, color: "#6366f1" },
          { label: "Appelés", value: c.stats.processed, icon: PhoneCall, color: "#06b6d4" },
          { label: "Joints", value: c.stats.reached, icon: CheckCircle2, color: "#10b981" },
          {
            label: "Restants",
            value: Math.max(c.stats.target - c.stats.processed, 0),
            icon: Users,
            color: "#f59e0b",
          },
        ];

  return (
    <div>
      <Link
        href="/campagnes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Campagnes
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: `${kindColor}22` }}
          >
            <KindIcon className="h-5 w-5" style={{ color: kindColor }} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {c.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <span
                className="chip"
                style={{ color: st.color, background: `${st.color}1a` }}
              >
                {st.label}
              </span>
              <span>{c.kind === "email" ? "Campagne email" : "Campagne d'appel"}</span>
              {c.groupName && (
                <span
                  className="chip"
                  style={{
                    color: c.groupColor ?? "#94a3b8",
                    background: `${c.groupColor ?? "#94a3b8"}1a`,
                  }}
                >
                  {c.groupName}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CampaignStatusControls id={c.id} status={c.status} configured={configured} />
          <DeleteCampaignButton id={c.id} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card flex items-center gap-3 p-4">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-white/10"
                style={{ background: `${s.color}22` }}
              >
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xl font-semibold text-white">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {c.kind === "email" ? (
        <CampaignEmailRunner
          campaignId={c.id}
          members={members}
          doneContactIds={doneContactIds}
          template={
            c.template as {
              subject?: string;
              body?: string;
              preset?: string;
              html?: string;
            }
          }
          configured={configured}
        />
      ) : (
        <CampaignCallRunner
          campaignId={c.id}
          members={members}
          doneContactIds={doneContactIds}
        />
      )}
    </div>
  );
}
