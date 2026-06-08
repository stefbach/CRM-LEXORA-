"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Phone, Mail } from "lucide-react";
import { channelMeta, fullName, type Prospect } from "@/lib/prospects";
import { statusMeta, type CrmStatus } from "@/lib/crm-meta";
import { Avatar } from "@/components/ui";
import { updateContactStatus } from "@/app/actions";

// Working pipeline — "nouveau" stays in Prospects/Appels, not the board.
const BOARD_COLUMNS: CrmStatus[] = [
  "a_qualifier",
  "contacte",
  "en_discussion",
  "gagne",
  "perdu",
];

export function PipelineBoard({ prospects }: { prospects: Prospect[] }) {
  const [cards, setCards] = useState<Prospect[]>(prospects);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<CrmStatus | null>(null);
  const [, start] = useTransition();

  function drop(status: CrmStatus) {
    const id = dragId;
    setDragId(null);
    setOverCol(null);
    if (!id) return;
    const current = cards.find((c) => c.id === id);
    if (!current || current.status === status) return;

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    start(async () => {
      const r = await updateContactStatus(id, status);
      if (!r.ok) {
        // revert on failure
        setCards((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: current.status } : c
          )
        );
      }
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {BOARD_COLUMNS.map((status) => {
        const items = cards.filter((c) => c.status === status);
        const meta = statusMeta[status];
        const isOver = overCol === status;
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(status);
            }}
            onDrop={() => drop(status)}
            className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-ink-900/40 transition-colors ${
              isOver ? "border-brand-500/40 bg-brand-500/[0.04]" : "border-white/5"
            }`}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: meta.color }}
                />
                <span className="text-sm font-semibold text-white">
                  {meta.short}
                </span>
                <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400">
                  {items.length}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
              <AnimatePresence>
                {items.slice(0, 80).map((p) => {
                  const ch = channelMeta[p.channel];
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      draggable
                      onDragStart={() => setDragId(p.id)}
                      onDragEnd={() => setDragId(null)}
                      className={`group cursor-grab rounded-xl border border-white/5 bg-ink-800/80 p-3 shadow-card transition active:cursor-grabbing ${
                        dragId === p.id ? "opacity-40" : "hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Avatar
                          first={p.firstName}
                          last={p.lastName}
                          color={ch.color}
                          size={28}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium leading-snug text-white">
                            {fullName(p)}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {p.company || "—"}
                          </p>
                        </div>
                        <GripVertical className="h-4 w-4 shrink-0 text-slate-600 opacity-0 transition group-hover:opacity-100" />
                      </div>

                      <div className="mt-2.5 flex items-center gap-2">
                        <span
                          className="chip"
                          style={{ color: ch.color, background: `${ch.color}1a` }}
                        >
                          {ch.short}
                        </span>
                        {p.phone && (
                          <Phone className="h-3.5 w-3.5 text-emerald-300/70" />
                        )}
                        {p.email && (
                          <Mail className="h-3.5 w-3.5 text-brand-300/70" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="grid h-20 place-items-center rounded-xl border border-dashed border-white/10 text-xs text-slate-600">
                  Glissez des contacts ici
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
