"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Binary,
  CircleDot,
  ClipboardCheck,
  Eye,
  FileSearch,
  GitCompare,
  Landmark,
  ListChecks,
  Lock,
  Radar,
  Server,
  ShieldCheck,
  Stamp,
  Target,
  UserCheck,
  Users,
  Wrench
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Num } from "@/components/ui/Bidi";
import { ReviewMock } from "./ReviewMock";
import { Card, Section, SectionHead, useLanding } from "./shell";
import { cx } from "@/lib/utils";

/* ================================ الصدارة ================================ */

/**
 * الصدارة: عمودان على المكتب — الكلام على حافة البداية والمحاكاة على حافة
 * النهاية — وعمود واحد على الهاتف. العنوان بدرجة display-xl، وتحته جملة واحدة
 * ثم فعلان: الأساسي إلى الدخول، والثانوي إلى قسم «كيف يعمل» في الصفحة نفسها.
 */
export function Hero() {
  const c = useLanding();

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-12 md:px-8 md:pb-28 md:pt-20">
      {/* الهالة نفسها التي تفتتح لوحة التحكم — الصفحة والتطبيق من منتج واحد */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-hero" />

      {/**
       * لا Reveal في الصدارة عمداً: مكوّن الكشف يبدأ من opacity:0 ولا يُظهر
       * المحتوى إلا بعد ترطيب JS، فكان أكبر عنصر مرئي (العنوان) يُرسم متأخراً —
       * قياس Lighthouse: LCP ‎3.5s منها ‎3.0s انتظار ترطيب. ما يقع فوق الطيّة
       * يُرسم من أول لحظة؛ والحركة تبقى لما يأتي بعده بالتمرير.
       */}
      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-12 lg:grid-cols-[minmax(0,1.28fr)_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col items-start gap-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3.5 py-1.5 font-body text-caption text-ink-muted">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
            {c.hero.eyebrow}
          </p>

          <h1 className="max-w-[20ch] text-balance font-display text-display-lg leading-[1.18] text-ink md:text-display-xl md:leading-[1.14]">
            {c.hero.title}
          </h1>

          <p className="max-w-[62ch] font-body text-body-lg leading-[1.9] text-ink-muted">{c.hero.subtitle}</p>

          <div className="flex w-full flex-col items-stretch gap-3 pt-1 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 font-body text-body font-semibold text-on-brand transition-colors duration-2 hover:bg-brand-hover hover:text-on-brand hover:no-underline"
            >
              {c.hero.primaryCta}
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3.5 font-body text-body font-semibold text-ink transition-colors duration-2 hover:border-brand hover:text-brand hover:no-underline"
            >
              {c.hero.secondaryCta}
              {/* السهم يتبع اتجاه القراءة: يسار في العربية، يمين في الإنجليزية */}
              <ArrowLeft size={18} strokeWidth={2} aria-hidden className="ltr:rotate-180" />
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
            {c.hero.badges.map((badge) => (
              <li key={badge} className="flex items-center gap-2 font-body text-body-sm text-ink-muted">
                <ShieldCheck size={16} strokeWidth={2} aria-hidden className="shrink-0 text-success" />
                {badge}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <ReviewMock />
        </div>
      </div>
    </section>
  );
}

/* ================================ المشكلة ================================ */

const STAGE_ICONS: LucideIcon[] = [Radar, ClipboardCheck, GitCompare, ListChecks, ShieldCheck];

/**
 * المشكلة: جدول المراحل الخمس — اليوم مقابل مع Xposure — ثم شبكة نقاط الألم.
 * على المكتب صفوف بثلاثة أعمدة (المرحلة، اليوم، مع Xposure) فيُقرأ الفرق أفقياً؛
 * وعلى الهاتف تصير كل مرحلة بطاقة مكدّسة، فلا جدول يُمرَّر أفقياً.
 */
export function ProblemSection() {
  const c = useLanding();

  return (
    <Section id="problem" raised>
      <SectionHead title={c.problem.title} subtitle={c.problem.subtitle} />

      <h3 className="mb-6 mt-14 font-display text-h2 text-ink">{c.problem.stagesTitle}</h3>

      {/**
       * بلا رأس جدول: ملف المحتوى لا يحمل تسميات للأعمدة، ولن تُكتب هنا. العمود
       * الأوسط هو الحال اليوم والثالث ما يصير مع Xposure، وتمييزه بالنقطة الملوّنة
       * وبحبر أفتح يكفي — ولا تُخترع تسمية لتملأ خانة.
       */}
      <div className="flex flex-col gap-2.5">
        {c.problem.stages.map((stage, i) => {
          const Icon = STAGE_ICONS[i] ?? CircleDot;
          return (
            <Reveal key={stage.name} index={i}>
              <div className="grid gap-4 rounded-lg border border-hairline bg-surface-overlay/50 p-5 md:grid-cols-[minmax(140px,0.8fr)_minmax(0,1.2fr)_minmax(0,1.2fr)] md:items-start">
                <p className="flex items-center gap-2.5 font-body text-body font-semibold text-ink">
                  <Icon size={18} strokeWidth={2} aria-hidden className="shrink-0 text-ink-muted" />
                  {stage.name}
                </p>
                <p className="font-body text-body-sm leading-[1.85] text-ink-muted">{stage.today}</p>
                <p className="font-body text-body-sm leading-[1.85] text-ink">
                  <span aria-hidden className="me-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
                  {stage.withXposure}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <h3 className="mb-6 mt-16 font-display text-h2 text-ink">{c.problem.painTitle}</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.problem.pains.map((pain, i) => (
          <Reveal key={pain.title} index={i} className="h-full">
            <Card>
              <h4 className="font-display text-h3 text-ink">{pain.title}</h4>
              <p className="font-body text-body-sm leading-[1.85] text-ink-muted">{pain.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ============================== كيف يعمل ============================== */

const STEP_ICONS: LucideIcon[] = [Radar, GitCompare, FileSearch, Stamp, ListChecks];

/**
 * كيف يعمل: خمس خطوات على خطّ واحد. الخطّ أفقي على المكتب (الترتيب يُقرأ من
 * حافة البداية إلى حافة النهاية فينقلب مع اللغة) ورأسي على الهاتف.
 *
 * الخطوة الرابعة — قرار المختص — تحمل لون الهوية: هي الوحيدة التي يملكها إنسان،
 * وهذا هو الوعد الذي تقوم عليه بقية الصفحة.
 */
export function HowSection() {
  const c = useLanding();
  const humanStep = 3;

  return (
    <Section id="how">
      <SectionHead title={c.how.title} subtitle={c.how.subtitle} />

      <ol className="mt-14 grid gap-4 md:grid-cols-5 md:gap-3">
        {c.how.steps.map((step, i) => {
          const Icon = STEP_ICONS[i] ?? CircleDot;
          const human = i === humanStep;
          return (
            <Reveal key={step.title} index={i} as="li" className="h-full">
              <div
                className={cx(
                  "flex h-full flex-col gap-3 rounded-lg border p-5",
                  human ? "border-brand bg-[color-mix(in_srgb,var(--brand)_10%,transparent)]" : "border-hairline bg-surface-raised"
                )}
              >
                <span
                  aria-hidden
                  className={cx(
                    "flex h-10 w-10 items-center justify-center rounded-md",
                    human ? "bg-brand text-on-brand" : "bg-surface-overlay text-ink-muted"
                  )}
                >
                  <Icon size={20} strokeWidth={2} />
                </span>
                <h3 className="font-display text-h3 text-ink">{step.title}</h3>
                <p className="font-body text-body-sm leading-[1.85] text-ink-muted">{step.body}</p>
              </div>
            </Reveal>
          );
        })}
      </ol>

      {/**
       * الخطّ الواصل: يُرسم تحت البطاقات على المكتب وحده. ليس زينة — هو ما يقول
       * إن الخمسة سلسلة لا خمس ميزات، والنقطة الملوّنة فيه هي موضع القرار البشري.
       */}
      <div aria-hidden className="mt-4 hidden md:block">
        <div className="relative h-1 w-full rounded-full bg-surface-overlay">
          <span className="absolute inset-y-0 start-0 w-[70%] rounded-full bg-[color-mix(in_srgb,var(--brand)_45%,transparent)]" />
          <span className="absolute -top-1 h-3 w-3 rounded-full bg-brand" style={{ insetInlineStart: "calc(70% - 6px)" }} />
        </div>
      </div>
    </Section>
  );
}

/* ============================== لمن هو ============================== */

const ROLE_ICONS: LucideIcon[] = [Landmark, Stamp, Wrench, Eye, Server];

/** لمن هو: بطاقة لكل دور، وما الذي يحصل عليه. خمس بطاقات في ثلاثة أعمدة. */
export function RolesSection() {
  const c = useLanding();

  return (
    <Section id="roles" raised>
      <SectionHead title={c.roles.title} subtitle={c.roles.subtitle} />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.roles.items.map((item, i) => {
          const Icon = ROLE_ICONS[i] ?? Users;
          return (
            <Reveal key={item.role} index={i} className="h-full">
              <Card interactive>
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-overlay text-ink-muted"
                >
                  <Icon size={20} strokeWidth={2} />
                </span>
                <h3 className="font-display text-h3 text-ink">{item.role}</h3>
                <p className="font-body text-body-sm leading-[1.85] text-ink-muted">{item.body}</p>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ============================== الثقة ============================== */

const TRUST_ICONS: LucideIcon[] = [Binary, Lock, UserCheck, ShieldCheck, ClipboardCheck];

/** نموذج الثقة: خمس بطاقات، كل واحدة حدٌّ من حدود صلاحية الوكيل. */
export function TrustSection() {
  const c = useLanding();

  return (
    <Section id="trust">
      <SectionHead title={c.trust.title} subtitle={c.trust.subtitle} />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.trust.items.map((item, i) => {
          const Icon = TRUST_ICONS[i] ?? ShieldCheck;
          return (
            <Reveal key={item.title} index={i} className="h-full">
              <Card>
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-success"
                >
                  <Icon size={20} strokeWidth={2} />
                </span>
                <h3 className="font-display text-h3 text-ink">{item.title}</h3>
                <p className="font-body text-body-sm leading-[1.85] text-ink-muted">{item.body}</p>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ============================== الأهداف ============================== */

/**
 * ما نستهدف قياسه. هذه أهداف لا نتائج، والملاحظة تقولها صراحةً تحت العنوان —
 * ولذلك لا تُعرض كأرقام كبيرة ولا كمؤشرات إنجاز، بل كقائمة مقاصد.
 */
export function GoalsSection() {
  const c = useLanding();

  return (
    <Section raised>
      {/**
       * ترتيب هذا القسم كترتيب بقية الأقسام: عنوان ثم شبكة. العمودان المتجاوران
       * كانا يتركان نصف القسم فارغاً على الشاشات العريضة.
       *
       * التنبيه فوق البطاقات لا تحتها: من يقرأ «ساعات بدل أسابيع» يجب أن يكون قد
       * قرأ قبلها أن هذه أهداف تُقاس في التجربة، لا نتائج محققة.
       */}
      <div className="flex flex-col gap-4">
        <Reveal>
          <h2 className="max-w-[22ch] text-balance font-display text-display-sm text-ink md:text-display-lg">
            {c.goals.title}
          </h2>
        </Reveal>
        <Reveal index={1}>
          <p className="inline-flex max-w-[65ch] items-start gap-2 rounded-md border border-warning/40 bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] p-3.5 font-body text-body-sm leading-[1.8] text-ink">
            <Target size={18} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0 text-warning" />
            {c.goals.note}
          </p>
        </Reveal>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {c.goals.items.map((item, i) => (
          <Reveal key={item} index={i + 2} as="li" className="h-full">
            <div className="flex h-full flex-col gap-3 rounded-lg border border-hairline bg-surface-overlay/50 p-6">
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border font-body text-caption text-ink-muted"
              >
                <Num>{i + 1}</Num>
              </span>
              <p className="font-body text-body leading-[1.85] text-ink">{item}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ============================== الدعوة والتذييل ============================== */

/** شريط الدعوة الأخير: عنوان وجملة وزرّ واحد إلى شاشة الدخول. */
export function FinalCta() {
  const c = useLanding();

  return (
    <Section>
      <Reveal>
        <div className="flex flex-col items-center gap-6 rounded-lg border border-[color-mix(in_srgb,var(--brand)_35%,var(--hairline))] bg-[color-mix(in_srgb,var(--brand)_10%,var(--surface-raised))] px-6 py-16 text-center md:py-20">
          <h2 className="max-w-[20ch] text-balance font-display text-display-sm text-ink md:text-display-lg">{c.cta.title}</h2>
          <p className="max-w-[58ch] font-body text-body-lg leading-[1.9] text-ink-muted">{c.cta.body}</p>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-brand px-7 py-4 font-body text-body font-semibold text-on-brand transition-colors duration-2 hover:bg-brand-hover hover:text-on-brand hover:no-underline"
          >
            {c.cta.button}
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}

/** التذييل: سطر تعريف، وسياق الفريق والتحدي، والروابط نفسها التي في الشريط العلوي. */
export function LandingFooter() {
  const c = useLanding();

  return (
    <footer className="border-t border-hairline bg-surface-raised px-4 py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-[52ch] flex-col gap-2">
            <p className="font-display text-h3 text-ink">{c.footer.tagline}</p>
            <p className="font-body text-body-sm text-ink-muted">{c.footer.context}</p>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2">
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
            <li>
              <Link
                href="/login"
                className="font-body text-body-sm font-semibold text-ink underline decoration-[color-mix(in_srgb,var(--brand)_60%,transparent)] decoration-2 underline-offset-4 transition-colors duration-2 hover:text-brand hover:decoration-brand"
              >
                {c.nav.demoCta}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
