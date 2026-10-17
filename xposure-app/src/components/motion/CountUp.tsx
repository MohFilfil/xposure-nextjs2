"use client";

import { useEffect, useRef, useState } from "react";
import { easeOut, useReducedMotion } from "@/lib/motion";

/** الأرقام غربية دائماً في هذا النظام، حتى داخل نص عربي. */
const nf = new Intl.NumberFormat("en-US");

/** بعد هذه المهلة تُكتب القيمة النهائية مهما حدث — لا رقم يبقى صفراً بسبب الحركة. */
const FAILSAFE_MS = 1500;

/**
 * الرقم يعدّ من الصفر مرة واحدة عند أول ظهور. الغرض جعل العين تلتقط أي مؤشر
 * تغيّرت قيمته بين زيارتين — لذا لا يُعاد العدّ عند كل تمرير.
 * الرقم النهائي يُكتب فوراً لمن فعّل تقليل الحركة، ويُكتب بعد مهلة قصوى إن لم
 * يعمل المراقب أصلاً. وقارئ الشاشة يسمع القيمة النهائية وحدها لا كل إطار من العدّ.
 */
export function CountUp({
  value,
  duration = 900,
  suffix = "",
  prefix = ""
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(value);
      return;
    }

    let raf = 0;
    let started = false;

    const animate = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        setShown(Math.round(easeOut(p) * value));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    /**
     * تُكتب القيمة النهائية بعد المهلة سواء بدأ العدّ أم لا. الحالة الخطرة هي أن
     * يبدأ العدّ ثم تتوقف إطارات الرسم (تبويب في الخلفية، متصفح مُقيَّد) فيتجمّد
     * الرقم عند قيمة وسيطة خاطئة — وهذا أسوأ من غياب الحركة أصلاً.
     */
    const failsafe = setTimeout(() => {
      cancelAnimationFrame(raf);
      started = true;
      setShown(value);
    }, FAILSAFE_MS);

    if (el.getBoundingClientRect().top < window.innerHeight) {
      animate();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        animate();
      },
      { threshold: 0.2 }
    );
    observer.observe(el);

    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums lining-nums" }}>
      <span aria-hidden>
        {prefix}
        {nf.format(shown)}
        {suffix}
      </span>
      <span className="sr-only">{`${prefix}${nf.format(value)}${suffix}`}</span>
    </span>
  );
}
