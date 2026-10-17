"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronLeft,
  GitCompare,
  ListChecks,
  ScanSearch,
  Stamp
} from "lucide-react";
import { Eyebrow, Page } from "@/components/layout/Page";
import { Section } from "@/components/dashboards/Section";
import { Hero, HeroFigure } from "@/components/layout/Hero";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { MetricBar, StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState, MotifSpinner } from "@/components/ui/BrandMotif";
import { AGENT_STEPS, AgentActivity } from "@/components/ui/AgentActivity";
import { Gauge } from "@/components/ui/Gauge";
import { Portal } from "@/components/ui/Portal";
import { DeadlineTimeline } from "@/components/ui/DeadlineTimeline";
import { useToast } from "@/components/ui/Toast";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { Num, Code, DocArrow } from "@/components/ui/Bidi";
import { useContent } from "@/lib/content";
import type { Priority, RegChange, Status } from "@/lib/types";
import { daysUntil } from "@/lib/utils";
import { PRIORITY_VAR } from "@/lib/vocab";

/** سلاسل عرض توضيحي لآخر ستة فحوص — تُستبدل بقيم محرك المقارنة عند الربط الفعلي. */
const TREND = {
  changes: [5, 6, 8, 9, 11, 12],
  critical: [1, 2, 2, 3, 4, 4],
  compliance: [61, 64, 68, 70, 72, 78],
  awaiting: [4, 6, 7, 9, 11, 9],
  tasks: [0, 0, 1, 1, 1, 2]
};

