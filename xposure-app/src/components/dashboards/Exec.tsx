"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, ChevronLeft, ListChecks, Stamp } from "lucide-react";
import { Eyebrow, Page } from "@/components/layout/Page";
import { Hero, HeroFigure } from "@/components/layout/Hero";
import { Section } from "@/components/dashboards/Section";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { MetricBar, StatCard } from "@/components/ui/StatCard";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Gauge } from "@/components/ui/Gauge";
import { DeadlineTimeline } from "@/components/ui/DeadlineTimeline";
import { Reveal } from "@/components/motion/Reveal";
import { useDecisions } from "@/components/DecisionsProvider";
import { useT } from "@/components/I18nProvider";
import { Num, Code, DocArrow } from "@/components/ui/Bidi";
import { useContent } from "@/lib/content";
import type { RegChange } from "@/lib/types";
import { daysUntil } from "@/lib/utils";

/**
 * شاشة القيادة التنفيذية. السؤال الذي تجيب عنه ليس «ما الذي ينتظر قراري؟» —
 * فالقيادة لا تبتّ في البنود — بل «أين نقف، وما الذي قد يُحرجنا، ومتى؟».
 *
 * لذلك لا جدول طابور هنا ولا أزرار قرار: درجة الامتثال، البنود الحرجة المفتوحة،
 * وخريطة المواعيد التي تقول متى تتكدّس الالتزامات.
 */
