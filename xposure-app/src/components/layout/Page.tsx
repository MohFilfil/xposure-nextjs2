import { cx } from "@/lib/utils";

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col gap-10 px-4 py-5 md:px-6 md:py-6 xl:px-12 xl:py-8">
      {children}
    </main>
  );
}

/**
 * ترويسة الصفحة: سطر سياق صغير فوق العنوان (اختياري)، ثم العنوان، ثم جملة تشرح
 * ما الذي تراه ولماذا. الإجراء الرئيسي يقع على حافة النهاية وينزل تحت العنوان
 * على الشاشات الضيقة بدل أن يُضغط بجانبه.
 */
export function PageHead({
  title,
  lede,
  eyebrow,
  action
}: {
  title: string;
  lede?: string;
  eyebrow?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="animate-fade-up">
        {/* خط الهوية يفتتح الترويسة كما يفتتح كل عنوان قسم — لغة واحدة للعناوين */}
        <span className="rule mb-4 block w-14" aria-hidden />
        {eyebrow && <div className="mb-4 flex flex-wrap items-center gap-2">{eyebrow}</div>}
        <h1 className="font-display text-display-lg text-ink">{title}</h1>
        {lede && <p className="mt-3 max-w-[68ch] font-body text-body-lg text-ink-muted">{lede}</p>}
      </div>
      {action && <div className="animate-fade-up print:hidden [animation-delay:90ms]">{action}</div>}
    </div>
  );
}

/**
 * شارة سياق صغيرة فوق عنوان الصفحة — للجهة المصدر أو حالة النظام.
 * محايدة اللون افتراضياً: الألوان الدلالية محجوزة للحالة والأولوية.
 */
export function Eyebrow({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "live";
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-body text-caption",
        tone === "live"
          ? "border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-success"
          : "border-border bg-surface-raised text-ink-muted"
      )}
    >
      {tone === "live" && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success opacity-70 motion-reduce:hidden" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
        </span>
      )}
      {children}
    </span>
  );
}
