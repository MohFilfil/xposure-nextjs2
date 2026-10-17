"use client";

import { useEffect, useState } from "react";

/**
 * مصدر واحد لسؤال «هل نُحرّك؟». كل مكوّن يُحرّك بـ JS يسأل هنا؛
 * ما يُحرَّك بـ CSS يكفيه الاستعلام في globals.css.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/** منحنى الخروج الناعم — نفس شكل --ease-out لكن قابلاً للحساب داخل requestAnimationFrame. */
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * تأخير التتابع: يزيد 55ms لكل عنصر ثم يتوقف عند العاشر.
 * بدون السقف يصبح العنصر العشرون متأخراً بثانية كاملة فيُقرأ كبطء لا كتتابع.
 */
export function staggerDelay(index: number, step = 55, max = 10) {
  return `${Math.min(index, max) * step}ms`;
}