export function ExecDashboard() {
  const router = useRouter();
  const { statusOf } = useDecisions();
  const t = useT();
  const { changes: CHANGES, tasks: TASKS, company } = useContent();

  const isOpen = (c: RegChange) => ["new", "pending"].includes(statusOf(c));
  const criticalOpen = CHANGES.filter((c) => c.priority === "critical" && isOpen(c));
  const awaiting = CHANGES.filter(isOpen).length;
  const decided = CHANGES.length - awaiting;
  const overdueTasks = TASKS.filter((t) => t.status !== "approved" && daysUntil(t.due) < 0).length;

  /** أقرب موجة سريان: التاريخ الأقرب وكم بنداً يستحق فيه دفعةً واحدة. */
  const waves = Array.from(new Set(CHANGES.map((c) => c.effective)))
    .sort()
    .map((date) => ({
      date,
      days: daysUntil(date),
      items: CHANGES.filter((c) => c.effective === date),
      open: CHANGES.filter((c) => c.effective === date && isOpen(c)).length
    }));
  const nearest = waves[0];

  const columns: Column<RegChange>[] = [
    {
      key: "title",
      header: t.exec.criticalColumn,
      render: (c) => (
        <>
          <div className="font-medium text-ink">{c.title}</div>
          <div className="num mt-0.5 font-mono text-caption text-ink-subtle">
            <Code>{c.clause}</Code> · <Code>{c.docTo}</Code>
          </div>
        </>
      )
    },
    { key: "status", header: t.changes.status, render: (c) => <StatusBadge status={statusOf(c)} /> },
    {
      key: "effective",
      header: t.changes.colEffective,
      hideBelow: "sm",
      render: (c) => <Num className="num font-mono">{c.effective}</Num>
    },
    {
      key: "owner",
      header: t.exec.proposedOwner,
      hideBelow: "sm",
      render: (c) => c.owner.split(" — ")[0]
    }
  ];

  return (
    <Page>
      <Hero
        eyebrow={
          <>
            <Eyebrow tone="live">
              {t.dashboard.agentLive} <Num>2026-09-18 05:00</Num>
            </Eyebrow>
            <Eyebrow>
              <DocArrow from="ECC-1:2018" to="ECC-2:2024" />
            </Eyebrow>
          </>
        }
        headline={
          criticalOpen.length > 0 ? (
            <>
              <HeroFigure tone="danger">{criticalOpen.length}</HeroFigure> {t.dashboard.criticalOpenHead}
            </>
          ) : (
            <>
              <HeroFigure tone="success">{CHANGES.length}</HeroFigure> {t.dashboard.allDecided}
            </>
          )
        }
        lede={
          nearest ? (
            <>
              {t.exec.upcoming}: <Num className="num font-mono text-ink">{nearest.date}</Num> — <Num>{nearest.days}</Num>{" "}
              {t.common.days}, <Num>{nearest.items.length}</Num> {t.common.items}. {company}.
            </>
          ) : (
            <>{company}.</>
          )
        }
        actions={
          <Button variant="primary" onClick={() => router.push("/changes?priority=critical")}>
            <AlertTriangle size={20} strokeWidth={2} aria-hidden />
            {t.exec.showCritical}
          </Button>
        }
        aside={
          <Card className="w-full xl:w-[300px]">
            <Gauge value={78} size={188} label={t.dashboard.complianceScore} />
            <dl className="mt-5 flex flex-col gap-3">
              <ScoreRow label={t.dashboard.controlsMet} value="39 / 50" tone="var(--success)" />
              <ScoreRow label={t.dashboard.gapsOpen} value="11 / 50" tone="var(--danger)" />
            </dl>
            <CardFoot>{t.dashboard.scoreFoot}</CardFoot>
          </Card>
        }
        facts={[
          {
            label: t.exec.decidedFact,
            /* الكسر معزول باتجاه LTR — «3 / 12» داخل نص عربي ينقلب إلى «12 / 3» */
            value: (
              <bdi dir="ltr">
                {decided} / {CHANGES.length}
              </bdi>
            )
          },
          { label: t.exec.overdueTasks, value: overdueTasks },
          { label: t.exec.upcomingWaves, value: waves.length }
        ]}
      />

      <Reveal>
        <MetricBar>
          <StatCard
            label={t.dashboard.metricCritical}
            value={criticalOpen.length}
            context={t.dashboard.metricCriticalCtx}
            icon={AlertTriangle}
            tone={criticalOpen.length > 0 ? "danger" : "success"}
            alert={criticalOpen.length > 0}
          />
          <StatCard
            label={t.dashboard.metricAwaiting}
            value={awaiting}
            context={t.dashboard.metricAwaitingCtx}
            icon={Stamp}
          />
          <StatCard
            label={t.exec.daysToNearest}
            value={nearest ? nearest.days : 0}
            context={nearest ? `${nearest.date} · ${nearest.items.length}` : t.common.none}
            icon={CalendarClock}
            tone={nearest && nearest.days <= 120 ? "danger" : undefined}
          />
          <StatCard
            label={t.exec.overdueTasks}
            value={overdueTasks}
            context={t.tasks.overdueCtx}
            icon={ListChecks}
            tone={overdueTasks > 0 ? "danger" : "success"}
          />
        </MetricBar>
      </Reveal>

      <Section
        title={t.exec.upcoming}
        sub={t.dashboard.deadlineSub}
        aside={
          <span className="num font-mono text-caption text-ink-subtle">
            {t.common.reference}: <Num>2026-09-18</Num>
          </span>
        }
      >
        <Reveal>
          <Card>
            <DeadlineTimeline changes={CHANGES} />
            <CardFoot>
              <Num>{waves.length}</Num> {t.exec.upcomingWaves} — <Num className="num font-mono text-ink">{nearest?.date}</Num>,{" "}
              <Num>{nearest?.open ?? 0}</Num> {t.changes.waveAwaiting}.
            </CardFoot>
          </Card>
        </Reveal>
      </Section>

      <Section
        title={t.exec.criticalOpen}
        sub={t.exec.criticalOpenSub}
        aside={
          <Button variant="secondary" size="sm" onClick={() => router.push("/changes")}>
            {t.exec.viewAllChanges}
            <ChevronLeft size={18} strokeWidth={2} aria-hidden className="ltr:rotate-180" />
          </Button>
        }
      >
        {criticalOpen.length > 0 ? (
          <DataTable
            caption={t.exec.criticalOpen}
            columns={columns}
            rows={criticalOpen}
            onRowClick={(c) => router.push(`/changes/${c.id}`)}
          />
        ) : (
          <Card>
            <CardHead title={t.exec.noCriticalLeft} aside={<PriorityBadge priority="critical" />} />
            <p className="font-body text-body text-ink">{t.exec.noCriticalBody}</p>
            <CardFoot>{t.exec.noCriticalFoot}</CardFoot>
          </Card>
        )}
      </Section>
    </Page>
  );
}

function ScoreRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-hairline pb-3 last:border-b-0 last:pb-0">
      <span className="flex items-center gap-2 font-body text-body-sm text-ink-muted">
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: tone }} />
        {label}
      </span>
      <Num className="num font-mono text-body-sm font-semibold text-ink">{value}</Num>
    </div>
  );
}
