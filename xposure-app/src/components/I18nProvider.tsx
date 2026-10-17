"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ar, type Dict } from "@/lib/i18n/ar";
import { en } from "@/lib/i18n/en";

export type Lang = "ar" | "en";

const DICTS: Record<Lang, Dict> = { ar, en };
const DIRS: Record<Lang, "rtl" | "ltr"> = { ar: "rtl", en: "ltr" };

const LANG_KEY = "xposure-lang";

interface Store {
  lang: Lang;
  dir: "rtl" | "ltr";
  /** معجم اللغة الحالية — يُستهلك كشجرة لا كمفاتيح نصية، فيتحقّق منه المترجم. */
  t: Dict;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const I18nContext = createContext<Store | null>(null);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** اختصار شائع: `const t = useT()` ثم `t.changes.title`. */
export function useT() {
  return useI18n().t;
}

/**
 * العربية هي الافتراض، والإنجليزية خيار كامل. تبديل اللغة يقلب اتجاه الواجهة
 * كاملاً عبر `dir` على جذر المستند — والتخطيط مكتوب بخصائص منطقية (start/end)
 * فينقلب معه بلا قواعد خاصة لكل لغة.
 *
 * الخادم يُصيّر العربية دائماً (أول تحميل)، ثم تُقرأ اللغة المحفوظة بعد التركيب.
 * هذا هو سلوك مبدّل السمة نفسه، ولا يُحدث وميضاً إلا لمن اختار الإنجليزية.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", DIRS[lang]);
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* الوضع الخاص يمنع التخزين — اللغة تبقى لهذه الجلسة */
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggle = useCallback(() => setLangState((l) => (l === "ar" ? "en" : "ar")), []);

  const value = useMemo<Store>(
    () => ({ lang, dir: DIRS[lang], t: DICTS[lang], setLang, toggle }),
    [lang, setLang, toggle]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
