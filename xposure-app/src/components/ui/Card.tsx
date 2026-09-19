import { cx } from "@/lib/utils";

/**
 * خلفية surface-raised دائماً و radius-lg بلا استثناء.
 * لا ظل تحت بطاقة ساكنة؛ الظل لحالة hover على بطاقة قابلة للنقر بالكامل فقط.
 */
export function Card({
  children,
  className,
  style
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section className={cx("rounded-lg border border-border bg-surface-raised p-5", className)} style={style}>
      {children}
    </section>
  );
}

export function CardHead({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <header className="mb-4 flex items-center justify-between gap-4">
      <h2 className="font-display text-h2 text-ink">{title}</h2>
      {aside}
    </header>
  );
}

/** الفاصل الأفقي فوق التذييل إلزامي — لا يُترك بمسافة بيضاء وحدها. */
export function CardFoot({ children }: { children: React.ReactNode }) {
  return <footer className="mt-4 border-t border-border pt-3 font-body text-body-sm text-ink-muted">{children}</footer>;
}
