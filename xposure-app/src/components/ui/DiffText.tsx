import { Minus, Plus } from "lucide-react";
import type { DiffSegment } from "@/lib/types";
import { cx } from "@/lib/utils";

/**
 * لا اعتماد على اللون وحده: المحذوف يحمل علامة «−» و line-through، والمضاف «+»
 * و underline. العلامة تُرسم كرمز صغير مرتفع خارج مجرى النص بدل حرف داخله —
 * فالنص يبقى مقروءاً كجملة، وتبقى العلامة قابلة للالتقاط بلا لون.
 *
 * العمود الأيمن دائماً «الجديد» والأيسر «السابق» — ثابت في كل شاشات النظام،
 * لأن القارئ العربي يبدأ من اليمين، والنسخة التي تعنيه هي النافذة.
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
            className={cx(
              "rounded-sm px-1 py-0.5 font-medium decoration-2 underline-offset-[3px]",
              isDel
                ? "bg-[color-mix(in_srgb,var(--danger)_16%,transparent)] text-danger line-through decoration-[color-mix(in_srgb,var(--danger)_70%,transparent)]"
                : "bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-success underline decoration-[color-mix(in_srgb,var(--success)_60%,transparent)]"
            )}
          >
            <span
              aria-hidden
              className={cx(
                "me-0.5 inline-block align-[0.35em] text-[9px] font-bold leading-none no-underline",
                isDel ? "text-danger" : "text-success"
              )}
              style={{ textDecoration: "none" }}
            >
              {isDel ? "−" : "+"}
            </span>
            {segment.text}
          </span>
        );
      })}
    </>
  );
}

function Column({
  label,
  version,
  segments,
  current
}: {
  label: string;
  version: string;
  segments: DiffSegment[];
  current?: boolean;
}) {
  return (
    <div
      className={cx(
        "panel flex flex-col p-5",
        /**
         * النسخة النافذة تحمل خيط الهوية على حافتها العليا بدل خيط الضوء المحايد:
         * أيّ العمودين يُقرأ أولاً ليس تفصيلاً — الجديد هو ما يُقرَّر بشأنه.
         */
        current && "before:bg-gradient-brand"
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-hairline pb-3">
        <span className={cx("font-body text-caption font-semibold", current ? "text-brand" : "text-ink-subtle")}>
          {label}
        </span>
        <span className="num font-mono text-caption text-ink-muted" dir="ltr">
          {version}
        </span>
      </div>
      <p className="font-body text-body leading-[30px] text-ink">
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
  const added = current.filter((s) => s.kind === "add").length;
  const removed = previous.filter((s) => s.kind === "del").length;

  /** التسمية تصل كنص واحد «الإصدار الجديد · ECC-2:2024» — يُفصل ليأخذ كل جزء وزنه. */
  const split = (s: string) => {
    const i = s.indexOf("·");
    return i === -1 ? { name: s, version: "" } : { name: s.slice(0, i).trim(), version: s.slice(i + 1).trim() };
  };
  const cur = split(currentLabel);
  const prev = split(previousLabel);

  return (
    <div className="flex flex-col gap-4">
      {/**
       * سطر الحصيلة قبل النصّين: يقول حجم التغيير قبل قراءته. المراجع الذي يفتح
       * عشرين بنداً يحتاج أن يعرف في لمحة أهو تعديل كلمة أم إعادة صياغة كاملة.
       */}
      <div className="flex flex-wrap items-center gap-2">
        {added > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--success)_14%,transparent)] px-3 py-1 font-body text-caption text-success">
            <Plus size={13} strokeWidth={3} aria-hidden />
            {added} إضافة
          </span>
        )}
        {removed > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] px-3 py-1 font-body text-caption text-danger">
            <Minus size={13} strokeWidth={3} aria-hidden />
            {removed} حذف
          </span>
        )}
        {added === 0 && removed === 0 && (
          <span className="font-body text-caption text-ink-muted">لا فروق داخل نص البند نفسه.</span>
        )}
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Column label={cur.name} version={cur.version} segments={current} current />
        <Column label={prev.name} version={prev.version} segments={previous} />
      </div>
    </div>
  );
}
