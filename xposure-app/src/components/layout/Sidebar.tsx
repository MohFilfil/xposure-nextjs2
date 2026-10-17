"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  GitCompare,
  History,
  LayoutDashboard,
  ListChecks,
  Lock,
  PanelRightClose,
  PanelRightOpen,
  Settings2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useSession } from "@/components/SessionProvider";
import { navFor } from "@/lib/roles";
import { cx } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: string;
  /** ما الذي يعدّه الرقم بجانب الرابط — يُقرأ في tooltip وفي قارئ الشاشة. */
  countLabel?: string;
}

/**
 * سجل الروابط كاملاً. أي دور يرى منه ما تذكره قائمته في lib/roles.ts فقط —
 * فلا تُبنى قائمة ثانية لكل دور، ولا يظهر لدور رابطٌ لا يملكه.
 */
export const NAV_ITEMS: Record<string, NavItem> = {
  "/dashboard": { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, group: "المراجعة" },
  "/changes": {
    href: "/changes",
    label: "التغييرات",
    icon: GitCompare,
    group: "المراجعة",
    countLabel: "بانتظار المراجعة"
  },
  "/tasks": {
    href: "/tasks",
    label: "المهام",
    icon: ListChecks,
    group: "المراجعة",
    countLabel: "مهام مفتوحة"
  },
  "/audit": { href: "/audit", label: "سجل التدقيق", icon: History, group: "النظام" },
  "/settings": { href: "/settings", label: "الإعدادات", icon: Settings2, group: "النظام" }
};

/** الترتيب الكامل — يُستخدم حين لا جلسة بعد ولأغراض الاختبار. */
export const NAV: NavItem[] = Object.values(NAV_ITEMS);

/**
 * العنصر النشط يُميَّز بثلاث طرق معاً: لون brand + خط جانبي + خلفية مرتفعة.
 * لا أكثر من عنصر نشط واحد، ولا شاشة بلا عنصر نشط.
 *
 * الروابط مجموعة تحت عنوانين — «المراجعة» لما يُعمل عليه يومياً، و«النظام» لما
 * يُرجع إليه. خمسة روابط في قائمة مسطّحة تُقرأ كقائمة؛ وخمسة تحت عنوانين تُقرأ
 * كبنية، وتخبر المستخدم أين يبحث قبل أن يقرأ التسميات.
 *
 * الطيّ يُخفي التسميات فقط؛ الأيقونات ومؤشرات العدد تبقى، ويبقى aria-label على
 * كل رابط حتى لا يفقد قارئ الشاشة شيئاً.
 */
