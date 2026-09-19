/**
 * حصراً لدرجة ثقة النموذج — لا يُستخدم لأي نسبة أخرى في النظام.
 * علامة العتبة عند 70% تظهر دائماً مهما كانت القيمة.
 * أقل من 70% → danger مع نص «حُوّل للمراجعة اليدوية» إلزامي بجانب الرقم.
 */
export function ConfidenceBar({ value }: { value: number }) {
  const band = value >= 95 ? "high" : value >= 70 ? "mid" : "low";
  const color = band === "high" ? "var(--success)" : band === "mid" ? "var(--warning)" : "var(--danger)";
  const note =
    band === "high" ? "يمكن اعتماد التوصية مباشرة." : band === "mid" ? "يُنصح بمراجعة أدق قبل الاعتماد." : null;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-body text-body-sm text-ink-muted">درجة ثقة النموذج</span>
        <span className="font-display text-h2" style={{ color }}>
          {value}%
        </span>
      </div>

      <div className="relative h-2 rounded-full bg-surface-overlay">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
        {/* علامة العتبة: 30% من بداية المحور تساوي موضع 70% */}
        <div className="absolute -top-1 -bottom-1 w-[2px] bg-ink-muted" style={{ insetInlineStart: "30%" }} aria-hidden />
      </div>

      <div className="h-5">
        <span
          className="relative block w-fit translate-x-1/2 font-body text-caption text-ink-muted"
          style={{ insetInlineStart: "30%" }}
        >
          عتبة 70%
        </span>
      </div>

      {band === "low" && <div className="font-body text-body-sm font-bold text-danger">حُوّل للمراجعة اليدوية</div>}
      {note && <div className="mt-2 font-body text-body-sm text-ink-muted">{note}</div>}
    </div>
  );
}
