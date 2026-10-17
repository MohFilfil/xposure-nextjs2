"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, X } from "lucide-react";
import { useCommandPalette } from "@/components/ui/CommandPalette";
import { useTheme } from "@/components/ThemeProvider";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import type { Dict } from "@/lib/i18n/ar";
import { allowsPath, type Role } from "@/lib/roles";

/** تسلسل `g` ثم حرف — نمط التنقل المعتاد في أدوات المراجعة (GitHub، Linear). */
const GOTO: Record<string, { href: string }> = {
  d: { href: "/dashboard" },
  c: { href: "/changes" },
  t: { href: "/tasks" },
  a: { href: "/audit" },
  s: { href: "/settings" }
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
  const t = useT();
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
          <span>{t.shortcuts.chordHint}</span>
        </div>
      )}

      {sheet && <ShortcutsSheet onClose={close} role={role} t={t} />}
    </>
  );
}

/**
 * مجموعات الاختصارات — تُبنى من المعجم لا من نصّ مكتوب، وتُفلتر بمسارات الدور.
 */
function groupsOf(t: Dict) {
  return [
    {
      title: t.shortcuts.general,
      items: [
        { keys: ["Ctrl", "K"], label: t.shortcuts.palette },
        { keys: ["/"], label: t.shortcuts.openSearch },
        { keys: ["?"], label: t.shortcuts.showList },
        { keys: ["Shift", "T"], label: t.shortcuts.toggleTheme },
        { keys: ["Esc"], label: t.shortcuts.closeAny }
      ] as Array<{ keys: string[]; label: string; href?: string }>
    },
    {
      title: t.shortcuts.navigation,
      items: [
        { keys: ["g", "d"], label: t.nav.dashboard, href: "/dashboard" },
        { keys: ["g", "c"], label: t.nav.changes, href: "/changes" },
        { keys: ["g", "t"], label: t.nav.tasks, href: "/tasks" },
        { keys: ["g", "a"], label: t.nav.audit, href: "/audit" },
        { keys: ["g", "s"], label: t.nav.settings, href: "/settings" }
      ]
    },
    {
      title: t.shortcuts.inReview,
      items: [
        { keys: ["j"], label: t.shortcuts.nextChange },
        { keys: ["k"], label: t.shortcuts.prevChange }
      ] as Array<{ keys: string[]; label: string; href?: string }>
    }
  ];
}

function ShortcutsSheet({ onClose, role, t }: { onClose: () => void; role: Role | null; t: Dict }) {
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
        aria-label={t.shortcuts.title}
        className="glass flex max-h-[80vh] w-full max-w-[560px] animate-scale-in flex-col overflow-y-auto rounded-lg border p-6 shadow-lg"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="flex items-center gap-2 font-display text-h1 text-ink">
            <Keyboard size={24} strokeWidth={2} className="text-brand" aria-hidden />
            {t.shortcuts.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="-me-1 rounded-md p-1 text-ink-muted transition-colors duration-1 hover:bg-surface-overlay hover:text-ink"
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* القائمة تذكر ما يعمل لهذا الدور وحده — اختصار معروض ولا يعمل أسوأ من اختصار مخفي */}
          {groupsOf(t)
            .map((g) => ({ ...g, items: g.items.filter((it) => !it.href || !role || allowsPath(role, it.href)) }))
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
          {t.shortcuts.foot}
        </p>
      </div>
    </div>
  );
}
