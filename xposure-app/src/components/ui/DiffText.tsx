import type { DiffSegment } from "@/lib/types";

/**
 * لا اعتماد على اللون وحده: المحذوف يحمل «−» و line-through، والمضاف «+» و underline.
 * العمود الأيمن دائماً «الجديد» والأيسر «السابق» — ثابت في كل شاشات النظام.
 * لا تُستخدم ألوان warning أو info هنا مهما كان نوع التغيير؛ نوع التغيير يُعرض بشارة منفصلة.
 */
function Segments({ segments }: { segments: DiffSegment[] }) {
  if (segments.length === 0) {
    return <span className="text-ink-muted">لا يوجد بند مقابل في الإصدار السابق — هذا متطلب مستحدث بالكامل.</span>;
  }
  return (
    <>
      {segments.map((segment, i) => {
        if (!segment.kind) return <span key={i}>{segment.text}</span>;
        const isDel = segment.kind === "del";
        return (
          <span
            key={i}
            className={
              isDel
                ? "rounded-sm bg-[color-mix(in_srgb,var(--danger)_22%,transparent)] px-1 font-semibold text-danger line-through"
                : "rounded-sm bg-[color-mix(in_srgb,var(--success)_22%,transparent)] px-1 font-semibold text-success underline"
            }
          >
            {isDel ? "− " : "+ "}
            {segment.text}
          </span>
        );
      })}
    </>
  );
}

function Column({ label, segments }: { label: string; segments: DiffSegment[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <div className="mb-3 font-body text-caption font-bold text-ink-muted">{label}</div>
      <p className="font-body text-body leading-[28px] text-ink">
        <Segments segments={segments} />
      </p>
    </div>
  );
}

export function DiffText({
  previous,
  current,
  previousLabel,
  currentLabel
}: {
  previous: DiffSegment[];
  current: DiffSegment[];
  previousLabel: string;
  currentLabel: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Column label={currentLabel} segments={current} />
      <Column label={previousLabel} segments={previous} />
    </div>
  );
}
