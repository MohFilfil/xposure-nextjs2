"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "@/lib/utils";

/** الاختصار يُتجاهل داخل الحقول: من يكتب سبب رفض لا يقصد الانتقال لتغيير آخر. */
function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/**
 * التنقل داخل طابور المراجعة. المراجعة عمل متسلسل: يُفتح بند، يُقرَّر، ثم الذي يليه.
 * العودة للقائمة بين كل بندين ضريبة على العمل الأكثر تكراراً في النظام — ولذلك
 * يوجد هنا زران ومؤشر موقع، إضافة إلى j/k لمن يراجع بلوحة المفاتيح.
 */
export function QueueNav({
  ids,
  currentId,
  hrefFor,
  label = "التغيير"
}: {
  ids: string[];
  currentId: string;
  hrefFor: (id: string) => string;
  label?: string;
}) {
  const router = useRouter();
  const index = ids.indexOf(currentId);
  const prev = index > 0 ? ids[index - 1] : null;
  const next = index >= 0 && index < ids.length - 1 ? ids[index + 1] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === "j" && next) {
        e.preventDefault();
        router.push(hrefFor(next));
      } else if (k === "k" && prev) {
        e.preventDefault();
        router.push(hrefFor(prev));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, hrefFor, prev, next]);

  if (index < 0) return null;

  return (
    <nav aria-label={`التنقل بين ${label}ات`} className="flex items-center gap-2 print:hidden">
      <span className="me-1 font-body text-body-sm text-ink-muted">
        {label} <span className="font-mono text-ink">{index + 1}</span>
        <span className="text-ink-subtle"> / {ids.length}</span>
      </span>

      {/* في RTL يقع «السابق» على اليمين، فيحمل سهماً متجهاً لليمين */}
      <QueueButton
        disabled={!prev}
        label="التغيير السابق"
        chord="K"
        onClick={() => prev && router.push(hrefFor(prev))}
      >
        <ChevronRight size={18} strokeWidth={2} aria-hidden />
      </QueueButton>
      <QueueButton
        disabled={!next}
        label="التغيير التالي"
        chord="J"
        onClick={() => next && router.push(hrefFor(next))}
      >
        <ChevronLeft size={18} strokeWidth={2} aria-hidden />
      </QueueButton>
    </nav>
  );
}

function QueueButton({
  children,
  onClick,
  disabled,
  label,
  chord
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  chord: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={`${label} (${chord})`}
      className={cx(
        "flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-ink-muted",
        "transition-[background-color,color,transform] duration-2 ease-out active:enabled:scale-95",
        "hover:enabled:bg-surface-overlay hover:enabled:text-ink",
        "disabled:cursor-not-allowed disabled:opacity-40"
      )}
    >
      {children}
    </button>
  );
}