export function ComplianceDashboard() {
  const router = useRouter();
  const toast = useToast();
  const { statusOf } = useDecisions();
  const { can } = useSession();
  const t = useT();
  const { changes: CHANGES, tasks: TASKS, company } = useContent();
  const [scanStep, setScanStep] = useState<number | null>(null);

  /**
   * الفحص يمرّ بالمراحل الخمس نفسها المعروضة في صفحة المصادر — مصدر واحد
   * لوصف عمل الوكيل في المنتج كله، وآخرها دائماً: توقّف بانتظار قرار بشري.
   */
  function runScan() {
    if (scanStep !== null) return;
    setScanStep(0);
    const tick = (i: number) => {
      if (i < AGENT_STEPS.length) {
        setScanStep(i);
        setTimeout(() => tick(i + 1), 900);
      } else {
        setScanStep(null);
        toast("success", t.scan.done);
      }
    };
    tick(0);
  }

  const total = CHANGES.length;
  const doneTasks = TASKS.filter((t) => t.status === "approved").length;
  const isOpen = (c: RegChange) => ["new", "pending"].includes(statusOf(c));
  const awaiting = CHANGES.filter(isOpen).length;
  /**
   * الحرج المفتوح لا الحرج إجمالاً: بعد البتّ في البنود الأربعة الحرجة تبقى
   * حرجةً في تصنيفها، لكنها لم تعد «بانتظار قرارك» — والعنوان يعد بالثاني.
   */
  const criticalOpen = CHANGES.filter((c) => c.priority === "critical" && isOpen(c)).length;

  const byPriority = (p: Priority) => CHANGES.filter((c) => c.priority === p).length;
  const byStatus = (s: Status) => CHANGES.filter((c) => statusOf(c) === s).length;

  /* أقرب عنقود: التاريخ الأقرب وعدد ما يستحق فيه — لا أقرب تغيير مفرد، لأن الموجة هي وحدة العمل */
  const nearest = (() => {
    const dates = CHANGES.map((c) => c.effective).sort();
    if (dates.length === 0) return null;
    const date = dates[0];
    return { date, count: dates.filter((d) => d === date).length, days: daysUntil(date) };
  })();

  /* أول بند حرج بلا قرار — وجهة زر «ابدأ المراجعة»، فالزر يفتح عملاً لا قائمة */
  const firstOpen = CHANGES.find((c) => c.priority === "critical" && isOpen(c)) ?? CHANGES.find(isOpen);

  const columns: Column<RegChange>[] = [
    {
      key: "title",
      header: t.changes.colChange,
      render: (c) => (
        <>
          <div className="font-medium text-ink">{c.title}</div>
          <div className="num mt-0.5 font-mono text-caption text-ink-subtle">
            <Code>{c.clause}</Code> · <Code>{c.docTo}</Code>
          </div>
        </>
      )
    },
    { key: "priority", header: t.changes.priority, hideBelow: "xs", render: (c) => <PriorityBadge priority={c.priority} /> },
    { key: "status", header: t.changes.status, render: (c) => <StatusBadge status={statusOf(c)} /> },
    {
      key: "effective",
      header: t.changes.colEffective,
      hideBelow: "sm",
      render: (c) => <Num className="num font-mono">{c.effective}</Num>
    }
  ];

  return (
    <Page>
      {scanStep !== null && <ScanOverlay step={scanStep} />}

      {/**
       * الشاشة لا تُفتتح بعنوانها («لوحة التحكم») — المستخدم يعرف أين هو.
       * تُفتتح بجواب سؤاله: ما الذي ينتظر قراري، وكم بقي من الوقت؟
       */}
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
          criticalOpen > 0 ? (
            <>
              <HeroFigure tone="danger">{criticalOpen}</HeroFigure> {t.dashboard.criticalAwaiting}
            </>
          ) : awaiting > 0 ? (
            <>
              <HeroFigure>{awaiting}</HeroFigure> {t.dashboard.awaitingNoCritical}
            </>
          ) : (
            /* حالة الفراغ المستحقّة: لا تُعرض إلا بعد عمل فعلي، فتُقرأ كإنجاز لا كنقص بيانات */
            <>
              <HeroFigure tone="success">{total}</HeroFigure> {t.dashboard.allDecided}
            </>
          )
        }
        lede={
          awaiting === 0 ? (
            <>{t.exec.noCriticalBody}</>
          ) : nearest ? (
            <>
              {t.exec.upcoming}: <Num className="num font-mono text-ink">{nearest.date}</Num> —{" "}
              <Num className="num font-mono text-ink">{nearest.days}</Num> {t.common.days}, <Num>{nearest.count}</Num>{" "}
              {t.common.changes}. {company}.
            </>
          ) : (
            <>{company}.</>
          )
        }
        actions={
          <>
            {firstOpen ? (
              <Button variant="primary" onClick={() => router.push(`/changes/${firstOpen.id}`)}>
                <Stamp size={20} strokeWidth={2} aria-hidden />
                {criticalOpen > 0 ? t.dashboard.startCritical : t.dashboard.startReview}
              </Button>
            ) : can("scan") ? (
              <Button variant="primary" onClick={runScan}>
                <ScanSearch size={20} strokeWidth={2} aria-hidden />
                {t.scan.action}
              </Button>
            ) : null}
            {firstOpen && can("scan") && (
              <Button variant="ghost" onClick={runScan}>
                <ScanSearch size={20} strokeWidth={2} aria-hidden />
                {t.scan.action}
              </Button>
            )}
          </>
        }
        aside={
          /**
           * الحلقة وحدها لا تملأ نصف شريط الصدارة، فتبدو سابحة في فراغ. اللوح
           * يجعل الجانب كتلة قائمة بذاتها: الحلقة إجابة عامة، والخانتان تحتها
           * تقولان من أين جاءت النسبة — وهو أول ما يُسأل عن أي درجة مركّبة.
           */
          <Card className="w-full xl:w-[300px]">
            <Gauge value={78} size={188} label={t.dashboard.complianceScore} />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label={t.dashboard.controlsMet} value={39} total={50} tone="var(--success)" />
              <MiniStat label={t.dashboard.gapsOpen} value={11} total={50} tone="var(--danger)" />
            </div>
            <CardFoot>{t.dashboard.scoreFoot}</CardFoot>
          </Card>
        }
      />

      <Reveal>
        <MetricBar>
          <StatCard
            label={t.dashboard.metricChanges}
            value={total}
            context={t.dashboard.metricChangesCtx}
            icon={GitCompare}
            points={TREND.changes}
            trend={{ delta: "+2", direction: "up", good: false }}
          />
          <StatCard
            label={t.dashboard.metricCritical}
            value={criticalOpen}
            /**
             * النغمة تتبع القيمة لا التسمية: صفرُ قضايا حرجة مفتوحة خبر سارّ،
             * وعرضه بالأحمر مع خيط إنذار جانبي يقلب معناه إلى نذير.
             */
            context={criticalOpen > 0 ? t.dashboard.metricCriticalCtx : t.dashboard.metricCriticalCtxNone}
            icon={AlertTriangle}
            tone={criticalOpen > 0 ? "danger" : "success"}
            alert={criticalOpen > 0}
            points={TREND.critical}
            trend={
              criticalOpen > 0
                ? { delta: "+1", direction: "up", good: false }
                : { delta: "0", direction: "down", good: true }
            }
          />
          <StatCard
            label={t.dashboard.metricAwaiting}
            value={awaiting}
            context={t.dashboard.metricAwaitingCtx}
            icon={Stamp}
            points={TREND.awaiting}
            trend={{ delta: "-2", direction: "down", good: true }}
          />
          <StatCard
            label={t.dashboard.metricDoneTasks}
            value={`${doneTasks} / ${TASKS.length}`}
            context={t.dashboard.metricDoneTasksCtx}
            icon={ListChecks}
            tone="success"
            points={TREND.tasks}
            trend={{ delta: "+1", direction: "up", good: true }}
          />
        </MetricBar>
      </Reveal>

      <Section
        title={t.dashboard.deadlineMap}
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
              {nearest ? (
                <>
                  <Num className="num font-mono text-ink">{nearest.date}</Num> — <Num>{nearest.count}</Num>{" "}
                  {t.common.changes}, <Num>{nearest.days}</Num> {t.common.days}. {t.dashboard.impactUrgencySub}
                </>
              ) : (
                t.common.none
              )}
            </CardFoot>
          </Card>
        </Reveal>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal index={0} className="h-full">
          <Card className="h-full">
            <CardHead
              title={t.dashboard.impactUrgency}
              sub={t.dashboard.impactUrgencySub}
              aside={
                <span className="num font-mono text-caption text-ink-subtle">
                  <Num>{total}</Num> {t.common.changes}
                </span>
              }
            />
            {/**
             * الخانات كانت تُحجز ارتفاعاً ثابتاً (124px) ينتهي بفراغ تحت الرقم؛ صارت
             * تحمل عناوين البنود التي تمثّلها، فالفراغ امتلأ بمعلومة لا بحشو.
             */}
            <div className="grid grid-cols-[72px_1fr_1fr] gap-3">
              <span />
              <span className="pb-1 text-center font-body text-caption text-ink-subtle">{t.dashboard.highImpact}</span>
              <span className="pb-1 text-center font-body text-caption text-ink-subtle">{t.dashboard.lowImpact}</span>

              <span className="flex items-center font-body text-caption text-ink-muted">{t.dashboard.urgent}</span>
              <MatrixCell priority="critical" items={CHANGES.filter((c) => c.priority === "critical")} />
              <MatrixCell priority="quick" items={CHANGES.filter((c) => c.priority === "quick")} />

              <span className="flex items-center font-body text-caption text-ink-muted">{t.dashboard.notUrgent}</span>
              <MatrixCell priority="strategic" items={CHANGES.filter((c) => c.priority === "strategic")} />
              <MatrixCell priority="watch" items={CHANGES.filter((c) => c.priority === "watch")} />
            </div>
          </Card>
        </Reveal>

        <Reveal index={1} className="h-full">
          <Card className="flex h-full flex-col">
            <CardHead title={t.dashboard.reviewState} sub={t.dashboard.reviewStateSub} />
            {/* الأشرطة تتوسّط ما تبقى من ارتفاع اللوح بدل أن تتكدّس أعلاه بجوار لوح أطول */}
            <div className="flex flex-1 flex-col justify-center gap-4">
              {(["new", "pending", "approved", "rejected"] as Status[]).map((s) => (
                <StatusRow key={s} status={s} count={byStatus(s)} total={total} />
              ))}
            </div>
            <CardFoot>{t.dashboard.reviewStateFoot}</CardFoot>
          </Card>
        </Reveal>
      </div>

      <Section
        title={t.dashboard.latestChanges}
        sub={t.dashboard.latestChangesSub}
        aside={
          <Button variant="secondary" size="sm" onClick={() => router.push("/changes")}>
            {t.dashboard.viewAll}
            <ChevronLeft size={18} strokeWidth={2} aria-hidden className="ltr:rotate-180" />
          </Button>
        }
      >
        {CHANGES.length > 0 ? (
          <DataTable
            caption={t.changes.latestCaption}
            columns={columns}
            rows={CHANGES.slice(0, 5)}
            onRowClick={(c) => router.push(`/changes/${c.id}`)}
          />
        ) : (
          <Card flush>
            <EmptyState
              title={t.dashboard.noChanges}
              description={t.dashboard.noChangesHint}
              action={
                can("scan") ? (
                  <Button variant="secondary" onClick={runScan}>
                    {t.scan.action}
                  </Button>
                ) : undefined
              }
            />
          </Card>
        )}
      </Section>
    </Page>
  );
}

