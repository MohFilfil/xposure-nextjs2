"use client";

import { useRouter } from "next/navigation";
import { AlarmClock, Boxes, CircleCheck, ListChecks, TriangleAlert, Workflow } from "lucide-react";
import { Eyebrow, Page } from "@/components/layout/Page";
import { Hero, HeroFigure } from "@/components/layout/Hero";
import { Section } from "@/components/dashboards/Section";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MetricBar, StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/BrandMotif";
import { Reveal } from "@/components/motion/Reveal";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { Num, Code } from "@/components/ui/Bidi";
import { ownerMatches, useContent } from "@/lib/content";
import type { Task } from "@/lib/types";
import { daysUntil, dueState } from "@/lib/utils";
import { PRIORITY_RANK } from "@/lib/vocab";

const TONE = { danger: "text-danger", warning: "text-warning", success: "text-success" } as const;

/**
 * شاشة مالك العملية أو المنتج. لا يرى طابور المراجعة ولا درجة الامتثال العامة:
 * يرى ما كُلِّف به هو، والعمليات والمنتجات التي ستتأثر بتنفيذه.
 *
 * الترتيب بالموعد لا بالأولوية: المالك لا يرتّب أولويات المنشأة، إنما ينفّذ ما
 * التُزم به عنه — والسؤال عنده «ما الذي يستحق أولاً؟».
 */
export function OwnerDashboard() {
  const router = useRouter();
  const { extraTasks } = useDecisions();
  const { account } = useSession();
  const t = useT();
  const { changes, tasks, localizeTask } = useContent();

  const mine = [...tasks, ...extraTasks.map(localizeTask)].filter((task) =>
    account ? ownerMatches(task.owner, account.name) : false
  );
  const open = mine.filter((task) => task.status !== "approved");
  const overdue = open.filter((task) => daysUntil(task.due) < 0).length;
  const soon = open.filter((task) => daysUntil(task.due) >= 0 && daysUntil(task.due) <= 45).length;
  const done = mine.length - open.length;

  /* أقرب مهمة مستحقة: هي الجملة التي تفتتح الشاشة، لا عدد المهام */
  const next = [...open].sort((a, b) => a.due.localeCompare(b.due))[0];

  /**
   * الأصول المتأثرة تُجمع من التغييرات التي نشأت عنها مهامه وحدها — لا من كل
   * التغييرات، وإلا قرأ المالك قائمةً لا تخصّه على أنها مسؤوليته.
   */
  const linked = changes.filter((c) => mine.some((task) => task.change === c.id));
  const products = Array.from(new Set(linked.flatMap((c) => c.products)));
  const processes = Array.from(new Set(linked.flatMap((c) => c.processes)));
  const controls = Array.from(new Set(linked.flatMap((c) => c.controls)));

  const columns: Column<Task>[] = [
    {
      key: "title",
      header: t.tasks.colTask,
      render: (task) => (
        <>
          <div className="font-medium text-ink">{task.title}</div>
          <div className="num font-mono text-caption text-ink-subtle">
            <Code>{task.id}</Code> · <Code>{task.change}</Code>
          </div>
        </>
      )
    },
    {
      key: "due",
      header: t.tasks.colDue,
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
      <Hero
        eyebrow={
          <>
            <Eyebrow tone="live">{mine[0]?.owner ?? account?.name}</Eyebrow>
            <Eyebrow>{t.owner.onlyMine}</Eyebrow>
          </>
        }
        headline={
          open.length > 0 ? (
            <>
              <HeroFigure tone={overdue > 0 ? "danger" : "brand"}>{open.length}</HeroFigure>{" "}
              {t.owner.openTasksHead}
            </>
          ) : (
            <>
              <HeroFigure tone="success">{mine.length}</HeroFigure> {t.owner.allClosed}
            </>
          )
        }
        lede={
          next ? (
            <>
              «{next.title}» — <Num className="num font-mono text-ink">{next.due}</Num>. {t.owner.myTasksSub}
            </>
          ) : (
            <>{t.owner.noTasksHint}</>
          )
        }
        actions={
          <Button variant="primary" onClick={() => router.push("/tasks")}>
            <ListChecks size={20} strokeWidth={2} aria-hidden />
            {t.owner.openList}
          </Button>
        }
      />

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
          <StatCard label={t.tasks.done} value={done} context={t.tasks.doneCtx} icon={CircleCheck} tone="success" />
          <StatCard
            label={t.owner.linkedChanges}
            value={linked.length}
            context={t.owner.linkedChangesCtx}
            icon={Workflow}
          />
        </MetricBar>
      </Reveal>

      <Section title={t.owner.myTasks} sub={t.owner.myTasksSub}>
        {mine.length > 0 ? (
          <DataTable
            caption={t.owner.myTasks}
            columns={columns}
            rows={[...mine].sort((a, b) => a.due.localeCompare(b.due))}
            onRowClick={(task) => router.push(`/changes/${task.change}`)}
          />
        ) : (
          <EmptyState title={t.owner.noTasks} description={t.owner.noTasksHint} />
        )}
      </Section>

      <Section title={t.owner.affected} sub={t.owner.affectedSub}>
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal index={0} className="h-full">
            <AssetCard icon={Boxes} title={t.owner.products} items={products} />
          </Reveal>
          <Reveal index={1} className="h-full">
            <AssetCard icon={Workflow} title={t.owner.processes} items={processes} />
          </Reveal>
          <Reveal index={2} className="h-full">
            <AssetCard icon={ListChecks} title={t.owner.controls} items={controls} />
          </Reveal>
        </div>
      </Section>
    </Page>
  );
}

function AssetCard({
  icon: Icon,
  title,
  items
}: {
  icon: typeof Boxes;
  title: string;
  items: string[];
}) {
  const t = useT();
  return (
    <Card className="flex h-full flex-col">
      <CardHead
        title={title}
        aside={<span className="num font-mono text-caption text-ink-subtle">{items.length}</span>}
      />
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </div>
      ) : (
        <p className="flex items-center gap-2 font-body text-body-sm text-ink-muted">
          <Icon size={18} strokeWidth={2} aria-hidden />
          {t.owner.nothingAffected}
        </p>
      )}
      <CardFoot>{t.owner.assetsFoot}</CardFoot>
    </Card>
  );
}
