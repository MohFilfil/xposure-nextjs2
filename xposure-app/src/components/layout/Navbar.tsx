"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, LogOut, Menu, Moon, Search, Settings2, Sun, UserCog } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useTheme } from "@/components/ThemeProvider";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { useContent, useRoleCopy } from "@/lib/content";
import { useToast } from "@/components/ui/Toast";
import { useCommandPalette } from "@/components/ui/CommandPalette";
import { ROLE_ORDER, homeFor, type Role } from "@/lib/roles";
import { cx } from "@/lib/utils";

/**
 * ارتفاع ثابت 56px في كل الشاشات — رأس الجدول اللاصق يعتمد عليه (top-14).
 *
 * لا يحمل الشريط عنوان الصفحة: كل صفحة تفتتح بـ h1 خاص بها، وتكرار الاسم
 * مرتين فوق بعض يستهلك سطراً بلا معلومة. مكانه سياق لا تقوله الصفحة: المنشأة
 * التي تُعرَض بياناتها، والدور الذي يراها به.
 * نقطة الجرس دائماً danger مهما كان نوع الإشعار.
 * الشريط زجاجي لأن المحتوى يمرّ تحته عند التمرير؛ خلفه بديل صلب للمتصفحات
 * التي لا تدعم backdrop-filter (انظر .glass في globals.css).
 */
