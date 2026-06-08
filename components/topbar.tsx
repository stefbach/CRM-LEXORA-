"use client";

import { Search, Plus, Bell, Command } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/5 bg-ink-950/40 px-6 backdrop-blur-xl lg:px-10">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          placeholder="Rechercher un contact, une société…"
          className="h-10 w-full rounded-xl border border-white/5 bg-ink-800/60 pl-10 pr-16 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-500/40 focus:bg-ink-800 focus:ring-2 focus:ring-brand-500/20"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-white/10 bg-ink-700/60 px-1.5 py-0.5 text-[10px] text-slate-400 sm:flex">
          <Command className="h-3 w-3" /> K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <a
          href="/appels"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 px-4 text-sm font-medium text-white shadow-glow transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Lancer les appels</span>
        </a>
        <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/5 bg-ink-800/60 text-slate-400 transition hover:text-white">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-brand-400 ring-2 ring-ink-950" />
        </button>
        <div className="ml-1 flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-brand-500 text-xs font-semibold text-white">
            SB
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-white">Stéphane</p>
            <p className="text-[11px] text-slate-500">Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
