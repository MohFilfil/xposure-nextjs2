"use client";

import { useCallback, useEffect, useState } from "react";
import { AlignJustify, Rows3 } from "lucide-react";
import { useT } from "@/components/I18nProvider";
import { cx } from "@/lib/utils";

export type Density = "comfortable" | "compact";

const KEY = "xposure-density";

/**
 * كثافة الجداول تفضيل شخصي ثابت للمستخدم لا للصفحة: من يراجع مئة بند يومياً يريد
 * أكبر عدد صفوف في الشاشة، ومن يفتح الشاشة مرة أسبوعياً يريد مساحة للتنفس.
 * لذلك تُحفظ محلياً وتُقرأ بعد التركيب فقط حتى لا يختلف تصيير الخادم عن العميل.
 */
export function useDensity() {
  const [density, setDensity] = useState<Density>("comfortable");

  useEffect(() => {
    if (window.localStorage.getItem(KEY) === "compact") setDensity("compact");
  }, []);

  const set = useCallback((next: Density) => {
    setDensity(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* الوضع الخاص يمنع التخزين — التفضيل يبقى لهذه الجلسة فقط */
    }
  }, []);

  return { density, setDensity: set };
}

const OPTIONS: Array<{ value: Density; icon: typeof Rows3 }> = [
  { value: "comfortable", icon: Rows3 },
  { value: "compact", icon: AlignJustify }
];

export function DensityToggle({ value, onChange }: { value: Density; onChange: (d: Density) => void }) {
  const t = useT();
  return (
    /**
     * مجموعة أزرار بحالة ضغط، لا radiogroup: الأخيرة تَعِد قارئ الشاشة بتنقّل
     * بالأسهم داخل المجموعة، وهو ما لا توفّره أزرار عادية — فالوعد وحده عيب.
     */
    <div
      role="group"
      aria-label={t.widgets.rowDensity}
      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface p-1 print:hidden"
    >
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            title={t.common[o.value]}
            className={cx(
              "flex items-center gap-1.5 rounded-sm px-2 py-1 font-body text-caption transition-colors duration-2 ease-out",
              active ? "bg-surface-overlay font-semibold text-ink" : "text-ink-muted hover:text-ink"
            )}
          >
            <Icon size={16} strokeWidth={2} aria-hidden />
            {t.common[o.value]}
          </button>
        );
      })}
    </div>
  );
}
