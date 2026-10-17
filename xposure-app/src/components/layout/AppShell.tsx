"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { CHANGES, TASKS } from "@/lib/data";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { CommandPaletteProvider } from "@/components/ui/CommandPalette";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { PageTransition } from "@/components/motion/PageTransition";

const COLLAPSE_KEY = "xposure-sidebar-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { statusOf, extraTasks } = useDecisions();
  const { role, account } = useSession();

  /* حالة الطيّ تُقرأ بعد التركيب فقط: قراءتها أثناء التصيير تكسر تطابق الخادم والعميل */
  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "true");
  }, []);

  function toggleCollapse() {
    setCollapsed((v) => {
      window.localStorage.setItem(COLLAPSE_KEY, String(!v));
      return !v;
    });
  }

  /* الدرج يُغلق عند كل تنقّل — إبقاؤه مفتوحاً فوق الصفحة الجديدة يُربك المكان */
  useEffect(() => setDrawer(false), [pathname]);

  const openChanges = CHANGES.filter((c) => ["new", "pending"].includes(statusOf(c))).length;
  /* مالك العملية يرى مهامه وحده — والرقم في الشريط يجب أن يطابق ما تعرضه صفحته */
  const visibleTasks =
    role === "owner" && account ? [...TASKS, ...extraTasks].filter((t) => t.owner === account.name) : [...TASKS, ...extraTasks];
  const openTasks = visibleTasks.filter((t) => t.status !== "approved").length;

  return (
    <CommandPaletteProvider>
      <div className="flex min-h-screen">
        <ScrollProgress />
        <KeyboardShortcuts />
        {/* رابط تخطٍّ لأول عنصر قابل للتركيز — يظهر فقط عند التنقل بلوحة المفاتيح. */}
        <a
          href="#main-content"
          className="sr-only rounded-md bg-surface-raised px-4 py-3 font-body text-body-sm text-ink focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-toast focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-border-focus"
        >
          تخطٍّ إلى المحتوى الرئيسي
        </a>
        <div
          onClick={() => setDrawer(false)}
          aria-hidden
          className={
            drawer
              ? "fixed inset-0 z-dropdown bg-[rgba(2,6,23,0.6)] opacity-100 backdrop-blur-[2px] transition-opacity duration-3 md:hidden"
              : "pointer-events-none fixed inset-0 z-dropdown opacity-0 transition-opacity duration-3 md:hidden"
          }
        />
        <Sidebar
          counts={{ "/changes": openChanges, "/tasks": openTasks }}
          open={drawer}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onNavigate={() => setDrawer(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onMenu={() => setDrawer((v) => !v)} />
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
