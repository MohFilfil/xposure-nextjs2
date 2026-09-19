"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, GitCompare, History, LayoutDashboard, ListChecks, Lock, Settings2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cx } from "@/lib/utils";

export const NAV = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/changes", label: "التغييرات", icon: GitCompare },
  { href: "/tasks", label: "المهام", icon: ListChecks },
  { href: "/audit", label: "سجل التدقيق", icon: History },
  { href: "/settings", label: "الإعدادات", icon: Settings2 }
];

/**
 * العنصر النشط يُميَّز بطريقتين معاً: لون brand + خط جانبي 3px بلون brand.
 * لا أكثر من عنصر نشط واحد، ولا شاشة بلا عنصر نشط.
 */
export function Sidebar({
  counts,
  open,
  onNavigate
}: {
  counts: Record<string, number>;
  open: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className={cx(
        "flex w-[248px] shrink-0 flex-col gap-2 border-e border-border bg-surface-raised p-3 pt-4",
        "sticky top-0 h-screen z-sticky",
        "max-md:fixed max-md:inset-y-0 max-md:start-0 max-md:shadow-lg max-md:transition-transform max-md:duration-200 max-md:z-dropdown",
        open ? "max-md:translate-x-0" : "max-md:translate-x-full"
      )}
    >
      <div className="px-3 pb-6 pt-4">
        <Logo className="h-[68px] w-[148px]" />
      </div>

      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const count = counts[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cx(
              "flex w-full items-center gap-3 rounded-md border-s-[3px] border-s-transparent p-3 font-body text-body font-medium transition-colors duration-150 no-underline",
              active
                ? "border-s-brand bg-surface-overlay font-semibold text-brand hover:text-brand hover:no-underline"
                : "text-ink-muted hover:bg-surface-overlay hover:text-ink hover:no-underline"
            )}
          >
            <Icon size={24} strokeWidth={2} aria-hidden />
            <span>{item.label}</span>
            {typeof count === "number" && <span className="ms-auto font-mono text-caption text-ink-muted">{count}</span>}
          </Link>
        );
      })}

      <div className="mt-auto border-t border-border p-3">
        <p className="flex items-center gap-2 font-body text-caption text-ink-muted">
          <Lock size={20} strokeWidth={2} aria-hidden />
          نواة معزولة — لا تخرج بيانات المنشأة
        </p>
        <p className="mt-2 flex items-center gap-2 font-body text-caption text-ink-muted">
          <Box size={20} strokeWidth={2} aria-hidden />
          النماذج تعمل محلياً · Qwen2.5 14B
        </p>
      </div>
    </nav>
  );
}
