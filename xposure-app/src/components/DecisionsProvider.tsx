"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Decision, RegChange, Status, Task } from "@/lib/types";
import { CHANGES } from "@/lib/data";
import { useSession } from "@/components/SessionProvider";
import { stamp } from "@/lib/utils";

type AuditRow = { time: string; what: string; who: string };

interface Snapshot {
  decisions: Record<string, Decision>;
  extraTasks: Task[];
  auditExtra: AuditRow[];
  seq: number;
}

interface Store extends Snapshot {
  statusOf: (change: RegChange) => Status;
  approve: (change: RegChange) => string;
  reject: (change: RegChange, reason: string) => void;
  /** التغيير التالي الذي لم يُبتّ فيه بعد — أساس التقدّم التلقائي في الطابور. */
  nextUndecided: (afterId?: string) => RegChange | null;
  /** كم بُتّ فيه من إجمالي التغييرات — يغذّي مؤشر التقدّم في شاشة المراجعة. */
  progress: { decided: number; total: number };
  reset: () => void;
  /** يصير true بعد قراءة المحفوظ؛ قبلها تُعرض حالة البيانات الأصلية فقط. */
  hydrated: boolean;
}

const DecisionsContext = createContext<Store | null>(null);

export function useDecisions() {
  const ctx = useContext(DecisionsContext);
  if (!ctx) throw new Error("useDecisions must be used inside DecisionsProvider");
  return ctx;
}

/** من يوقّع القرار حين لا توجد جلسة مقروءة بعد — لا يُكتب قرار بلا اسم. */
const FALLBACK_USER = "محمد الفلفل";

const STORE_KEY = "xposure-decisions-v1";
const EMPTY: Snapshot = { decisions: {}, extraTasks: [], auditExtra: [], seq: 126 };

const UNDECIDED: Status[] = ["new", "pending"];

/**
 * حالة المراجعة. مخزنها الفعلي عند الربط هو FastAPI + PostgreSQL + سجل التدقيق؛
 * وهنا تُحفظ في localStorage للعرض التوضيحي وحده.
 *
 * الحفظ ليس ترفاً في عرض توضيحي: مراجعٌ يعتمد بنداً ثم يُحدّث الصفحة فيجد قراره
 * قد تبخّر يفقد الثقة في الأداة كلها. والقرار هنا — كما في النظام الحقيقي —
 * لا يُحذف ولا يُعدَّل؛ تغييره لاحقاً يكون قراراً جديداً يُسجَّل بدوره.
 */
export function DecisionsProvider({ children }: { children: React.ReactNode }) {
  const { account } = useSession();
  /* اسم صاحب الجلسة يُقرأ عبر ref حتى لا تتغيّر دوال القرار مع كل تبديل دور */
  const userRef = useRef(FALLBACK_USER);
  userRef.current = account?.name ?? FALLBACK_USER;
  const [snap, setSnap] = useState<Snapshot>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  /* الكتابة تُمنع قبل اكتمال القراءة، وإلا محا الحفظُ الأولُ ما في التخزين */
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Snapshot>;
        setSnap({
          decisions: parsed.decisions ?? {},
          extraTasks: parsed.extraTasks ?? [],
          auditExtra: parsed.auditExtra ?? [],
          seq: parsed.seq ?? EMPTY.seq
        });
      }
    } catch {
      /* تخزين معطّل أو محتوى تالف — يُبدأ من الحالة الأصلية بلا إزعاج المستخدم */
    }
    loaded.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(snap));
    } catch {
      /* الوضع الخاص يمنع التخزين — القرارات تبقى لهذه الجلسة فقط */
    }
  }, [snap]);

  const statusOf = useCallback(
    (change: RegChange) => snap.decisions[change.id]?.status ?? change.status,
    [snap.decisions]
  );

  const approve = useCallback((change: RegChange) => {
    let taskId = "";
    setSnap((prev) => {
      taskId = `T-${prev.seq + 1}`;
      const at = stamp();
      return {
        seq: prev.seq + 1,
        decisions: { ...prev.decisions, [change.id]: { status: "approved", at, by: userRef.current, task: taskId } },
        extraTasks: [
          ...prev.extraTasks,
          {
            id: taskId,
            title: `${change.recommendation.slice(0, 64)}…`,
            change: change.id,
            owner: change.owner.split(" — ")[0],
            due: change.due,
            status: "new" as Status,
            priority: change.priority
          }
        ],
        auditExtra: [
          ...prev.auditExtra,
          { time: at, what: `اعتُمدت التوصية على ${change.id} وأُنشئت المهمة ${taskId} في Odoo`, who: userRef.current }
        ]
      };
    });
    return taskId;
  }, []);

  const reject = useCallback((change: RegChange, reason: string) => {
    setSnap((prev) => {
      const at = stamp();
      return {
        ...prev,
        decisions: { ...prev.decisions, [change.id]: { status: "rejected", at, by: userRef.current, reason } },
        auditExtra: [...prev.auditExtra, { time: at, what: `رُفض ${change.id} مع ذكر السبب`, who: userRef.current }]
      };
    });
  }, []);

  /**
   * يبحث بعد البند الحالي أولاً ثم يلتفّ إلى أوله: المراجع الذي بدأ من منتصف
   * القائمة يجب أن يُنهي ما بعده ثم يعود لما فاته، لا أن يتوقف عند آخر بند.
   */
  const nextUndecided = useCallback(
    (afterId?: string) => {
      const open = (c: RegChange) => UNDECIDED.includes(snap.decisions[c.id]?.status ?? c.status);
      const from = afterId ? CHANGES.findIndex((c) => c.id === afterId) : -1;
      const ordered = from >= 0 ? [...CHANGES.slice(from + 1), ...CHANGES.slice(0, from + 1)] : CHANGES;
      return ordered.find(open) ?? null;
    },
    [snap.decisions]
  );

  const progress = useMemo(() => {
    const decided = CHANGES.filter((c) => !UNDECIDED.includes(snap.decisions[c.id]?.status ?? c.status)).length;
    return { decided, total: CHANGES.length };
  }, [snap.decisions]);

  const reset = useCallback(() => {
    setSnap(EMPTY);
    try {
      window.localStorage.removeItem(STORE_KEY);
    } catch {
      /* لا شيء ليُمحى */
    }
  }, []);

  const value = useMemo(
    () => ({ ...snap, statusOf, approve, reject, nextUndecided, progress, reset, hydrated }),
    [snap, statusOf, approve, reject, nextUndecided, progress, reset, hydrated]
  );

  return <DecisionsContext.Provider value={value}>{children}</DecisionsContext.Provider>;
}
