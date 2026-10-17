"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

const LIFETIME = 5000;

const ToastContext = createContext<(kind: ToastKind, text: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

const TONE: Record<ToastKind, { border: string; color: string; icon: LucideIcon }> = {
  success: { border: "border-s-success", color: "text-success", icon: CheckCircle2 },
  error: { border: "border-s-danger", color: "text-danger", icon: XCircle },
  info: { border: "border-s-info", color: "text-info", icon: Info }
};

/**
 * التنبيه دائماً أعلى كل شيء (z-toast) — حتى فوق نافذة منبثقة مفتوحة.
 * الشريط السفلي يستنفد خلال نفس مدة بقاء التنبيه، فيعرف المستخدم متى سيختفي
 * بدل أن يفاجئه الاختفاء. ويبقى زر إغلاق يدوي لمن لا ينتظر.
 *
 * العدّ يتوقف عند المرور بالمؤشر أو دخول التركيز: من مدّ يده ليقرأ نصاً طويلاً أو
 * ليضغط زر الإغلاق لا يجوز أن يختفي النص من تحته.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, { id: ReturnType<typeof setTimeout>; endsAt: number }>());

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t.id);
    timers.current.delete(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const arm = useCallback(
    (id: number, ms: number) => {
      const handle = setTimeout(() => dismiss(id), ms);
      timers.current.set(id, { id: handle, endsAt: Date.now() + ms });
    },
    [dismiss]
  );

  const pause = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (!t) return;
    clearTimeout(t.id);
    /* يُحفظ ما تبقّى في endsAt نفسه: عند الاستئناف نطرحه من اللحظة الحالية */
    timers.current.set(id, { id: t.id, endsAt: t.endsAt - Date.now() });
  }, []);

  const resume = useCallback(
    (id: number) => {
      const t = timers.current.get(id);
      if (!t) return;
      arm(id, Math.max(400, t.endsAt));
    },
    [arm]
  );

  const push = useCallback(
    (kind: ToastKind, text: string) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, kind, text }]);
      arm(id, LIFETIME);
    },
    [arm]
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t.id));
      map.clear();
    };
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed top-6 z-toast flex flex-col gap-3 print:hidden"
        style={{ insetInlineStart: "var(--space-6)" }}
        aria-live="polite"
      >
        {items.map((t) => {
          const { border, color, icon: Icon } = TONE[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              onMouseEnter={() => pause(t.id)}
              onMouseLeave={() => resume(t.id)}
              onFocusCapture={() => pause(t.id)}
              onBlurCapture={() => resume(t.id)}
              className={`glass group pointer-events-auto relative flex min-w-[300px] max-w-[420px] animate-toast-in items-start gap-3 overflow-hidden rounded-lg border border-s-[3px] p-4 shadow-lg ${border}`}
            >
              <Icon size={20} strokeWidth={2} className={`mt-0.5 shrink-0 ${color}`} aria-hidden />
              <span className="flex-1 font-body text-body-sm text-ink">{t.text}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="إغلاق التنبيه"
                className="-me-1 -mt-1 shrink-0 rounded-md p-1 text-ink-subtle transition-colors duration-1 hover:bg-surface-overlay hover:text-ink"
              >
                <X size={16} strokeWidth={2} aria-hidden />
              </button>
              {/* الشريط يتجمّد مع المؤقّت نفسه، فلا يقول شيئاً يخالف ما يحدث فعلاً */}
              <span
                aria-hidden
                className={`absolute bottom-0 end-0 start-0 h-[2px] origin-[100%_50%] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] ${color}`}
                style={{
                  background: "currentColor",
                  animation: `bar-grow ${LIFETIME}ms linear reverse forwards`
                }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
