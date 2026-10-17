"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlarmClock, CircleCheck, ExternalLink, GitCompare, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { MetricBar, StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { EmptyState } from "@/components/ui/BrandMotif";
import { Input, Select } from "@/components/ui/FormControls";
import { DensityToggle, useDensity } from "@/components/ui/DensityToggle";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { Num, Code } from "@/components/ui/Bidi";
import { ownerMatches, useContent } from "@/lib/content";
import type { Task } from "@/lib/types";
import { daysUntil, dueState } from "@/lib/utils";
import { PRIORITY_RANK } from "@/lib/vocab";

const TONE = { danger: "text-danger", warning: "text-warning", success: "text-success" } as const;

export default function TasksPage() {
  const router = useRouter();
  const toast = useToast();
  const { extraTasks } = useDecisions();
  const { role, account } = useSession();
  const t = useT();
  const { tasks: allTasks, localizeTask } = useContent();
  /**
   * مالك العملية يرى مهامه وحده: طابور المنشأة كاملاً ليس عمله، وعرضه عليه
   * يدفن ما يخصّه بين ما يخصّ غيره.
   */
  const scoped = role === "owner" && account;
  const everything = [...allTasks, ...extraTasks.map(localizeTask)];
  const all = scoped ? everything.filter((task) => ownerMatches(task.owner, account.name)) : everything;

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const { density, setDensity } = useDensity();

  const rows = all.filter((task) => {
    if (status !== "all" && task.status !== status) return false;
    if (priority !== "all" && task.priority !== priority) return false;
    if (query && !`${task.title} ${task.id} ${task.change} ${task.owner}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  const open = all.filter((task) => task.status !== "approved");
  const overdue = open.filter((task) => daysUntil(task.due) < 0).length;
  const soon = open.filter((task) => daysUntil(task.due) >= 0 && daysUntil(task.due) <= 45).length;
  const done = all.length - open.length;

  const isFiltered = query !== "" || status !== "all" || priority !== "all";
  function reset() {
    setQuery("");
    setStatus("all");
    setPriority("all");
  }

  const columns: Column<Task>[] = [
    {
      key: "title",
      header: t.tasks.colTask,
      render: (task) => (
        <>
          <div className="font-medium text-ink">{task.title}</div>
          <div className="font-mono text-caption text-ink-muted">
            <Code>{task.id}</Code> · <Code>{task.change}</Code>
          </div>
        </>
      )
    },
    { key: "owner", header: t.tasks.colOwner, hideBelow: "sm", render: (task) => task.owner },
    {
      key: "due",
      header: t.tasks.colDue,
      // اللون مقروناً بنص دائماً — لا يُعتمد على اللون وحده
      render: (task) => {
        const { tone, days } = dueState(task.due);
        return (
          <>
            <Num className="num font-mono">{task.due}</Num>
            <div className={`text-caption ${TONE[tone]}`}>
              {days < 0 ? (
                <>
                  {t.tasks.overdueBy} <Num>{Math.abs(days)}</Num> {t.common.days}
                </>
              ) : (
                <>
                  {t.tasks.within} <Num>{days}</Num> {t.common.days}
                </>
              )}
            </div>
          </>
        );
      },
      sortValue: (task) => task.due
    },
    {
      key: "priority",
      header: t.changes.priority,
      hideBelow: "xs",
      render: (task) => <PriorityBadge priority={task.priority} />,
      sortValue: (task) => PRIORITY_RANK[task.priority]
    },
    { key: "status", header: t.changes.status, render: (task) => <StatusBadge status={task.status} /> }
  ];

  return (
    <Page>
      <PageHead
        title={t.tasks.title}
        eyebrow={
          <>
            <Eyebrow>
              <Num>{open.length}</Num> {t.tasks.openOf} <Num>{all.length}</Num>
            </Eyebrow>
            {scoped && <Eyebrow>{t.tasks.mineOnly}</Eyebrow>}
            <Eyebrow>{t.tasks.odooSync}</Eyebrow>
          </>
        }
        lede={t.tasks.lede}
        action={
          <Button variant="secondary" onClick={() => toast("info", t.tasks.odooToast)}>
            <ExternalLink size={20} strokeWidth={2} aria-hidden />
            {t.tasks.openInOdoo}
          </Button>
        }
      />

      {/* ثلاث خانات تجيب عن «ما الذي يحترق الآن؟» قبل النزول إلى الجدول — بلغة شريط المؤشرات نفسها */}
      <Reveal>
        <MetricBar>
          <StatCard
            label={t.tasks.overdue}
            value={overdue}
            context={t.tasks.overdueCtx}
            icon={TriangleAlert}
            tone={overdue > 0 ? "danger" : undefined}
            alert={overdue > 0}
          />
          <StatCard label={t.tasks.dueSoon} value={soon} context={t.tasks.dueSoonCtx} icon={AlarmClock} />
          <StatCard
            label={t.tasks.done}
            value={done}
            context={t.tasks.doneCtx}
            icon={CircleCheck}
            tone="success"
          />
          {/**
           * الخانة الرابعة كانت فارغة: شريط المؤشرات شبكة من أربعة أعمدة، وثلاث
           * خانات تترك ربعه بياضاً مؤطّراً. والرقم الذي يملأها ليس حشواً — عدد
           * البنود التنظيمية التي نشأت عنها هذه المهام هو ما يربط المهمة بسببها.
           */}
          <StatCard
            label={t.owner.linkedChanges}
            value={new Set(all.map((task) => task.change)).size}
            context={t.owner.linkedChangesCtx}
            icon={GitCompare}
          />
        </MetricBar>
      </Reveal>

      <Reveal className="rounded-lg border border-border bg-surface-raised p-5 shadow-card print:hidden">
        <div className="mb-4 flex items-center gap-2 font-body text-body-sm font-bold text-ink">
          <SlidersHorizontal size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />
          {t.tasks.filterTasks}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label={t.tasks.searchLabel}
            type="search"
            placeholder={t.tasks.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            label={t.changes.status}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "all", label: t.changes.allStatuses },
              { value: "new", label: t.status.new },
              { value: "pending", label: t.status.pending },
              { value: "approved", label: t.status.approved },
              { value: "rejected", label: t.status.rejected }
            ]}
          />
          <Select
            label={t.changes.priority}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: "all", label: t.changes.allPriorities },
              { value: "critical", label: t.priority.critical },
              { value: "strategic", label: t.priority.strategic },
              { value: "quick", label: t.priority.quick },
              { value: "watch", label: t.priority.watch }
            ]}
          />
        </div>

        {isFiltered && (
          /* العدد يُعلن مرة واحدة فوق الجدول لا هنا أيضاً — تكراره يجعل قارئ الشاشة ينطقه مرتين */
          <div className="mt-4 flex animate-fade-in items-center justify-end gap-4 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={reset}
              className="font-body text-body-sm font-semibold text-brand transition-colors duration-1 hover:text-brand-hover"
            >
              {t.tasks.clearFilters}
            </button>
          </div>
        )}
      </Reveal>

      <div className="-mb-4 flex flex-wrap items-center justify-between gap-3">
        <span aria-live="polite" className="font-body text-body-sm text-ink-muted">
          <Num className="font-bold text-ink">{rows.length}</Num> {t.common.tasks}{" "}
          {isFiltered ? (
            <>
              {t.tasks.matching} <Num>{all.length}</Num>
            </>
          ) : (
            t.tasks.inList
          )}
        </span>
        <DensityToggle value={density} onChange={setDensity} />
      </div>

      {rows.length > 0 ? (
        <DataTable
          caption={t.tasks.listCaption}
          columns={columns}
          rows={rows}
          density={density}
          onRowClick={(task) => router.push(`/changes/${task.change}`)}
        />
      ) : (
        <EmptyState
          title={t.common.noResults}
          description={t.common.noResultsHint}
          action={
            <Button variant="secondary" onClick={reset}>
              {t.common.resetFilters}
            </Button>
          }
        />
      )}
    </Page>
  );
}
