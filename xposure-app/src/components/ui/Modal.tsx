"use client";

import { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";

/**
 * للإجراءات التي لا رجعة فيها أو تُسجَّل في سجل التدقيق فقط.
 * زر التأكيد يحمل لون الإجراء نفسه (danger للرفض) لا brand.
 * لا تُستخدم النافذة لعرض معلومات بلا قرار مطلوب.
 */
export function Modal({
  title,
  warning,
  onClose,
  children,
  actions
}: {
  title: string;
  warning: string;
  onClose: () => void;
  children?: React.ReactNode;
  actions: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("textarea, input, button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-overlay flex items-center justify-center bg-[rgba(2,6,23,0.66)] p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-modal flex w-full max-w-[520px] flex-col gap-5 rounded-lg border border-border bg-surface-raised p-8 shadow-lg"
      >
        <h2 className="font-display text-h1 text-ink">{title}</h2>
        <div className="flex gap-3 font-body text-body text-ink-muted">
          <TriangleAlert size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-danger" aria-hidden />
          <span>{warning}</span>
        </div>
        {children}
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      </div>
    </div>
  );
}
