"use client";

import { landingContent, type LandingContent } from "@/content/landing-content";
import { useI18n } from "@/components/I18nProvider";
import { Reveal } from "@/components/motion/Reveal";
import { cx } from "@/lib/utils";

/**
 * القطع المشتركة بين أقسام الصفحة التعريفية.
 *
 * كل نصّ معروض في هذه الصفحة يأتي من content/landing-content.ts — لا جملة واحدة
 * مكتوبة داخل مكوّن. وكل لون ومقاس يأتي من رموز التطبيق نفسها (tokens.css عبر
 * tailwind.config.ts)، فالسمة الفاتحة تعمل هنا كما تعمل في بقية الشاشات بلا
 * لوحة ألوان ثانية.
 */

/** نصّ الصفحة بلغة الواجهة الحالية. */
export function useLanding(): LandingContent {
  const { lang } = useI18n();
  return landingContent[lang];
}

/**
 * غلاف القسم: عرض أقصى واحد، وحشو جانبي واحد، ومسافة رأسية واحدة على سلّم 8px
 * (80px على الهاتف، 112px على المكتب). التبديل بين سطحين فقط — surface و
 * surface-raised — هو ما يفصل الأقسام، لا خطوط ولا ظلال.
 */
export function Section({
  id,
  raised,
  children,
  className
}: {
  id?: string;
  raised?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      /* scroll-mt: الشريط العلوي لاصق، فبدونها يختفي عنوان القسم تحته عند القفز إليه */
      className={cx(
        "scroll-mt-20 px-4 py-20 md:px-8 md:py-28",
        raised ? "bg-surface-raised" : "bg-surface",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </section>
  );
}

/**
 * ترويسة القسم: عنوان ثم جملة واحدة تشرحه. العنوان من الدرجة display-sm على
 * الهاتف و display-lg على المكتب — درجتان من سلّم التطبيق لا مقاس جديد.
 */
export function SectionHead({
  title,
  subtitle,
  align = "start"
}: {
  title: string;
  subtitle?: string;
  align?: "start" | "center";
}) {
  return (
    <Reveal className={cx("flex flex-col gap-4", align === "center" && "items-center text-center")}>
      <h2 className="max-w-[22ch] text-balance font-display text-display-sm text-ink md:text-display-lg">{title}</h2>
      {subtitle && (
        /* 65 محرفاً حدّاً أقصى للسطر، و line-height مريح للعربية */
        <p className="max-w-[65ch] font-body text-body-lg leading-[1.85] text-ink-muted">{subtitle}</p>
      )}
    </Reveal>
  );
}

/**
 * بطاقة: سطح مرتفع بحدّ شعري ونصف قطر واحد. لا ظلّ على ساكن؛ الارتفاع عند
 * التحويم وحده، فلا تتزاحم عشر بطاقات بظلالها على الشاشة.
 */
export function Card({
  children,
  className,
  interactive
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex h-full flex-col gap-3 rounded-lg border border-hairline bg-surface-overlay/60 p-6",
        interactive &&
          "transition-[border-color,transform] duration-2 ease-out hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--brand)_40%,var(--hairline))] motion-reduce:hover:translate-y-0",
        className
      )}
    >
      {children}
    </div>
  );
}
