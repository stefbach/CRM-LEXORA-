"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical } from "lucide-react";
import {
  opportunities as seed,
  pipelineStages,
  stageMeta,
  companyById,
  personById,
} from "@/lib/data";
import type { Opportunity, Stage } from "@/lib/types";
import { Avatar, CompanyLogo } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export function KanbanBoard() {
  const [deals, setDeals] = useState<Opportunity[]>(seed);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  function drop(stage: Stage) {
    if (!dragId) return;
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dragId
          ? {
              ...d,
              stage,
              probability:
                stage === "won" ? 100 : stage === "lost" ? 0 : d.probability,
            }
          : d
      )
    );
    setDragId(null);
    setOverStage(null);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {pipelineStages.map((stage) => {
        const items = deals.filter((d) => d.stage === stage);
        const total = items.reduce((a, d) => a + d.amount, 0);
        const meta = stageMeta[stage];
        const isOver = overStage === stage;

        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDrop={() => drop(stage)}
            className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-ink-900/40 transition-colors ${
              isOver
                ? "border-brand-500/40 bg-brand-500/[0.04]"
                : "border-white/5"
            }`}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: meta.color }}
                />
                <span className="text-sm font-semibold text-white">
                  {meta.label}
                </span>
                <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400">
                  {items.length}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {formatCurrency(total)}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
              <AnimatePresence>
                {items.map((deal) => {
                  const company = companyById(deal.companyId);
                  const owner = personById(deal.ownerId);
                  return (
                    <motion.div
                      key={deal.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      draggable
                      onDragStart={() => setDragId(deal.id)}
                      onDragEnd={() => setDragId(null)}
                      className={`group cursor-grab rounded-xl border border-white/5 bg-ink-800/80 p-3 shadow-card transition active:cursor-grabbing ${
                        dragId === deal.id ? "opacity-40" : "hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {company && (
                          <CompanyLogo
                            name={company.name}
                            color={company.logoColor}
                            size={28}
                          />
                        )}
                        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-white">
                          {deal.name}
                        </p>
                        <GripVertical className="h-4 w-4 shrink-0 text-slate-600 opacity-0 transition group-hover:opacity-100" />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(deal.amount)}
                        </span>
                        {owner && (
                          <Avatar
                            first={owner.firstName}
                            last={owner.lastName}
                            color={owner.avatarColor}
                            size={24}
                          />
                        )}
                      </div>

                      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${deal.probability}%`,
                            background: meta.color,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="grid h-20 place-items-center rounded-xl border border-dashed border-white/10 text-xs text-slate-600">
                  Drop deals here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
