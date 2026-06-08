import Link from "next/link";
import { Phone, Mail, StickyNote, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { ActivityChart, StatusChart } from "@/components/charts";
import { PageHeader } from "@/components/ui";
import { loadDashboard } from "@/lib/crm";
import { relativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const d = await loadDashboard();

  const statusData = d.byStatus.map((s) => ({
    label: s.label,
    value: s.count,
    fill: s.color,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bonjour Stéphane 👋"
        subtitle={
          d.live
            ? "Votre base Lexora, en direct."
            : "Connectez Supabase pour afficher votre base."
        }
        action={
          <span
            className="chip"
            style={{
              color: d.live ? "#10b981" : "#f59e0b",
              background: d.live ? "#10b9811a" : "#f59e0b1a",
            }}
          >
            {d.live ? "Live · Supabase" : "Supabase non connecté"}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Prospects" value={String(d.total)} icon="users" accent="#6366f1" />
        <StatCard index={1} label="Avec email" value={String(d.withEmail)} icon="mail" accent="#06b6d4" />
        <StatCard index={2} label="Contactés" value={String(d.reached)} icon="trophy" accent="#10b981" />
        <StatCard index={3} label="Rappels dus" value={String(d.callbacksDue)} icon="callback" accent="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Activité</h2>
              <p className="text-xs text-slate-500">Appels & emails · 14 derniers jours</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-brand-400" /> Appels
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Emails
              </span>
            </div>
          </div>
          <ActivityChart data={d.activity14} />
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Pipeline</h2>
            <p className="text-xs text-slate-500">Contacts par statut</p>
          </div>
          <StatusChart data={statusData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Flux */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Répartition par flux</h2>
            <Link
              href="/appels"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-200"
            >
              Lancer les appels <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {d.byChannel.map((c) => {
              const pct = d.total ? Math.round((c.count / d.total) * 100) : 0;
              return (
                <div key={c.channel} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-slate-400">
                    {c.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: c.color }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-medium text-slate-300">
                    {c.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Dernières activités</h2>
            <Link
              href="/activities"
              className="text-xs font-medium text-brand-300 hover:text-brand-200"
            >
              Voir tout
            </Link>
          </div>
          {d.recent.length === 0 ? (
            <p className="text-xs text-slate-500">
              Aucune activité pour l&apos;instant. Passez des appels ou envoyez
              des emails pour alimenter l&apos;historique.
            </p>
          ) : (
            <div className="space-y-3">
              {d.recent.map((a) => {
                const Icon =
                  a.type === "call" ? Phone : a.type === "email" ? Mail : StickyNote;
                const color =
                  a.type === "call"
                    ? "#6366f1"
                    : a.type === "email"
                    ? "#06b6d4"
                    : "#f59e0b";
                return (
                  <div key={a.id} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                      style={{ background: `${color}22` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-200">
                        {a.subject || a.type}
                        {a.contactName ? ` · ${a.contactName}` : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {relativeDate(a.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
