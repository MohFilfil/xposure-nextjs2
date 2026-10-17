"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";
import { staggerDelay } from "@/lib/motion";

/** بعد هذه المهلة يظهر العنصر مهما حدث — الحركة تحسين، لا شرط لرؤية المحتوى. */
const FAILSAFE_MS = 1200;

/**
 * يكشف العنصر حين يدخل إطار العرض فعلاً — لا عند التحميل.
 * الغرض إخبار العين بترتيب القراءة، لذا التأخير يزيد مع الترتيب ويتوقف عند سقف.
 *
 * ثلاث شبكات أمان تضمن ألا يبقى محتوى مخفياً أبداً:
 * 1) ما كان داخل الشاشة لحظة التركيب يظهر فوراً بلا انتظار مراقب،
 * 2) مهلة قصوى تكشف العنصر حتى لو لم يعمل المراقب (متصفحات مُقيَّدة، أدوات لقطات، طباعة)،
 * 3) المتصفحات بلا IntersectionObserver ترى المحتوى فوراً.
 * ومن فعّل تقليل الحركة يرى كل شيء فوراً كذلك (الإلغاء في globals.css).
 */
export function Reveal({
  children,
  index = 0,
  className,
  as: Tag = "div"
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    if (el.getBoundingClientRect().top < window.innerHeight) {
      setShown(true);
      return;
    }

    const failsafe = setTimeout(() => setShown(true), FAILSAFE_MS);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      /* 12% من ارتفاع الشاشة قبل الحافة: العنصر يكتمل ظهوره قبل أن تصله العين */
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    );

    observer.observe(el);
    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-shown={shown}
      style={{ "--reveal-delay": staggerDelay(index) } as React.CSSProperties}
      className={cx("reveal", className)}
    >
      {children}
    </Tag>
  );
}