/**
 * شاشة الفحص: المراحل الخمس نفسها التي تعرضها صفحة المصادر، تتقدّم مرحلة مرحلة.
 * المرحلة الأخيرة ليست «اكتمل الفحص» بل «توقّف بانتظار قرارك» — وهذا هو الوعد
 * الذي يقوم عليه المنتج، فيُرى في الشاشة لا في الوثائق وحدها.
 */
function ScanOverlay({ step }: { step: number }) {
  const t = useT();
  return (
    <Portal>
      <div
        className="fixed inset-0 z-overlay flex animate-fade-in flex-col items-center justify-center gap-6 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-4 backdrop-blur-[4px]"
        role="status"
        aria-live="polite"
      >
        <MotifSpinner className="h-14 w-14" />
        <p className="font-display text-h1 text-ink">{t.agent.scanning}</p>
        <div className="panel w-full max-w-[520px] p-5">
          <AgentActivity active={step} />
        </div>
      </div>
    </Portal>
  );
}

/** خانة مصدر داخل لوح الامتثال: الرقم، ثم مماّذا، ثم شريط يقرّب النسبة للعين. */
function MiniStat({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
  return (
    <div className="well p-3">
      {/* الكسر معزول باتجاه LTR وإلا انقلب «39 / 50» إلى «50 / 39» داخل النص العربي */}
      <Num className="num block text-end font-mono text-h2 text-ink">
        <CountUp value={value} />
        <span className="text-caption text-ink-subtle"> / {total}</span>
      </Num>
      <div className="mt-1 font-body text-caption text-ink-muted">{label}</div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface" aria-hidden>
        <div className="h-full animate-bar-grow rounded-full" style={{ width: `${(value / total) * 100}%`, background: tone }} />
      </div>
    </div>
  );
}

/** شريط الحالة يمتلئ بعد التركيب فينقل فرق النسب بين الحالات بصرياً قبل قراءة الأرقام. */
function StatusRow({ status, count, total }: { status: Status; count: number; total: number }) {
  const t = useT();
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const pct = Math.round((count / total) * 100);

  return (
    <div className="flex items-center gap-4">
      <span className="w-[76px] shrink-0">
        <StatusBadge status={status} />
      </span>
      {/**
       * الشريط محايد اللون كالشارة: التمييز هنا بالطول لا باللون، فلا يتزاحم مع
       * لون الأولوية في الجدول المجاور.
       */}
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
        <span
          className="block h-full rounded-full bg-ink-muted"
          style={{ width: filled ? `${pct}%` : "0%", transition: "width var(--dur-5) var(--ease-out)" }}
        />
      </span>
      <Num className="num w-8 text-end font-mono text-body-sm text-ink">{count}</Num>
      <span className="sr-only">{t.status[status]}</span>
    </div>
  );
}

function MatrixCell({ priority, items }: { priority: Priority; items: RegChange[] }) {
  const router = useRouter();
  const t = useT();
  const count = items.length;
  return (
    <button
      type="button"
      onClick={() => router.push(`/changes?priority=${priority}`)}
      aria-label={`${t.priority[priority]}: ${count}`}
      className="well group relative flex flex-col items-start gap-2.5 overflow-hidden p-4 text-start transition-[background-color,border-color,transform] duration-2 ease-out hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--hairline))]"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] rounded-full opacity-80 transition-opacity duration-2 group-hover:opacity-100"
        style={{ background: PRIORITY_VAR[priority] }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-12 start-[-15%] h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-3 group-hover:opacity-25"
        style={{ background: PRIORITY_VAR[priority] }}
      />
      {/* الشارة تحمل اسم الأولوية: محورا المصفوفة يقولان «عاجل/أثر مرتفع» لا «حرج» */}
      <span className="flex w-full items-center justify-between gap-2">
        <PriorityBadge priority={priority} />
        <span className="num font-mono text-metric-sm leading-none text-ink">
          <CountUp value={count} />
        </span>
      </span>
      {/* عناوين البنود نفسها بدل سطر وصفي عام: الخانة تصير قائمة عمل لا رقماً */}
      <ul className="flex w-full flex-col gap-1">
        {items.slice(0, 3).map((c) => (
          <li key={c.id} className="truncate font-body text-caption text-ink-muted">
            {c.title}
          </li>
        ))}
        {count > 3 && (
          <li className="font-body text-caption text-ink-subtle">
            +<Num>{count - 3}</Num>
          </li>
        )}
      </ul>
    </button>
  );
}
