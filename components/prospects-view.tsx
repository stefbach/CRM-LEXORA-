"use client";

import { useMemo, useState } from "react";
import { Search, Mail, Phone, Linkedin, Filter } from "lucide-react";
import {
  channelMeta,
  priorityMeta,
  fullName,
  type Channel,
  type Prospect,
} from "@/lib/prospects";
import { Avatar } from "@/components/ui";
import { ProspectDrawer } from "@/components/prospect-drawer";

const channels = Object.keys(channelMeta) as Channel[];
const priorities = ["A+", "A", "B", "Direct"];

export function ProspectsView({ prospects }: { prospects: Prospect[] }) {
  const all = prospects;
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [priority, setPriority] = useState<string | "all">("all");
  const [emailOnly, setEmailOnly] = useState(false);
  const [selected, setSelected] = useState<Prospect | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((p) => {
      if (channel !== "all" && p.channel !== channel) return false;
      if (priority !== "all" && p.priority !== priority) return false;
      if (emailOnly && !p.email) return false;
      if (needle) {
        const hay = `${p.firstName} ${p.lastName} ${p.company ?? ""} ${
          p.jobTitle ?? ""
        } ${p.city ?? ""} ${p.email ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [all, q, channel, priority, emailOnly]);

  const shown = filtered.slice(0, 200);

  return (
    <div>
      <div className="card mb-4 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un nom, une entreprise, une ville…"
              className="h-10 w-full rounded-xl border border-white/5 bg-ink-800/60 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-brand-500/40"
            />
          </div>
          <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-xl border border-white/5 bg-ink-800/60 px-3 py-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={emailOnly}
              onChange={(e) => setEmailOnly(e.target.checked)}
              className="accent-brand-500"
            />
            Email connu
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <FilterChip
            active={channel === "all"}
            onClick={() => setChannel("all")}
            label="Tous canaux"
          />
          {channels.map((ch) => (
            <FilterChip
              key={ch}
              active={channel === ch}
              onClick={() => setChannel(ch)}
              label={channelMeta[ch].short}
              color={channelMeta[ch].color}
            />
          ))}
          <span className="mx-1 h-4 w-px bg-white/10" />
          <FilterChip
            active={priority === "all"}
            onClick={() => setPriority("all")}
            label="Toutes priorités"
          />
          {priorities.map((pr) => (
            <FilterChip
              key={pr}
              active={priority === pr}
              onClick={() => setPriority(pr)}
              label={pr}
              color={priorityMeta[pr]}
            />
          ))}
        </div>
      </div>

      <p className="mb-2 px-1 text-xs text-slate-500">
        {filtered.length} prospect{filtered.length > 1 ? "s" : ""}
        {filtered.length > shown.length && ` · ${shown.length} affichés`}
      </p>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Prospect</th>
                <th className="px-4 py-3 font-medium">Entreprise</th>
                <th className="px-4 py-3 font-medium">Canal</th>
                <th className="px-4 py-3 font-medium">Prio</th>
                <th className="px-4 py-3 font-medium">Contact</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const ch = channelMeta[p.channel];
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
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
                            {p.jobTitle || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="truncate text-slate-300">
                        {p.company || "—"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {p.city || ""}
                      </p>
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
                      {p.priority ? (
                        <span
                          className="chip"
                          style={{
                            color: priorityMeta[p.priority] ?? "#94a3b8",
                            background: `${
                              priorityMeta[p.priority] ?? "#94a3b8"
                            }1a`,
                          }}
                        >
                          {p.priority}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span
                          className={p.email ? "text-brand-300" : "text-slate-700"}
                          title={p.email ?? "Email inconnu"}
                        >
                          <Mail className="h-4 w-4" />
                        </span>
                        <span
                          className={
                            p.phone ? "text-emerald-300" : "text-slate-700"
                          }
                          title={p.phone ?? "Téléphone inconnu"}
                        >
                          <Phone className="h-4 w-4" />
                        </span>
                        <span
                          className={p.linkedin ? "text-sky-300" : "text-slate-700"}
                        >
                          <Linkedin className="h-4 w-4" />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProspectDrawer prospect={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FilterChip({
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
