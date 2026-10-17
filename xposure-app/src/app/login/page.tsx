"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Box, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Chip } from "@/components/ui/Chip";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { useRoleCopy } from "@/lib/content";
import { ROLE_ORDER, homeFor, type Role } from "@/lib/roles";
import { cx } from "@/lib/utils";

/**
 * شاشة الدخول للعرض التوضيحي: خمسة حسابات جاهزة، حساب لكل دور، بلا كلمة مرور.
 *
 * الترتيب مقصود — «مسؤول الامتثال» في الصدارة لأنه الدور الذي يمرّ منه التدفق
 * الكامل (فحص ← مراجعة ← اعتماد ← مهمة)، فمن يفتح الشاشة في عرض حيّ يجد أول
 * بطاقة هي البطاقة الصحيحة. وبقية الأدوار تُقرأ بما تراه لا باسمها وحده.
 */

/** مسؤول الامتثال أولاً: هو مسار العرض الكامل. */
const ORDER: Role[] = ["compliance", ...ROLE_ORDER.filter((r) => r !== "compliance")];

export default function LoginPage() {
  const router = useRouter();
  const { role, hydrated, signIn } = useSession();
  const t = useT();
  const roleCopy = useRoleCopy();

  /* من لديه جلسة محفوظة لا يُسأل مرة أخرى — يُنقل مباشرة إلى صفحة دوره */
  useEffect(() => {
    if (hydrated && role) router.replace(homeFor(role));
  }, [hydrated, role, router]);

  function enter(next: Role) {
    signIn(next);
    router.replace(homeFor(next));
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 md:px-8">
      {/* الهالة نفسها التي تفتتح لوحة التحكم — الشاشتان من منتج واحد */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-hero" />

      <div className="relative w-full max-w-[940px]">
        <header className="flex flex-col items-start gap-5">
          <Logo className="h-[52px] w-[124px]" />
          <span className="rule block w-14" aria-hidden />
          <h1 className="font-display text-display-lg text-ink">{t.login.heading}</h1>
          <p className="max-w-[62ch] font-body text-body-lg text-ink-muted">{t.login.lede}</p>
        </header>

        <ul className="mt-9 flex flex-col gap-3">
          {ORDER.map((r, i) => {
            const recommended = r === "compliance";
            return (
              <li key={r} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <button
                  type="button"
                  onClick={() => enter(r)}
                  className={cx(
                    "panel group flex w-full items-center gap-4 p-5 text-start transition-[transform,border-color,box-shadow] duration-2 ease-out",
                    "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--brand)_40%,var(--hairline))] hover:shadow-hover",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                    recommended && "ring-gradient"
                  )}
                >
                  <span
                    aria-hidden
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-brand font-body text-body font-bold text-on-brand shadow-glow"
                  >
                    {roleCopy.name(r).trim()[0]}
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-body text-body font-bold text-ink">{roleCopy.label(r)}</span>
                      {recommended && <Chip>{t.login.recommended}</Chip>}
                    </span>
                    <span className="font-body text-body-sm text-ink-muted">
                      {roleCopy.name(r)} — {roleCopy.title(r)}
                    </span>
                    <span className="font-body text-body-sm text-ink-muted">{roleCopy.scope(r)}</span>
                  </span>

                  <span
                    aria-hidden
                    className="hidden shrink-0 items-center gap-2 font-body text-body-sm font-semibold text-brand transition-transform duration-2 ease-out group-hover:-translate-x-1 md:flex"
                  >
                    {t.login.enter}
                    <ArrowLeft size={18} strokeWidth={2} className="rtl:rotate-0 ltr:rotate-180" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <footer className="mt-9 flex flex-wrap items-center justify-between gap-5 border-t border-hairline pt-6">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 font-body text-caption text-ink-muted">
            <li className="flex items-center gap-2">
              <Lock size={14} strokeWidth={2} aria-hidden />
              {t.login.trustIsolation}
            </li>
            <li className="flex items-center gap-2">
              <Box size={14} strokeWidth={2} aria-hidden />
              {t.login.trustModels}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck size={14} strokeWidth={2} aria-hidden />
              {t.login.trustAudit}
            </li>
          </ul>
          <Link
            href="/"
            className="font-body text-body-sm font-semibold text-brand no-underline transition-colors duration-1 hover:text-brand-hover"
          >
            {t.login.backToSite}
          </Link>
        </footer>
      </div>
    </main>
  );
}
