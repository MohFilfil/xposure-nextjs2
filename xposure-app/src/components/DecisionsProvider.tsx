"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Decision, RegChange, Status, Task } from "@/lib/types";
import { stamp } from "@/lib/utils";

interface Store {
  decisions: Record<string, Decision>;
  extraTasks: Task[];
  auditExtra: Array<{ time: string; what: string; who: string }>;
  statusOf: (change: RegChange) => Status;
  approve: (change: RegChange) => string;
  reject: (change: RegChange, reason: string) => void;
}

const DecisionsContext = createContext<Store | null>(null);

export function useDecisions() {
  const ctx = useContext(DecisionsContext);
  if (!ctx) throw new Error("useDecisions must be used inside DecisionsProvider");
  return ctx;
}

/** المستخدم الحالي — يُستبدل بجلسة حقيقية عند تفعيل تسجيل الدخول. */
const CURRENT_USER = "ريم الدوسري";

/**
 * حالة المراجعة في الذاكرة فقط (نموذج عرض).
 * عند الربط الفعلي تُستبدل بـ FastAPI: كل قرار يُكتب في PostgreSQL وسجل التدقيق.
 */
export function DecisionsProvider({ children }: { children: React.ReactNode }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [extraTasks, setExtraTasks] = useState<Task[]>([]);
  const [auditExtra, setAuditExtra] = useState<Store["auditExtra"]>([]);
  const [seq, setSeq] = useState(126);

  const statusOf = useCallback((change: RegChange) => decisions[change.id]?.status ?? change.status, [decisions]);

  const approve = useCallback(
    (change: RegChange) => {
      const taskId = `T-${seq + 1}`;
      const at = stamp();
      setSeq((n) => n + 1);
      setDecisions((prev) => ({ ...prev, [change.id]: { status: "approved", at, by: CURRENT_USER, task: taskId } }));
      setExtraTasks((prev) => [
        ...prev,
        {
          id: taskId,
          title: `${change.recommendation.slice(0, 64)}…`,
          change: change.id,
          owner: change.owner.split(" — ")[0],
          due: change.due,
          status: "new",
          priority: change.priority
        }
      ]);
      setAuditExtra((prev) => [
        ...prev,
        { time: at, what: `اعتُمدت التوصية على ${change.id} وأُنشئت المهمة ${taskId} في Odoo`, who: CURRENT_USER }
      ]);
      return taskId;
    },
    [seq]
  );

  const reject = useCallback((change: RegChange, reason: string) => {
    const at = stamp();
    setDecisions((prev) => ({ ...prev, [change.id]: { status: "rejected", at, by: CURRENT_USER, reason } }));
    setAuditExtra((prev) => [...prev, { time: at, what: `رُفض ${change.id} مع ذكر السبب`, who: CURRENT_USER }]);
  }, []);

  const value = useMemo(
    () => ({ decisions, extraTasks, auditExtra, statusOf, approve, reject }),
    [decisions, extraTasks, auditExtra, statusOf, approve, reject]
  );

  return <DecisionsContext.Provider value={value}>{children}</DecisionsContext.Provider>;
}
