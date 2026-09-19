"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAV, Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { CHANGES, TASKS } from "@/lib/data";
import { useDecisions } from "@/components/DecisionsProvider";

const TITLES: Record<string, string> = {
  "/dashboard": "لوحة التحكم",
  "/changes": "التغييرات",
  "/tasks": "المهام",
  "/audit": "سجل التدقيق",
  "/settings": "الإعدادات"
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  const { statusOf, extraTasks } = useDecisions();

  const openChanges = CHANGES.filter((c) => ["new", "pending"].includes(statusOf(c))).length;
  const openTasks = TASKS.filter((t) => t.status !== "approved").length + extraTasks.length;

  const base = NAV.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))?.href ?? "/dashboard";
  const title = pathname.startsWith("/changes/") ? "مراجعة تغيير" : TITLES[base];

  return (
    <div className="flex min-h-screen">
      {drawer && (
        <div className="fixed inset-0 z-dropdown bg-[rgba(2,6,23,0.6)] md:hidden" onClick={() => setDrawer(false)} aria-hidden />
      )}
      <Sidebar counts={{ "/changes": openChanges, "/tasks": openTasks }} open={drawer} onNavigate={() => setDrawer(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={title} onMenu={() => setDrawer((v) => !v)} />
        {children}
      </div>
    </div>
  );
}
