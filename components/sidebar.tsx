"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  CalendarCheck,
  Settings,
  Sparkles,
  Crosshair,
  PhoneCall,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/prospects", label: "Prospects", icon: Crosshair },
  { href: "/appels", label: "Appels", icon: PhoneCall },
  { href: "/emails", label: "Emails", icon: Send },
  { href: "/opportunities", label: "Pipeline", icon: Target },
  { href: "/people", label: "Contacts", icon: Users },
  { href: "/companies", label: "Sociétés", icon: Building2 },
  { href: "/activities", label: "Activités", icon: CalendarCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-ink-900/60 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white">Lexora</p>
          <p className="-mt-0.5 text-[11px] text-slate-500">Sales OS</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Workspace
        </p>
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-link", active && "nav-link-active")}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-auto space-y-1">
          <Link href="/" className="nav-link">
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </Link>
        </div>
      </nav>

      <div className="m-3 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 p-4 ring-1 ring-brand-500/20">
        <p className="text-xs font-semibold text-white">Lexora AI</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          Auto-summarize deals and draft follow-ups in one click.
        </p>
        <button className="mt-3 w-full rounded-lg bg-white/10 py-1.5 text-xs font-medium text-white transition hover:bg-white/20">
          Enable beta
        </button>
      </div>
    </aside>
  );
}
