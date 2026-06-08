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

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number; deals: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          stroke="#475569"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#475569"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}k`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: "#6366f1", strokeOpacity: 0.2 }}
          formatter={(v: number) => [`$${v}k`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#818cf8"
          strokeWidth={2.5}
          fill="url(#revGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PipelineChart({
  data,
}: {
  data: { stage: string; value: number; fill: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
        <XAxis
          dataKey="stage"
          stroke="#475569"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#475569"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          formatter={(v: number) => [
            `$${v.toLocaleString()}`,
            "Pipeline",
          ]}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
