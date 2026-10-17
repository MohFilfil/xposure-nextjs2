"use client";

import { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";
import { Portal } from "@/components/ui/Portal";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * للإجراءات التي لا رجعة فيها أو تُسجَّل في سجل التدقيق فقط.
 * زر التأكيد يحمل لون الإجراء نفسه (danger للرفض) لا brand.
 * لا تُستخدم النافذة لعرض معلومات بلا قرار مطلوب.
 *
 * التركيز محبوس داخل النافذة ما دامت مفتوحة، ويعود إلى العنصر الذي فتحها عند
 * الإغلاق — بدون ذلك يجد مستخدم لوحة المفاتيح نفسه في بداية الصفحة بعد كل قرار.
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
    const opener = document.activeElement as HTMLElement | null;
    const panel = ref.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    panel?.querySelector<HTMLElement>("textarea, input, button")?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-overlay flex animate-fade-in items-center justify-center bg-[rgba(2,6,23,0.66)] p-6 backdrop-blur-[3px]"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="relative z-modal flex w-full max-w-[520px] animate-scale-in flex-col gap-5 rounded-lg border border-border bg-surface-raised p-8 shadow-lg"
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
    </Portal>
  );
}
