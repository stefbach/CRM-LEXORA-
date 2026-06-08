import { cn, initials } from "@/lib/utils";
import { stageMeta } from "@/lib/data";
import type { Stage } from "@/lib/types";

export function Avatar({
  first,
  last,
  color,
  size = 36,
}: {
  first: string;
  last: string;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white ring-1 ring-white/10"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${color}, ${color}99)`,
      }}
    >
      {initials(first, last)}
    </span>
  );
}

export function CompanyLogo({
  name,
  color,
  size = 36,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg font-bold text-white ring-1 ring-white/10"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
      }}
    >
      {name.charAt(0)}
    </span>
  );
}

export function StageBadge({ stage }: { stage: Stage }) {
  const meta = stageMeta[stage];
  return (
    <span
      className="chip"
      style={{
        color: meta.color,
        background: `${meta.color}1a`,
        boxShadow: `inset 0 0 0 1px ${meta.color}33`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("card p-5", className)}>{children}</div>;
}
