"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Trophy,
  Percent,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  trending: TrendingUp,
  dollar: DollarSign,
  trophy: Trophy,
  percent: Percent,
} satisfies Record<string, LucideIcon>;

export type StatIcon = keyof typeof icons;

export function StatCard({
  label,
  value,
  delta,
  icon,
  accent,
  index = 0,
}: {
  label: string;
  value: string;
  delta?: number;
  icon: StatIcon;
  accent: string;
  index?: number;
}) {
  const Icon = icons[icon];
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="card group relative overflow-hidden p-5"
    >
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-white/10"
          style={{ background: `${accent}22` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              "chip",
              positive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-slate-400">{label}</p>
    </motion.div>
  );
}
