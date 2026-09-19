"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

const ToastContext = createContext<(kind: ToastKind, text: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

const TONE: Record<ToastKind, { border: string; glyph: string; color: string }> = {
  success: { border: "border-s-success", glyph: "✓", color: "text-success" },
  error: { border: "border-s-danger", glyph: "✕", color: "text-danger" },
  info: { border: "border-s-info", glyph: "i", color: "text-info" }
};

/** التنبيه دائماً أعلى كل شيء (z-toast) — حتى فوق نافذة منبثقة مفتوحة. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, text: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, text }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-6 z-toast flex flex-col gap-3"
        style={{ insetInlineStart: "var(--space-6)" }}
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex min-w-[300px] max-w-[420px] animate-toast-in items-start gap-3 rounded-lg border border-border border-s-[3px] bg-surface-raised p-4 shadow-lg ${TONE[t.kind].border}`}
          >
            <span className={`font-body text-body font-bold ${TONE[t.kind].color}`} aria-hidden>
              {TONE[t.kind].glyph}
            </span>
            <span className="font-body text-body-sm text-ink">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
