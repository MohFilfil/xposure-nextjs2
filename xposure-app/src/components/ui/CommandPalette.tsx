"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CornerDownLeft,
  GitCompare,
  History,
  LayoutDashboard,
  ListChecks,
  Moon,
  Radar,
  Search,
  Settings2,
  Sun
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { useContent } from "@/lib/content";
import { allowsPath } from "@/lib/roles";
import { cx } from "@/lib/utils";
import { fuzzyMatch, highlight } from "@/lib/search";

interface Command {
  id: string;
  label: string;
  /** مسار الأمر إن كان تنقّلاً — يُستخدم لحجب ما لا يملكه الدور. */
  href?: string;
  hint?: string;
  group: string;
  icon: LucideIcon;
  /** اختصار لوحة المفاتيح المكافئ، يُعرض ليتعلّمه المستخدم من مكان واحد. */
  chord?: string[];
  run: () => void;
}

const RECENT_KEY = "xposure-recent-commands";
const RECENT_MAX = 4;
const RESULT_MAX = 12;

/** مصدر واحد لفتح اللوحة: الاختصار وزر البحث في الشريط العلوي يمرّان من هنا. */
const OpenPalette = createContext<() => void>(() => {});
export const useCommandPalette = () => useContext(OpenPalette);

/**
 * لوحة الأوامر (Ctrl+K) هي الطريق السريع لمن يعرف ما يريد: تنقّل، فتح تغيير
 * برقم بنده، أو الوصول لمهمة — بلا مرور بالقوائم. ليست بديلاً عن التنقل المرئي؛
 * كل ما فيها موجود في الشريط الجانبي أيضاً، فلا يُفقد شيء على من لا يعرف الاختصار.
 */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <OpenPalette.Provider value={openPalette}>
      {children}
      {open && <Palette onClose={() => setOpen(false)} />}
    </OpenPalette.Provider>
  );
}

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { role } = useSession();
  const t = useT();
  const { changes, tasks } = useContent();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setRecent(readRecent()), []);

  /** ما يُفتح فعلاً يصعد إلى الأعلى في المرة القادمة — المراجع يعود لنفس البنود غالباً. */
  const remember = useCallback((id: string) => {
    try {
      const next = [id, ...readRecent().filter((x) => x !== id)].slice(0, RECENT_MAX);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* الوضع الخاص يمنع التخزين — اللوحة تعمل بلا سجل أخير، وهذا مقبول */
    }
  }, []);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      onClose();
      router.push(href);
    };

    const nav: Command[] = [
      { id: "nav-dashboard", href: "/dashboard", label: t.nav.dashboard, group: t.palette.navGroup, icon: LayoutDashboard, chord: ["g", "d"], run: go("/dashboard") },
      { id: "nav-changes", href: "/changes", label: t.nav.changes, group: t.palette.navGroup, icon: GitCompare, chord: ["g", "c"], run: go("/changes") },
      { id: "nav-tasks", href: "/tasks", label: t.nav.tasks, group: t.palette.navGroup, icon: ListChecks, chord: ["g", "t"], run: go("/tasks") },
      { id: "nav-sources", href: "/sources", label: t.nav.sources, group: t.palette.navGroup, icon: Radar, run: go("/sources") },
      { id: "nav-audit", href: "/audit", label: t.nav.audit, group: t.palette.navGroup, icon: History, chord: ["g", "a"], run: go("/audit") },
      { id: "nav-settings", href: "/settings", label: t.nav.settings, group: t.palette.navGroup, icon: Settings2, chord: ["g", "s"], run: go("/settings") }
    ];

    const actions: Command[] = [
      {
        id: "act-theme",
        label: theme === "dark" ? t.common.toLight : t.common.toDark,
        group: t.palette.actionsGroup,
        icon: theme === "dark" ? Sun : Moon,
        chord: ["Shift", "T"],
        run: () => {
          onClose();
          toggle();
        }
      }
    ];

    const changeCmds: Command[] = changes.map((c) => ({
      id: `change-${c.id}`,
      label: c.title,
      hint: `${c.id} · ${t.detail.clause} ${c.clause} · ${t.priority[c.priority]}`,
      group: t.palette.changesGroup,
      icon: GitCompare,
      run: go(`/changes/${c.id}`)
    }));

    const taskCmds: Command[] = tasks.map((task) => ({
      id: `task-${task.id}`,
      label: task.title,
      hint: `${task.id} · ${task.owner}`,
      group: t.palette.tasksGroup,
      icon: ListChecks,
      run: go(`/changes/${task.change}`)
    }));

    /**
     * اللوحة لا تفتح ما لا يملكه الدور: أمرٌ ينتهي بتحويل إلى صفحة أخرى أسوأ
     * من أمر غائب — فالمستخدم يظنّ الأداة معطلة لا أن الصلاحية ناقصة.
     */
    const permitted = (href: string) => (role ? allowsPath(role, href) : true);

    return [
      ...nav.filter((c) => permitted(c.href ?? "")),
      ...actions,
      ...(permitted("/changes") ? changeCmds : []),
      ...(permitted("/tasks") || permitted("/changes") ? taskCmds : [])
    ];
  }, [router, theme, toggle, onClose, role, t, changes, tasks]);

  const results = useMemo(() => {
    const q = query.trim();

    if (!q) {
      /* بلا بحث: الأخير ثم التنقل والإجراءات — قائمة بكل تغيير ومهمة تُغرق من فتحها للاستكشاف */
      const recentCmds = recent
        .map((id) => commands.find((c) => c.id === id))
        .filter((c): c is Command => Boolean(c))
        .map((c) => ({ cmd: { ...c, group: t.palette.recentGroup, icon: Clock }, indices: [] as number[] }));

      const rest = commands
        .filter((c) => c.group === t.palette.navGroup || c.group === t.palette.actionsGroup)
        .map((cmd) => ({ cmd, indices: [] as number[] }));

      return [...recentCmds, ...rest];
    }

    return commands
      .map((cmd) => {
        const onLabel = fuzzyMatch(q, cmd.label);
        const onHint = cmd.hint ? fuzzyMatch(q, cmd.hint) : null;
        if (!onLabel && !onHint) return null;
        /* المطابقة في المعرّف أو رقم البند تُقبل لكنها أقل وزناً من مطابقة العنوان */
        const score = Math.max(onLabel?.score ?? -Infinity, (onHint?.score ?? -Infinity) - 4);
        return { cmd, indices: onLabel?.indices ?? [], score };
      })
      .filter((r): r is { cmd: Command; indices: number[]; score: number } => r !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, RESULT_MAX);
  }, [commands, query, recent, t]);

  useEffect(() => {
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const runAt = useCallback(
    (i: number) => {
      const hit = results[i];
      if (!hit) return;
      remember(hit.cmd.id);
      hit.cmd.run();
    },
    [results, remember]
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setCursor(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setCursor(Math.max(0, results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(cursor);
    }
  }

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-modal flex animate-fade-in items-start justify-center bg-[rgba(2,6,23,0.6)] p-4 pt-[12vh] backdrop-blur-[3px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.palette.placeholder}
        onKeyDown={onKeyDown}
        className="glass flex w-full max-w-[560px] animate-scale-in flex-col overflow-hidden rounded-lg border shadow-lg"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <Search size={20} strokeWidth={2} className="shrink-0 text-ink-muted" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.palette.placeholder}
            aria-label={t.palette.placeholder}
            aria-controls="palette-results"
            aria-activedescendant={results[cursor] ? `palette-opt-${results[cursor].cmd.id}` : undefined}
            className="w-full bg-transparent py-4 font-body text-body text-ink outline-none placeholder:text-ink-subtle"
          />
          <kbd className="hidden shrink-0 rounded-sm border border-border px-2 py-1 font-mono text-caption text-ink-muted sm:block">
            Esc
          </kbd>
        </div>

        <div
          id="palette-results"
          ref={listRef}
          role="listbox"
          aria-label={t.palette.empty}
          className="max-h-[52vh] overflow-y-auto p-2"
        >
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center font-body text-body-sm text-ink-muted">
              {t.palette.empty} — «{query}»
            </p>
          ) : (
            results.map((r, i) => {
              const c = r.cmd;
              const header = c.group !== lastGroup ? c.group : null;
              lastGroup = c.group;
              const Icon = c.icon;
              const active = i === cursor;
              return (
                <div key={`${c.group}-${c.id}`}>
                  {header && <div className="px-3 pb-1 pt-3 font-body text-caption text-ink-subtle">{header}</div>}
                  <button
                    type="button"
                    role="option"
                    id={`palette-opt-${c.id}`}
                    aria-selected={active}
                    data-active={active}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => runAt(i)}
                    className={cx(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-start transition-colors duration-1",
                      active ? "bg-surface-overlay" : "hover:bg-surface-overlay"
                    )}
                  >
                    <Icon size={18} strokeWidth={2} className={active ? "text-brand" : "text-ink-muted"} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-body text-body-sm text-ink">
                        {highlight(c.label, r.indices).map((part, pi) =>
                          part.hit ? (
                            <mark key={pi} className="bg-transparent font-bold text-brand">
                              {part.text}
                            </mark>
                          ) : (
                            <span key={pi}>{part.text}</span>
                          )
                        )}
                      </span>
                      {/* ink-muted لا ink-subtle: هذا السطر يحمل رقم البند ومعرّف التغيير، ويقع على خلفية
                          surface-overlay في الصف النشط حيث يهبط تباين ink-subtle دون 4.5:1. */}
                      {c.hint && <span className="block truncate font-mono text-caption text-ink-muted">{c.hint}</span>}
                    </span>
                    {c.chord && !active && (
                      <span className="hidden shrink-0 items-center gap-1 sm:flex" dir="ltr" aria-hidden>
                        {c.chord.map((k) => (
                          <kbd key={k} className="rounded-sm border border-border px-1.5 font-mono text-caption text-ink-subtle">
                            {k}
                          </kbd>
                        ))}
                      </span>
                    )}
                    {active && <CornerDownLeft size={16} strokeWidth={2} className="shrink-0 text-ink-subtle" aria-hidden />}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-hairline px-4 py-2 font-body text-caption text-ink-subtle">
          <span className="flex items-center gap-1">
            <kbd className="rounded-sm border border-border px-1.5 py-0.5 font-mono">↑</kbd>
            <kbd className="rounded-sm border border-border px-1.5 py-0.5 font-mono">↓</kbd>
            {t.palette.toNavigate}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded-sm border border-border px-1.5 py-0.5 font-mono">Enter</kbd>
            {t.palette.toOpen}
          </span>
          <span className="ms-auto hidden items-center gap-1 sm:flex">
            <kbd className="rounded-sm border border-border px-1.5 py-0.5 font-mono">?</kbd>
            {t.shortcuts.title}
          </span>
        </div>
      </div>
    </div>
  );
}
