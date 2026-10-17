"use client";

/**
 * عنوان قسم داخل الصفحة: خط الهوية يفتتحه من حافة البداية ويتلاشى.
 * يميّز أقسام الصفحة عن ترويسات الألواح داخلها، فلا يتساوى المستويان.
 */
export function Section({
  title,
  sub,
  aside,
  children
}: {
  title: string;
  sub?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="rule mb-3 block w-14" aria-hidden />
          <h2 className="font-display text-display-sm text-ink">{title}</h2>
          {sub && <p className="mt-1.5 font-body text-body-sm text-ink-muted">{sub}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

