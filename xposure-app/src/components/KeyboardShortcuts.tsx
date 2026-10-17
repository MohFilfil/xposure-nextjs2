"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, X } from "lucide-react";
import { useCommandPalette } from "@/components/ui/CommandPalette";
import { useTheme } from "@/components/ThemeProvider";
import { useSession } from "@/components/SessionProvider";
import { allowsPath, type Role } from "@/lib/roles";

/** تسلسل `g` ثم حرف — نمط التنقل المعتاد في أدوات المراجعة (GitHub، Linear). */
const GOTO: Record<string, { href: string; label: string }> = {
  d: { href: "/dashboard", label: "لوحة التحكم" },
  c: { href: "/changes", label: "التغييرات" },
  t: { href: "/tasks", label: "المهام" },
  a: { href: "/audit", label: "سجل التدقيق" },
  s: { href: "/settings", label: "الإعدادات" }
};

/** مهلة إكمال التسلسل: بعدها يُنسى حرف `g` فلا يُفسَّر ضغط لاحق بريء كأمر تنقّل. */
const CHORD_MS = 1400;

/** الاختصار يُتجاهل داخل الحقول: من يكتب سبب رفض لا يقصد التنقّل بحرف. */
function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/**
 * طبقة الاختصارات العامة. كل اختصار هنا له مقابل مرئي في الواجهة — الاختصار
 * يختصر الطريق ولا يفتح باباً وحيداً، فلا يُعاقَب من لا يعرفه.
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const openPalette = useCommandPalette();
  const { toggle } = useTheme();
  const { role } = useSession();
  const [sheet, setSheet] = useState(false);
  const [chord, setChord] = useState(false);

  const close = useCallback(() => setSheet(false), []);

  useEffect(() => {
    if (!chord) return;
    const t = setTimeout(() => setChord(false), CHORD_MS);
    return () => clearTimeout(t);
  }, [chord]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;

      if (chord) {
        const dest = GOTO[e.key.toLowerCase()];
        setChord(false);
        /* الاختصار لا يفتح ما لا يملكه الدور */
        if (dest && (!role || allowsPath(role, dest.href))) {
          e.preventDefault();
          router.push(dest.href);
        }
        return;
      }

      if (e.key === "g") {
        setChord(true);
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setSheet((v) => !v);
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        openPalette();
        return;
      }
      if (e.key.toLowerCase() === "t" && e.shiftKey) {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chord, router, openPalette, toggle, role]);

  return (
    <>
      {/* مؤشر التسلسل: يؤكد أن `g` سُجِّل وأن النظام ينتظر الحرف الثاني */}
      {chord && (
        <div
          className="glass pointer-events-none fixed bottom-6 z-toast flex animate-scale-in items-center gap-2 rounded-md border px-3 py-2 font-body text-caption text-ink-muted shadow-lg"
          style={{ insetInlineStart: "var(--space-6)" }}
          role="status"
        >
          <kbd className="rounded-sm border border-border px-1.5 font-mono text-ink">g</kbd>
          <span>ثم د/ت/م/س/إ — أو أي حرف للإلغاء</span>
        </div>
      )}

      {sheet && <ShortcutsSheet onClose={close} role={role} />}
    </>
  );
}

const GROUPS: Array<{ title: string; items: Array<{ keys: string[]; label: string; href?: string }> }> = [
  {
    title: "عام",
    items: [
      { keys: ["Ctrl", "K"], label: "لوحة الأوامر — بحث شامل وتنقّل" },
      { keys: ["/"], label: "فتح البحث مباشرة" },
      { keys: ["?"], label: "عرض هذه القائمة" },
      { keys: ["Shift", "T"], label: "تبديل السمة بين الداكن والفاتح" },
      { keys: ["Esc"], label: "إغلاق أي لوحة أو نافذة مفتوحة" }
    ]
  },
  {
    title: "التنقل",
    items: [
      { keys: ["g", "d"], label: "لوحة التحكم", href: "/dashboard" },
      { keys: ["g", "c"], label: "التغييرات", href: "/changes" },
      { keys: ["g", "t"], label: "المهام", href: "/tasks" },
      { keys: ["g", "a"], label: "سجل التدقيق", href: "/audit" },
      { keys: ["g", "s"], label: "الإعدادات", href: "/settings" }
    ]
  },
  {
    title: "داخل شاشة مراجعة تغيير",
    items: [
      { keys: ["j"], label: "التغيير التالي في القائمة" },
      { keys: ["k"], label: "التغيير السابق في القائمة" }
    ]
  }
];

function ShortcutsSheet({ onClose, role }: { onClose: () => void; role: Role | null }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-modal flex animate-fade-in items-center justify-center bg-[rgba(2,6,23,0.66)] p-6 backdrop-blur-[3px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="اختصارات لوحة المفاتيح"
        className="glass flex max-h-[80vh] w-full max-w-[560px] animate-scale-in flex-col overflow-y-auto rounded-lg border p-6 shadow-lg"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="flex items-center gap-2 font-display text-h1 text-ink">
            <Keyboard size={24} strokeWidth={2} className="text-brand" aria-hidden />
            اختصارات لوحة المفاتيح
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="-me-1 rounded-md p-1 text-ink-muted transition-colors duration-1 hover:bg-surface-overlay hover:text-ink"
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* القائمة تذكر ما يعمل لهذا الدور وحده — اختصار معروض ولا يعمل أسوأ من اختصار مخفي */}
          {GROUPS.map((g) => ({ ...g, items: g.items.filter((it) => !it.href || !role || allowsPath(role, it.href)) }))
            .filter((g) => g.items.length > 0)
            .map((g) => (
            <section key={g.title}>
              <h3 className="mb-2 font-body text-caption text-ink-subtle">{g.title}</h3>
              <ul className="flex flex-col">
                {g.items.map((it) => (
                  <li
                    key={it.label}
                    className="flex items-center justify-between gap-4 border-b border-hairline py-2 last:border-b-0"
                  >
                    <span className="font-body text-body-sm text-ink">{it.label}</span>
                    <span className="flex shrink-0 items-center gap-1" dir="ltr">
                      {it.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-caption text-ink-muted"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            ))}
        </div>

        <p className="mt-6 border-t border-hairline pt-3 font-body text-caption text-ink-muted">
          كل اختصار هنا له مقابل مرئي في الواجهة — الاختصارات تختصر الطريق ولا تفتح باباً وحيداً.
        </p>
      </div>
    </div>
  );
}
