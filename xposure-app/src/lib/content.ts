"use client";

import { useMemo } from "react";
import { useI18n, useT, type Lang } from "@/components/I18nProvider";
import { AGENT_STATUS, AUDIT, CHANGES, COMPANY, SOURCES, TASKS } from "./data";
import {
  AGENT_STATUS_EN,
  AUDIT_EN,
  CHANGES_EN,
  COMPANY_EN,
  OWNER_NAMES_EN,
  SOURCES_EN,
  TASKS_EN
} from "./data.en";
import type { Role } from "./roles";
import type { AuditEntry, RegChange, Source, Task } from "./types";

/**
 * محتوى العرض بلغة الواجهة.
 *
 * العربية هي الأصل، والإنجليزية طبقة تُدمج فوقها بالمعرّف: أي حقل غير مترجم
 * يبقى عربياً بدل أن يختفي. الدمج سطحي ومحفوظ في useMemo، فتبديل اللغة لا
 * يعيد بناء القوائم مع كل تصيير.
 *
 * المعرّفات والتواريخ والأرقام لا تُترجم — هي ذاتها في اللغتين، وهي ما يربط
 * الشاشة بسجل التدقيق.
 */

export function localizeChange(change: RegChange, lang: Lang): RegChange {
  if (lang === "ar") return change;
  const en = CHANGES_EN[change.id];
  if (!en) return change;
  const { type, ...rest } = en;
  return { ...change, ...rest, type: (type ?? change.type) as RegChange["type"] };
}

export function localizeTask(task: Task, lang: Lang, changes: RegChange[]): Task {
  if (lang === "ar") return task;
  const en = TASKS_EN[task.id];
  if (en) return { ...task, ...en };
  /**
   * المهام المُنشأة أثناء العرض لا ترجمة جاهزة لها: عنوانها مشتقّ من توصية
   * التغيير، فيُشتقّ من التوصية المترجمة بالقاعدة نفسها.
   */
  const source = changes.find((c) => c.id === task.change);
  return {
    ...task,
    title: source ? `${source.recommendation.slice(0, 64)}…` : task.title,
    owner: OWNER_NAMES_EN[task.owner] ?? task.owner
  };
}

/** مفتاح قيد السجل: الوقت + ترتيبه بين قيود الوقت نفسه. */
function auditKey(entry: AuditEntry, index: number, all: AuditEntry[]) {
  const sameTimeBefore = all.slice(0, index).filter((e) => e.time === entry.time).length;
  return `${entry.time}|${sameTimeBefore}`;
}

export function localizeAudit(entries: AuditEntry[], lang: Lang): AuditEntry[] {
  if (lang === "ar") return entries;
  return entries.map((entry, i) => {
    const en = AUDIT_EN[auditKey(entry, i, entries)];
    /* الوقت لا يُترجم: هو نفسه في اللغتين وهو ما يربط القيد بما قبله */
    return en ? { time: entry.time, ...en } : entry;
  });
}

export function localizeSource(source: Source, lang: Lang): Source {
  if (lang === "ar") return source;
  const en = SOURCES_EN[source.id];
  const requested = source.requested
    ? { ...source.requested, by: OWNER_NAMES_EN[source.requested.by] ?? source.requested.by }
    : undefined;
  return { ...source, ...(en ?? {}), requested };
}

/**
 * كل محتوى العرض بلغة الواجهة الحالية. الصفحات تستهلك هذا بدل lib/data مباشرة؛
 * ما يبقى يقرأ من lib/data هو ما لا يُعرض نصّه (المعرّفات والترتيب).
 */
export function useContent() {
  const { lang } = useI18n();

  return useMemo(() => {
    const changes = CHANGES.map((c) => localizeChange(c, lang));
    return {
      lang,
      changes,
      tasks: TASKS.map((t) => localizeTask(t, lang, changes)),
      audit: localizeAudit(AUDIT, lang),
      sources: SOURCES.map((s) => localizeSource(s, lang)),
      company: lang === "en" ? COMPANY_EN : COMPANY,
      agentStatus: lang === "en" ? { ...AGENT_STATUS, ...AGENT_STATUS_EN } : AGENT_STATUS,
      /** لترجمة المهام والقيود المُنشأة في الجلسة (من DecisionsProvider). */
      localizeTask: (task: Task) => localizeTask(task, lang, changes),
      localizeName: (name: string) => (lang === "en" ? OWNER_NAMES_EN[name] ?? name : name),
      changeById: (id: string) => changes.find((c) => c.id === id)
    };
  }, [lang]);
}

/**
 * اسم مالك المهمة مترجَم في العرض، لكن هوية صاحب الجلسة تبقى بالاسم العربي الأصل.
 * المقارنة تقبل الاثنين، وإلا فرغت قائمة مهام مالك العملية عند تبديل اللغة.
 */
export function ownerMatches(taskOwner: string, canonicalName: string) {
  return taskOwner === canonicalName || taskOwner === OWNER_NAMES_EN[canonicalName];
}

/** نصوص الأدوار بلغة الواجهة — المعرّف نفسه في lib/roles.ts لا يتغير. */
export function useRoleCopy() {
  const t = useT();
  return {
    label: (role: Role) => t.roles[role].label,
    scope: (role: Role) => t.roles[role].scope,
    title: (role: Role) => t.roles.titles[role],
    name: (role: Role) => t.roles.names[role]
  };
}
