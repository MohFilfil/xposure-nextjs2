"use client";

import { useEffect, useState } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { useT } from "@/components/I18nProvider";
import { Num } from "@/components/ui/Bidi";

/**
 * حصراً لدرجة ثقة النموذج — لا يُستخدم لأي نسبة أخرى في النظام.
 * علامة العتبة عند 70% تظهر دائماً مهما كانت القيمة.
 * أقل من 70% → danger مع نص «حُوّل للمراجعة اليدوية» إلزامي بجانب الرقم.
 * الشريط يمتلئ من الصفر عند الظهور: الامتلاء يجعل موقع القيمة من العتبة مقروءاً
 * قبل قراءة الرقم نفسه.
 */
export function ConfidenceBar({ value }: { value: number }) {
  const t = useT();
  const [filled, setFilled] = useState(false);
  const band = value >= 95 ? "high" : value >= 70 ? "mid" : "low";
  const color = band === "high" ? "var(--success)" : band === "mid" ? "var(--warning)" : "var(--danger)";
  const note =
    band === "high" ? t.widgets.confidenceHigh : band === "mid" ? t.widgets.confidenceMid : null;

  useEffect(() => {
    const t = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-body text-body-sm text-ink-muted">{t.widgets.confidence}</span>
        <span className="font-display text-h2" style={{ color }}>
          <CountUp value={value} suffix="%" />
        </span>
      </div>

      <div className="relative h-2 rounded-full bg-surface-sunken">
        <div
          className="h-full rounded-full"
          style={{
            width: filled ? `${value}%` : "0%",
            background: color,
            boxShadow: `0 0 12px -2px ${color}`,
            transition: "width var(--dur-5) var(--ease-out)"
          }}
        />
        {/* علامة العتبة: 30% من بداية المحور تساوي موضع 70% */}
        <div className="absolute -bottom-1 -top-1 w-[2px] bg-ink-muted" style={{ insetInlineStart: "30%" }} aria-hidden />
      </div>

      <div className="h-5">
        <span
          className="relative block w-fit translate-x-1/2 font-body text-caption text-ink-muted"
          style={{ insetInlineStart: "30%" }}
        >
          {t.widgets.threshold} <Num>70%</Num>
        </span>
      </div>

      {band === "low" && <div className="font-body text-body-sm font-bold text-danger">{t.widgets.escalated}</div>}
      {note && <div className="mt-2 font-body text-body-sm text-ink-muted">{note}</div>}
    </div>
  );
}