export function Navbar({ onMenu }: { onMenu: () => void }) {
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const router = useRouter();
  const openPalette = useCommandPalette();
  const { role, switchRole, signOut } = useSession();
  const t = useT();
  const roleCopy = useRoleCopy();
  const { company } = useContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  return (
    <header className="glass sticky top-0 z-sticky flex h-14 shrink-0 items-center justify-between gap-4 border-b px-5 print:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label={t.common.openMenu}
          className="flex rounded-md p-1 text-ink-muted transition-colors duration-1 hover:bg-surface-overlay hover:text-ink md:hidden"
        >
          <Menu size={24} strokeWidth={2} aria-hidden />
        </button>
        {/* الشعار على الشاشات الضيّقة وحدها: الشريط الجانبي مطويّ هناك فيغيب معه */}
        <Logo className="h-7 w-16 shrink-0 md:hidden" />
        <span className="hidden min-w-0 flex-col md:flex">
          <span className="truncate font-body text-body-sm font-semibold text-ink">{company.split(" (")[0]}</span>
          {role && <span className="truncate font-body text-caption text-ink-muted">{roleCopy.label(role)}</span>}
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* مدخل البحث الشامل: زر على الشاشات الصغيرة، وحقل يشرح اختصاره على الكبيرة */}
        <button
          type="button"
          onClick={openPalette}
          aria-label={t.common.searchAndCommands}
          className="group flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-ink-muted transition-colors duration-2 hover:border-brand hover:text-ink max-md:border-0 max-md:bg-transparent max-md:px-1"
        >
          <Search size={20} strokeWidth={2} aria-hidden />
          <span className="hidden font-body text-body-sm md:inline">{t.common.search}</span>
          <kbd className="hidden rounded-sm border border-border px-1.5 font-mono text-caption text-ink-subtle transition-colors duration-2 group-hover:border-brand group-hover:text-brand lg:inline">
            Ctrl K
          </kbd>
        </button>

        <button
          type="button"
          aria-label={t.common.notifications}
          onClick={() => toast("info", t.toast.notifications)}
          className="group relative flex rounded-md p-1 text-ink-muted transition-colors duration-1 hover:bg-surface-overlay hover:text-ink"
        >
          <span className="absolute end-0 top-0 z-10 h-2 w-2 rounded-full border-2 border-surface-raised bg-danger" aria-hidden />
          <span
            aria-hidden
            className="absolute end-0 top-0 h-2 w-2 animate-pulse-ring rounded-full bg-danger motion-reduce:hidden"
          />
          <Bell
            size={24}
            strokeWidth={2}
            aria-hidden
            className="origin-top transition-transform duration-2 ease-spring group-hover:rotate-[10deg]"
          />
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label={theme === "dark" ? t.common.toLight : t.common.toDark}
          className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md text-ink-muted transition-colors duration-1 hover:bg-surface-overlay hover:text-ink"
        >
          {/* الشمس والقمر متراكبان: التبديل دوران وتلاشٍ، لا استبدال مفاجئ للأيقونة */}
          <Sun
            size={24}
            strokeWidth={2}
            aria-hidden
            className={cx(
              "absolute transition-all duration-3 ease-out",
              theme === "dark" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
            )}
          />
          <Moon
            size={24}
            strokeWidth={2}
            aria-hidden
            className={cx(
              "absolute transition-all duration-3 ease-out",
              theme === "dark" ? "-rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
            )}
          />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={t.common.userMenu}
            className="flex items-center gap-2 rounded-md p-1 transition-colors duration-1 hover:bg-surface-overlay"
          >
            {/* الصورة الرمزية: دائرية بخلفية brand وحرف واحد — لا أيقونة شخص عامة */}
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand font-body text-body-sm font-bold text-on-brand shadow-glow"
              aria-hidden
            >
              {role ? roleCopy.name(role).trim()[0] : "?"}
            </span>
            <span className="hidden font-body text-body-sm text-ink-muted md:inline">{role ? roleCopy.name(role) : ""}</span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label={t.common.userMenu}
              className="glass absolute end-0 top-[calc(100%+8px)] z-dropdown flex w-[288px] animate-scale-in flex-col gap-1 rounded-lg border p-2 shadow-lg"
            >
              <div className="border-b border-hairline px-3 pb-2 pt-1">
                <span className="block font-body text-body-sm font-bold text-ink">{role ? roleCopy.name(role) : ""}</span>
                <span className="block font-body text-caption text-ink-muted">{role ? roleCopy.title(role) : ""}</span>
              </div>

              {/**
               * مبدّل الدور: أداة عرض حيّ وحدها — في النظام الفعلي يأتي الدور من رمز
               * الجلسة ولا يُبدّل من الواجهة. وجوده هنا يوفّر تسجيل خروج ودخول أمام الحضور عند
               * انتقال العرض من دور إلى دور.
               */}
              <p className="flex items-center gap-2 px-3 pb-1 pt-2 font-body text-caption text-ink-subtle">
                <UserCog size={14} strokeWidth={2} aria-hidden />
                {t.login.switchRole}
              </p>
              {ROLE_ORDER.map((r) => {
                const current = r === role;
                return (
                  <button
                    key={r}
                    type="button"
                    role="menuitemradio"
                    aria-checked={current}
                    onClick={() => {
                      setMenuOpen(false);
                      if (current) return;
                      switchRole(r);
                      /* الانتقال لصفحة بداية الدور الجديد: البقاء في شاشة لا يملكها ينتهي بتحويل مرتبك */
                      router.push(homeFor(r));
                    }}
                    className={cx(
                      "flex items-center justify-between gap-3 rounded-md p-2 text-start font-body text-body-sm transition-colors duration-1 hover:bg-surface-overlay",
                      current ? "font-semibold text-ink" : "text-ink-muted hover:text-ink"
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{roleCopy.label(r)}</span>
                      <span className="truncate font-body text-caption text-ink-subtle">{roleCopy.name(r)}</span>
                    </span>
                    {current && <Check size={16} strokeWidth={2.5} className="shrink-0 text-brand" aria-hidden />}
                  </button>
                );
              })}

              <div className="mt-1 flex flex-col gap-1 border-t border-hairline pt-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="flex items-center gap-3 rounded-md p-2 text-start font-body text-body-sm text-ink transition-colors duration-1 hover:bg-surface-overlay"
                >
                  <Settings2 size={20} strokeWidth={2} aria-hidden />
                  {t.nav.settings}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                    router.push("/login");
                  }}
                  className="flex items-center gap-3 rounded-md p-2 text-start font-body text-body-sm text-ink transition-colors duration-1 hover:bg-surface-overlay"
                >
                  <LogOut size={20} strokeWidth={2} aria-hidden />
                  {t.login.signOut}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
