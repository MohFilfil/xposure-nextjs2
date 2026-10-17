"use client";

import { useEffect, useId, useState } from "react";

/**
 * خط اتجاه صغير داخل بطاقة مؤشر. لا محاور ولا شبكة: وظيفته الإجابة عن
 * «هل يصعد أم يهبط؟» في لمحة، والرقم المجاور هو مصدر القيمة الدقيقة.
 * الخط يُرسم من بدايته لنهايته مرة واحدة — اتجاه الرسم هو اتجاه الزمن.
 */
export function Sparkline({
  points,
  color = "var(--brand)",
  width = 120,
  height = 34
}: {
  points: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const id = useId();
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const pad = 3;

  /* المحور الأفقي مقلوب: الزمن في واجهة RTL يمضي من اليمين إلى اليسار */
  const coords = points.map((p, i) => {
    const x = width - pad - (i / (points.length - 1)) * (width - pad * 2);
    const y = height - pad - ((p - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const last = coords[coords.length - 1];
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${last[0].toFixed(1)},${height} L${coords[0][0].toFixed(1)},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={area}
        fill={`url(#${id}-fill)`}
        style={{ opacity: drawn ? 1 : 0, transition: "opacity var(--dur-5) var(--ease-out) 200ms" }}
      />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={drawn ? 0 : 1}
        style={{ transition: "stroke-dashoffset var(--dur-5) var(--ease-out)" }}
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r="2.5"
        fill={color}
        style={{ opacity: drawn ? 1 : 0, transition: "opacity var(--dur-2) var(--ease-out) var(--dur-5)" }}
      />
    </svg>
  );
}
