"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/components/I18nProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useT } from "@/components/I18nProvider";
import { useLanding } from "./shell";
import { cx } from "@/lib/utils";

/**
 * الشريط العلوي: لاصق من أول بكسل، ويكتسب خلفيته وحدّه السفلي بعد أول تمرير —
 * فوق الصدارة يبقى شفافاً فلا يقطع الشاشة الأولى بخطّ، وبعدها يصير سطحاً مقروءاً
 * فوق المحتوى المارّ تحته.
 *
 * مبدّلا اللغة والسمة هنا هما مبدّلا التطبيق نفسه (I18nProvider و ThemeProvider):
 * من يبدّل اللغة هنا يجدها مبدّلة بعد الدخول، لا إعداداً منفصلاً للصفحة.
 */
export function LandingNav() {
  const c = useLanding();
  const t = useT();
  const { lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cx(
        "sticky top-0 z-sticky w-full transition-colors duration-3 ease-out",
        scrolled ? "border-b border-hairline bg-surface/95 backdrop-blur-[10px]" : "border-b border-transparent"
      )}
    >
      <nav
        aria-label={c.nav.brand}
        className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 md:h-20 md:px-8"
      >
        <Link href="/" aria-label={c.nav.brand} className="shrink-0">
          <Logo className="h-9 w-[86px] md:h-11 md:w-[105px]" />
        </Link>

        {/* الروابط تختفي على الهاتف: أربعة روابط في 390px تتزاحم، والأقسام تُقرأ بالتمرير */}
        <ul className="hidden items-center gap-7 lg:flex">
          {c.nav.links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className="font-body text-body-sm text-ink-muted transition-colors duration-2 hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="rounded-md px-2.5 py-1.5 font-body text-body-sm text-ink-muted transition-colors duration-2 hover:bg-surface-overlay hover:text-ink"
          >
            {c.nav.langToggle}
          </button>

          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? t.common.toLight : t.common.toDark}
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors duration-2 hover:bg-surface-overlay hover:text-ink"
          >
            {theme === "dark" ? (
              <Sun size={18} strokeWidth={2} aria-hidden />
            ) : (
              <Moon size={18} strokeWidth={2} aria-hidden />
            )}
          </button>

          <Link
            href="/login"
            className="rounded-md bg-brand px-4 py-2.5 font-body text-body-sm font-semibold text-on-brand transition-colors duration-2 hover:bg-brand-hover"
          >
            {c.nav.demoCta}
          </Link>
        </div>
      </nav>
    </header>
  );
}
