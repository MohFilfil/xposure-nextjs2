import { cx } from "@/lib/utils";

const MASK = {
  maskImage: "url(/logos/xposure-aperture-vector.svg)",
  WebkitMaskImage: "url(/logos/xposure-aperture-vector.svg)",
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center"
} as const;

/**
 * نمط العدسة والتشظي. لونه ink-muted دائماً، ويظهر في ثلاثة سياقات فقط:
 * مؤشر التحميل، الحالة الفارغة، والغلاف. لا يظهر داخل بطاقة أو صف فيه بيانات حقيقية.
 */
export function MotifSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx("block bg-ink-muted animate-motif-spin motion-reduce:animate-none", className)}
      style={MASK}
    />
  );
}

const SHARDS = [
  [18, 26, 3],
  [112, 34, 2.5],
  [26, 104, 2],
  [104, 110, 3],
  [8, 64, 2],
  [124, 74, 2],
  [60, 12, 2.5],
  [68, 126, 2]
];

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="relative h-[132px] w-[132px]">
        <svg viewBox="0 0 132 132" aria-hidden className="absolute inset-0 text-ink-muted opacity-40">
          {SHARDS.map(([cx_, cy, r], i) => (
            <circle key={i} cx={cx_} cy={cy} r={r} fill="currentColor" />
          ))}
        </svg>
        <span aria-hidden className="mx-auto mt-5 block h-[92px] w-[92px] bg-ink-muted opacity-50" style={MASK} />
      </div>
      <h2 className="font-display text-h2">{title}</h2>
      <p className="max-w-[46ch] font-body text-body text-ink-muted">{description}</p>
      {action}
    </div>
  );
}
