"use client";

import { useMemo, useState } from "react";
import { Search, Phone, Filter, CalendarClock, ArrowRight } from "lucide-react";
import {
  channelMeta,
  fullName,
  type Channel,
  type Prospect,
} from "@/lib/prospects";
import { statusMeta } from "@/lib/crm-meta";
import { Avatar } from "@/components/ui";
import { ProspectDrawer } from "@/components/prospect-drawer";

const channels = Object.keys(channelMeta) as Channel[];

export interface CallbackItem {
  activityKey: string;
  contactId: string | null;
  contactName: string | null;
  companyName: string | null;
  callbackAt: string;
  note: string | null;
}

export function CallBoard({
  prospects,
  callbacks,
}: {
  prospects: Prospect[];
  callbacks: CallbackItem[];
}) {
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [selected, setSelected] = useState<Prospect | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, Prospect>();
    for (const p of prospects) m.set(p.id, p);
    return m;
  }, [prospects]);

  const queue = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return prospects.filter((p) => {
      if (channel !== "all" && p.channel !== channel) return false;
      if (needle) {
        const hay = `${p.firstName} ${p.lastName} ${p.company ?? ""} ${
          p.city ?? ""
        }`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [prospects, q, channel]);

  const today = new Date().toISOString().slice(0, 10);
  const shown = queue.slice(0, 250);

  function openCall(p: Prospect) {
    setSelected(p);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Call queue */}
      <div className="lg:col-span-2">
        <div className="card mb-4 space-y-3 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher dans la file d'appel…"
              className="h-10 w-full rounded-xl border border-white/5 bg-ink-800/60 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-brand-500/40"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <FluxChip
              active={channel === "all"}
              onClick={() => setChannel("all")}
              label="Tous flux"
            />
            {channels.map((ch) => (
              <FluxChip
                key={ch}
                active={channel === ch}
                onClick={() => setChannel(ch)}
                label={channelMeta[ch].short}
                color={channelMeta[ch].color}
              />
            ))}
          </div>
        </div>

        <p className="mb-2 px-1 text-xs text-slate-500">
          {queue.length} à appeler
          {queue.length > shown.length && ` · ${shown.length} affichés`}
        </p>

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Flux</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Téléphone</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => {
                  const ch = channelMeta[p.channel];
                  const st = statusMeta[p.status];
                  return (
                    <tr
                      key={p.id}
                      onClick={() => openCall(p)}
                      className="cursor-pointer border-b border-white/[0.03] transition hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            first={p.firstName}
                            last={p.lastName}
                            color={ch.color}
                            size={32}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">
                              {fullName(p)}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {p.company || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="chip"
                          style={{ color: ch.color, background: `${ch.color}1a` }}
                        >
                          {ch.short}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="chip"
                          style={{ color: st.color, background: `${st.color}1a` }}
                        >
                          {st.short}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-300">
                        {p.phone || <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-300">
                          Appeler <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {shown.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      Aucun contact à appeler dans ce flux. 🎉
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rappels */}
      <div className="card h-fit p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Rappels planifiés</h2>
        </div>
        {callbacks.length === 0 ? (
          <p className="text-xs text-slate-500">
            Aucun rappel planifié. Enregistrez « À rappeler » sur un appel pour
            en créer un.
          </p>
        ) : (
          <div className="space-y-2.5">
            {callbacks.slice(0, 40).map((c) => {
              const due = c.callbackAt.slice(0, 10) <= today;
              const p = c.contactId ? byId.get(c.contactId) : undefined;
              return (
                <button
                  key={c.activityKey}
                  onClick={() => p && openCall(p)}
                  className={`w-full rounded-xl border p-3 text-left transition hover:border-white/15 ${
                    due
                      ? "border-amber-500/30 bg-amber-500/[0.06]"
                      : "border-white/5 bg-ink-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-white">
                      {c.contactName || "Contact"}
                    </p>
                    <span
                      className={`shrink-0 text-[11px] font-medium ${
                        due ? "text-amber-300" : "text-slate-500"
                      }`}
                    >
                      {c.callbackAt.slice(0, 10)}
                    </span>
                  </div>
                  {c.companyName && (
                    <p className="truncate text-xs text-slate-500">
                      {c.companyName}
                    </p>
                  )}
                  {c.note && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                      {c.note}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ProspectDrawer
        prospect={selected}
        initialTab="call"
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function FluxChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`chip transition ${
        active ? "text-white" : "text-slate-400 hover:text-slate-200"
      }`}
      style={
        active
          ? {
              background: color ? `${color}26` : "rgba(99,102,241,0.2)",
              boxShadow: `inset 0 0 0 1px ${color ?? "#6366f1"}55`,
            }
          : { background: "rgba(255,255,255,0.04)" }
      }
    >
      {color && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
        />
      )}
      {label}
    </button>
  );
}
