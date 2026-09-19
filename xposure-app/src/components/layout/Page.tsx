export function Page({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-1 flex-col gap-10 px-4 py-5 md:px-6 md:py-6 xl:px-12 xl:py-8">{children}</main>;
}

export function PageHead({
  title,
  lede,
  action
}: {
  title: string;
  lede?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <h1 className="font-display text-display-lg text-ink">{title}</h1>
        {lede && <p className="mt-2 max-w-[68ch] font-body text-body-lg text-ink-muted">{lede}</p>}
      </div>
      {action}
    </div>
  );
}
