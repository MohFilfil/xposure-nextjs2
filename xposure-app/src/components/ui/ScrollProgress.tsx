"use client";

import { useEffect, useState } from "react";

/**
 * خيط 2px أعلى الشاشة يقول «كم بقي من هذه الصفحة». يظهر فقط حين تكون الصفحة
 * أطول من الشاشة فعلاً — شريط ممتلئ دائماً لا يحمل معلومة.
 * نقطة الارتكاز عند 100% لأن التقدّم في واجهة RTL يبدأ من اليمين.
 */
export function ScrollProgress() {
  const [ratio, setRatio] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setActive(max > 120);
      setRatio(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-toast h-[2px] print:hidden">
      <div
        className="h-full origin-[100%_50%] bg-gradient-brand"
        style={{ transform: `scaleX(${active ? ratio : 0})`, transition: "transform 80ms linear" }}
      />
    </div>
  );
}
