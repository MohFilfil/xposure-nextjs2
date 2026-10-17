"use client";

import { useEffect, useId, useState } from "react";

/**
 * حلقة نسبة مئوية واحدة — لدرجة الامتثال حصراً. أي نسبة أخرى تُعرض شريطاً لا حلقة،
 * حتى تبقى الحلقة في الذاكرة مرتبطة بمؤشر واحد.
 * القوس يُرسم من الصفر عند أول ظهور: الحركة هنا تقول «هذه قيمة تراكمت»، لا زينة.
 */
export function Gauge({
  value,
  size = 168,
  label,
  caption
}: {
  value: number;
  size?: number;
  label: string;
  caption?: string;
}) {
  const id = useId();
  const [drawn, setDrawn] = useState(false);
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  /* القوس مفتوح 270° لتبقى فجوة سفلية تُقرأ كبداية ونهاية للمقياس */
  const arc = c * 0.75;
  const offset = arc - (arc * value) / 100;

  useEffect(() => {
    const t = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${label}: ${value}%`}
          /* الفجوة أسفل الحلقة: دوران 135° يضع بدايتها أسفل اليمين */
          style={{ transform: "rotate(135deg)" }}
        >
          <defs>
            <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand)" />
              <stop offset="100%" stopColor="var(--brand-2)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--surface-sunken)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${c}`}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${id}-stroke)`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${c}`}
            strokeDashoffset={drawn ? offset : arc}
            style={{ transition: "stroke-dashoffset var(--dur-5) var(--ease-out)" }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <span className="num font-mono text-metric leading-none text-ink">
            {value}
            <span className="text-h2 text-ink-subtle">%</span>
          </span>
          <span className="font-body text-caption text-ink-muted">{label}</span>
        </div>
      </div>
      {caption && <p className="max-w-[24ch] text-center font-body text-body-sm text-ink-subtle">{caption}</p>}
    </div>
  );
}
