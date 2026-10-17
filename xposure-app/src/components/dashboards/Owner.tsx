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
import { CHANGES, TASKS } from "@/lib/data";
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

  const mine = [...TASKS, ...extraTasks].filter((t) => t.owner === account?.name);
  const open = mine.filter((t) => t.status !== "approved");
  const overdue = open.filter((t) => daysUntil(t.due) < 0).length;
  const soon = open.filter((t) => daysUntil(t.due) >= 0 && daysUntil(t.due) <= 45).length;
  const done = mine.length - open.length;

  /* أقرب مهمة مستحقة: هي الجملة التي تفتتح الشاشة، لا عدد المهام */
  const next = [...open].sort((a, b) => a.due.localeCompare(b.due))[0];

  /**
   * الأصول المتأثرة تُجمع من التغييرات التي نشأت عنها مهامه وحدها — لا من كل
   * التغييرات، وإلا قرأ المالك قائمةً لا تخصّه على أنها مسؤوليته.
   */
  const linked = CHANGES.filter((c) => mine.some((t) => t.change === c.id));
  const products = Array.from(new Set(linked.flatMap((c) => c.products)));
  const processes = Array.from(new Set(linked.flatMap((c) => c.processes)));
  const controls = Array.from(new Set(linked.flatMap((c) => c.controls)));

  const columns: Column<Task>[] = [
    {
      key: "title",
      header: "المهمة",
      render: (t) => (
        <>
          <div className="font-medium text-ink">{t.title}</div>
          <div className="num font-mono text-caption text-ink-subtle">
            <bdi dir="ltr">{t.id}</bdi> · <bdi dir="ltr">{t.change}</bdi>
          </div>
        </>
      )
    },
    {
      key: "due",
      header: "تاريخ الاستحقاق",
      render: (t) => {
        const { tone, label } = dueState(t.due);
        return (
          <>
            <bdi dir="ltr" className="num font-mono">
              {t.due}
            </bdi>
            <div className={`text-caption ${TONE[tone]}`}>{label}</div>
          </>
        );
      },
      sortValue: (t) => t.due
    },
    {
      key: "priority",
      header: "الأولوية",
      hideBelow: "xs",
      render: (t) => <PriorityBadge priority={t.priority} />,
      sortValue: (t) => PRIORITY_RANK[t.priority]
    },
    { key: "status", header: "الحالة", render: (t) => <StatusBadge status={t.status} /> }
  ];

  return (
    <Page>
      <Hero
        eyebrow={
          <>
            <Eyebrow tone="live">{account?.name}</Eyebrow>
            <Eyebrow>مهامك وحدها — لا طابور المنشأة</Eyebrow>
          </>
        }
        headline={
          open.length > 0 ? (
            <>
              <HeroFigure tone={overdue > 0 ? "danger" : "brand"}>{open.length}</HeroFigure> مهمة
              <br />
              مفتوحة باسمك
            </>
          ) : (
            <>
              <HeroFigure tone="success">{mine.length}</HeroFigure> مهمة
              <br />
              أُغلقت كلها
            </>
          )
        }
        lede={
          next ? (
            <>
              أقربها «{next.title}» وتستحق في{" "}
              <bdi dir="ltr" className="num font-mono text-ink">
                {next.due}
              </bdi>
              . كل مهمة هنا نشأت عن اعتماد صريح لتغيير تنظيمي، ويمكنك فتح البند الذي تسبّب بها.
            </>
          ) : (
            <>لا مهمة مفتوحة باسمك الآن. ستصلك مهمة جديدة فور اعتماد توصية تخصّ عملياتك.</>
          )
        }
        actions={
          <Button variant="primary" onClick={() => router.push("/tasks")}>
            <ListChecks size={20} strokeWidth={2} aria-hidden />
            افتح قائمة مهامي
          </Button>
        }
      />

      <Reveal>
        <MetricBar>
          <StatCard
            label="متأخرة"
            value={overdue}
            context="تجاوزت موعدها المقترح ولم تُغلق بعد"
            icon={TriangleAlert}
            tone={overdue > 0 ? "danger" : undefined}
            alert={overdue > 0}
          />
          <StatCard label="تستحق خلال 45 يوماً" value={soon} context="تحتاج جدولة ضمن هذا الشهر" icon={AlarmClock} />
          <StatCard
            label="منجزة"
            value={done}
            context="أُغلقت باعتماد المختص، لا بقرار الوكيل"
            icon={CircleCheck}
            tone="success"
          />
          <StatCard
            label="بنود تنظيمية تخصّك"
            value={linked.length}
            context="التغييرات التي نشأت عنها مهامك"
            icon={Workflow}
          />
        </MetricBar>
      </Reveal>

      <Section title="مهامي" sub="مرتّبة بالأقرب استحقاقاً — اضغط أي مهمة لفتح البند الذي تسبّب بها">
        {mine.length > 0 ? (
          <DataTable
            caption="مهام هذا المستخدم"
            columns={columns}
            rows={[...mine].sort((a, b) => a.due.localeCompare(b.due))}
            onRowClick={(t) => router.push(`/changes/${t.change}`)}
          />
        ) : (
          <EmptyState
            title="لا مهام باسمك"
            description="تُنشأ المهام بعد اعتماد المختص لتوصية على تغيير تنظيمي، وتُسند إلى مالك العملية المعني."
          />
        )}
      </Section>

      <Section title="ما يتأثر بعملك" sub="الأصول التي تمسّها مهامك المفتوحة — لا كل أصول المنشأة">
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal index={0} className="h-full">
            <AssetCard icon={Boxes} title="منتجات" items={products} />
          </Reveal>
          <Reveal index={1} className="h-full">
            <AssetCard icon={Workflow} title="عمليات" items={processes} />
          </Reveal>
          <Reveal index={2} className="h-full">
            <AssetCard icon={ListChecks} title="ضوابط داخلية" items={controls} />
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
          لا شيء متأثر من هذا النوع
        </p>
      )}
      <CardFoot>مصدرها سجلات المنشأة — آخر تحديث 2026-09-14.</CardFoot>
    </Card>
  );
}
