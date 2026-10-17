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
    <span className={cx("relative block", className)} aria-hidden>
      {/* هالة ثابتة خلف العدسة الدوّارة: تفصلها عن الخلفية بلا إضافة حركة ثانية */}
      <span className="absolute inset-0 rounded-full bg-brand opacity-20 blur-xl" />
      <span
        className="relative block h-full w-full animate-motif-spin bg-ink-muted motion-reduce:animate-none"
        style={MASK}
      />
    </span>
  );
}

/** مدارات الشظايا: نصف القطر، الحجم، مدة الدورة، وإزاحة البداية بالدرجات. */
const SHARDS = [
  [52, 3, 14, 0],
  [52, 2.5, 14, 120],
  [52, 2, 14, 240],
  [64, 2.5, 22, 60],
  [64, 2, 22, 200],
  [64, 3, 22, 310],
  [40, 2, 18, 30],
  [40, 2.5, 18, 210]
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
        {/**
         * الشظايا تدور حول العدسة في ثلاثة مدارات بسرعات مختلفة: صورة «يبحث ولا يجد»
         * بدل أيقونة ساكنة. تتوقف كلها تحت prefers-reduced-motion (globals.css).
         */}
        {SHARDS.map(([radius, size, seconds, offset], i) => (
          <span
            key={i}
            aria-hidden
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{
              animation: `motif-spin ${seconds}s linear infinite`,
              animationDelay: `${-(seconds * offset) / 360}s`
            }}
          >
            <span
              className="absolute block rounded-full bg-ink-muted opacity-40"
              style={{ width: size * 2, height: size * 2, transform: `translate(-50%, -50%) translateY(-${radius}px)` }}
            />
          </span>
        ))}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 block h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 animate-float bg-ink-muted opacity-50"
          style={MASK}
        />
      </div>
      <h2 className="font-display text-h2">{title}</h2>
      <p className="max-w-[46ch] font-body text-body text-ink-muted">{description}</p>
      {action}
    </div>
  );
}
