import { cx } from "@/lib/utils";

/**
 * الهيكل يأخذ مقاس المحتوى القادم بالضبط. أي فرق بينهما يُقرأ كقفزة في التخطيط
 * لحظة وصول البيانات — وهي أسوأ من انتظار بلا هيكل أصلاً.
 */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cx("skeleton block", className)} />;
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface-raised" aria-hidden>
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-3 w-32" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-hairline px-4 py-4 last:border-b-0">
          <span className="flex-1">
            <Skeleton className="mb-2 h-3.5 w-1/2" />
            <Skeleton className="h-2.5 w-1/4" />
          </span>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14" />
        </div>
      ))}
    </div>
  );
}
