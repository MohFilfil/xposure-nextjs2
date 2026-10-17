import { cx } from "@/lib/utils";

/**
 * اللوح: الوحدة البصرية الأساسية. خلفيته تدرّج مضاء من الأعلى وظلّه بعيد —
 * لا حدّ رمادي صلب. الفصل عن الخلفية يقع بالإضاءة والعمق، لأن عشرة صناديق
 * محاطة بخطوط تُقرأ كمخطط سلكي لا كواجهة.
 *
 * ثلاثة خيارات لا رابع:
 * - hover: رفع 2px وظل — للوح الذي يفتح النقر عليه شاشة.
 * - glow: حدّ بتدرّج الهوية — للوح واحد «بطل» في الشاشة، لا أكثر.
 * - glass: خلفية ضبابية — للأسطح التي يمرّ المحتوى تحتها، لا للوح داخل التدفق.
 */
export function Card({
  children,
  className,
  style,
  hover,
  glow,
  glass,
  flush
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  glow?: boolean;
  glass?: boolean;
  /** يلغي الحشو الداخلي: للوح يحتوي جدولاً أو رسماً يمتد إلى حوافه. */
  flush?: boolean;
}) {
  return (
    <section
      className={cx(
        glass ? "glass relative rounded-lg border" : "panel",
        !flush && "p-6",
        glow && "ring-gradient",
        hover && "lift cursor-pointer hover:border-[color-mix(in_srgb,var(--brand)_40%,var(--hairline))]",
        className
      )}
      style={style}
    >
      {children}
    </section>
  );
}

/**
 * ترويسة اللوح: عنوان بوزن كامل، وسطر سياق اختياري تحته بلون أخفت.
 * الـ aside للشارة أو الرقم المصاحب — لا لزر إجراء، فالإجراء يقع في تذييل اللوح
 * أو في ترويسة الصفحة حيث يبحث عنه المستخدم.
 */
export function CardHead({
  title,
  sub,
  aside
}: {
  title: string;
  sub?: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-display text-h2 text-ink">{title}</h2>
        {sub && <p className="mt-1 font-body text-body-sm text-ink-muted">{sub}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}

/** الفاصل الأفقي فوق التذييل إلزامي — لا يُترك بمسافة بيضاء وحدها. */
export function CardFoot({ children }: { children: React.ReactNode }) {
  return (
    <footer className="mt-5 border-t border-hairline pt-4 font-body text-body-sm text-ink-muted">{children}</footer>
  );
}