export function Sidebar({
  counts,
  open,
  collapsed,
  onToggleCollapse,
  onNavigate
}: {
  counts: Record<string, number>;
  open: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const { role } = useSession();
  const items = (role ? navFor(role) : Object.keys(NAV_ITEMS)).map((href) => NAV_ITEMS[href]).filter(Boolean);
  let lastGroup = "";

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className={cx(
        "flex shrink-0 flex-col border-e border-hairline bg-surface-raised print:hidden",
        "sticky top-0 z-sticky h-screen transition-[width] duration-3 ease-inout",
        collapsed ? "w-[80px]" : "w-[256px]",
        "max-md:fixed max-md:inset-y-0 max-md:start-0 max-md:w-[256px] max-md:shadow-lg max-md:transition-transform max-md:duration-3 max-md:ease-inout max-md:z-dropdown",
        open ? "max-md:translate-x-0" : "max-md:translate-x-full"
      )}
    >
      <div
        className={cx(
          "relative flex items-center border-b border-hairline py-6",
          collapsed ? "justify-center px-0" : "px-5"
        )}
      >
        {/* وهج خافت خلف الشعار: يربط الهوية بلون brand دون تلوين الشعار نفسه */}
        <span aria-hidden className="absolute -top-4 start-4 h-24 w-28 bg-brand opacity-[0.14] blur-2xl" />
        <Logo
          className={cx(
            "relative transition-all duration-3 ease-inout",
            collapsed ? "h-[36px] w-[36px]" : "h-[52px] w-[124px]"
          )}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const count = counts[item.href];
          const header = item.group !== lastGroup ? item.group : null;
          lastGroup = item.group;

          return (
            <div key={item.href}>
              {header &&
                (collapsed ? (
                  /* المجموعة تُمثَّل بخيط حين تُطوى التسميات — الفراغ وحده لا يُقرأ كفصل */
                  <span aria-hidden className="mx-auto my-3 block h-px w-8 bg-hairline first:hidden" />
                ) : (
                  <p className="px-3 pb-1.5 pt-4 font-body text-caption text-ink-subtle first:pt-1">{header}</p>
                ))}

              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
                className={cx(
                  "group relative flex w-full items-center gap-3 overflow-hidden rounded-md px-3 py-2.5 font-body text-body no-underline",
                  "transition-colors duration-2 ease-out",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-surface-overlay font-semibold text-ink hover:text-ink hover:no-underline"
                    : "font-medium text-ink-muted hover:bg-surface-overlay hover:text-ink hover:no-underline"
                )}
              >
                <span
                  aria-hidden
                  className={cx(
                    "absolute inset-y-1.5 start-0 w-[3px] origin-top rounded-full bg-gradient-brand transition-transform duration-3 ease-out",
                    active ? "scale-y-100" : "scale-y-0"
                  )}
                />
                <Icon
                  size={20}
                  strokeWidth={2}
                  aria-hidden
                  className={cx(
                    "shrink-0 transition-transform duration-2 ease-spring group-hover:scale-110",
                    active && "text-brand"
                  )}
                />
                <span
                  className={cx(
                    "min-w-0 flex-1 truncate transition-[opacity] duration-2 ease-out",
                    collapsed && "pointer-events-none absolute opacity-0"
                  )}
                >
                  {item.label}
                </span>

                {/**
                 * الرقم يقول «بانتظار المراجعة» لا «الإجمالي»: الشريط يعدّ ما يحتاج
                 * عملاً، والصفحة تعدّ كل ما رُصد — ورقمان مختلفان بلا تسمية يبدوان
                 * تناقضاً. التسمية في title وفي نص مخفي لقارئ الشاشة.
                 */}
                {typeof count === "number" && count > 0 && !collapsed && (
                  <span
                    title={item.countLabel}
                    className={cx(
                      "num shrink-0 rounded-full px-2 py-0.5 font-mono text-caption font-semibold",
                      active
                        ? "bg-[color-mix(in_srgb,var(--brand)_32%,transparent)] text-ink"
                        : "bg-[color-mix(in_srgb,var(--ink)_16%,transparent)] text-ink"
                    )}
                  >
                    {count}
                    <span className="sr-only"> {item.countLabel}</span>
                  </span>
                )}
                {typeof count === "number" && count > 0 && collapsed && (
                  <span aria-hidden className="absolute end-3 top-2 h-1.5 w-1.5 rounded-full bg-brand" />
                )}
              </Link>
            </div>
          );
        })}
      </div>

      <div className={cx("border-t border-hairline", collapsed ? "p-2" : "p-3")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3 pb-2" title="نواة معزولة — النماذج تعمل محلياً">
            <LiveDot />
            <Lock size={18} strokeWidth={2} className="text-ink-subtle" aria-hidden />
          </div>
        ) : (
          <div className="well p-3">
            <p className="flex items-center gap-2 font-body text-body-sm font-semibold text-ink">
              <LiveDot />
              الوكيل متصل
            </p>
            <p className="mt-2.5 flex items-start gap-2 font-body text-caption text-ink-muted">
              <Lock size={14} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
              نواة معزولة — لا تخرج بيانات المنشأة
            </p>
            <p className="mt-1.5 flex items-start gap-2 font-body text-caption text-ink-muted">
              <Box size={14} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
              النماذج محلياً · Qwen2.5 14B
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "توسيع شريط التنقل" : "طيّ شريط التنقل"}
          className={cx(
            "mt-2 hidden w-full items-center gap-3 rounded-md px-3 py-2 font-body text-caption text-ink-subtle transition-colors duration-2 hover:bg-surface-overlay hover:text-ink md:flex",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <PanelRightOpen size={18} strokeWidth={2} aria-hidden />
          ) : (
            <PanelRightClose size={18} strokeWidth={2} aria-hidden />
          )}
          {!collapsed && <span>طيّ الشريط</span>}
        </button>
      </div>
    </nav>
  );
}

/** نبضة «حيّ»: النقطة الوحيدة التي تنبض في الشريط — تعميمها يُلغي معناها. */
function LiveDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success opacity-70 motion-reduce:hidden" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
    </span>
  );
}
