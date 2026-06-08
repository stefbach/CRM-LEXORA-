"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

const tooltipStyle = {
  background: "rgba(20,20,31,0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  color: "#e2e8f0",
  fontSize: 12,
  boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
};

export function ActivityChart({
  data,
}: {
  data: { day: string; calls: number; emails: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="mailGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          stroke="#475569"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#475569"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: "#6366f1", strokeOpacity: 0.2 }}
        />
        <Area
          type="monotone"
          dataKey="calls"
          name="Appels"
          stroke="#818cf8"
          strokeWidth={2.5}
          fill="url(#callGrad)"
        />
        <Area
          type="monotone"
          dataKey="emails"
          name="Emails"
          stroke="#22d3ee"
          strokeWidth={2.5}
          fill="url(#mailGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StatusChart({
  data,
}: {
  data: { label: string; value: number; fill: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}>
        <XAxis
          dataKey="label"
          stroke="#475569"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          stroke="#475569"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          formatter={(v: number) => [`${v}`, "Contacts"]}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
