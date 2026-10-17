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
import { CHANGES, COMPANY, TASKS } from "@/lib/data";
import type { Priority, RegChange, Status } from "@/lib/types";
import { daysUntil } from "@/lib/utils";
import { PRIORITY_LABEL, PRIORITY_VAR, STATUS_LABEL, STATUS_VAR } from "@/lib/vocab";

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
        toast("success", "اكتمل الفحص. لا إصدارات جديدة منذ رصد ECC-2:2024 — والوكيل متوقّف بانتظار قرارك.");
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
      header: "التغيير",
      render: (c) => (
        <>
          <div className="font-medium text-ink">{c.title}</div>
          <div className="num mt-0.5 font-mono text-caption text-ink-subtle">
            {c.clause} · {c.docTo}
          </div>
        </>
      )
    },
    { key: "priority", header: "الأولوية", hideBelow: "xs", render: (c) => <PriorityBadge priority={c.priority} /> },
    { key: "status", header: "الحالة", render: (c) => <StatusBadge status={statusOf(c)} /> },
    {
      key: "effective",
      header: "تاريخ السريان",
      hideBelow: "sm",
      render: (c) => <span className="num font-mono">{c.effective}</span>
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
            <Eyebrow tone="live">الوكيل يعمل — آخر فحص 2026-09-18 · 05:00</Eyebrow>
            <Eyebrow>ECC-1:2018 ← ECC-2:2024</Eyebrow>
          </>
        }
        headline={
          criticalOpen > 0 ? (
            <>
              <HeroFigure tone="danger">{criticalOpen}</HeroFigure> بنود حرجة
              <br />
              بانتظار قرارك
            </>
          ) : awaiting > 0 ? (
            <>
              <HeroFigure>{awaiting}</HeroFigure> بنداً بانتظار قرارك
              <br />
              ولا بند حرج بينها
            </>
          ) : (
            /* حالة الفراغ المستحقّة: لا تُعرض إلا بعد عمل فعلي، فتُقرأ كإنجاز لا كنقص بيانات */
            <>
              <HeroFigure tone="success">{total}</HeroFigure> بنداً
              <br />
              بُتَّ في جميعها
            </>
          )
        }
        lede={
          awaiting === 0 ? (
            <>
              لم يبقَ بند بانتظار قرار. كل قرار سُجِّل في سجل التدقيق باسمك، والمهام المنشأة انتقلت إلى
              مالكيها. سيظهر هنا أول بند جديد فور رصده في الفحص القادم.
            </>
          ) : nearest ? (
            <>
              أقرب موعد سريان <span className="num font-mono text-ink">{nearest.date}</span> — بعد{" "}
              <span className="num font-mono text-ink">{nearest.days}</span> يوماً، ويستحق فيه {nearest.count} تغييراً
              دفعةً واحدة. {COMPANY}.
            </>
          ) : (
            <>لا مواعيد سريان مرصودة بعد. {COMPANY}.</>
          )
        }
        actions={
          <>
            {firstOpen ? (
              <Button variant="primary" onClick={() => router.push(`/changes/${firstOpen.id}`)}>
                <Stamp size={20} strokeWidth={2} aria-hidden />
                {criticalOpen > 0 ? "ابدأ بالبند الحرج" : "ابدأ المراجعة"}
              </Button>
            ) : can("scan") ? (
              <Button variant="primary" onClick={runScan}>
                <ScanSearch size={20} strokeWidth={2} aria-hidden />
                افحص الآن
              </Button>
            ) : null}
            {firstOpen && can("scan") && (
              <Button variant="ghost" onClick={runScan}>
                <ScanSearch size={20} strokeWidth={2} aria-hidden />
                افحص الآن
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
            <Gauge value={78} size={188} label="درجة الامتثال" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="ضوابط مستوفاة" value={39} total={50} tone="var(--success)" />
              <MiniStat label="فجوات مفتوحة" value={11} total={50} tone="var(--danger)" />
            </div>
            <CardFoot>الضوابط المستوفاة فعلياً، لا التغييرات المراجَعة.</CardFoot>
          </Card>
        }
      />

      <Reveal>
        <MetricBar>
          <StatCard
            label="تغييرات جوهرية"
            value={total}
            context="من أصل 47 فرقاً مرصوداً؛ 35 شكلياً استُبعد بالكود"
            icon={GitCompare}
            points={TREND.changes}
            trend={{ delta: "+2 منذ آخر إصدار", direction: "up", good: false }}
          />
          <StatCard
            label="قضايا حرجة مفتوحة"
            value={criticalOpen}
            /**
             * النغمة تتبع القيمة لا التسمية: صفرُ قضايا حرجة مفتوحة خبر سارّ،
             * وعرضه بالأحمر مع خيط إنذار جانبي يقلب معناه إلى نذير.
             */
            context={
              criticalOpen > 0
                ? "بلا قرار بعد — من أصل 4 بنود حرجة مرصودة"
                : "بلا قرار بعد — من أصل 4 بنود حرجة مرصودة. لم يبقَ منها شيء."
            }
            icon={AlertTriangle}
            tone={criticalOpen > 0 ? "danger" : "success"}
            alert={criticalOpen > 0}
            points={TREND.critical}
            trend={
              criticalOpen > 0
                ? { delta: "+1 هذا الأسبوع", direction: "up", good: false }
                : { delta: "أُغلقت كلها", direction: "down", good: true }
            }
          />
          <StatCard
            label="بانتظار قرار بشري"
            value={awaiting}
            context="لا يُغلق الوكيل أي بند من تلقائه"
            icon={Stamp}
            points={TREND.awaiting}
            trend={{ delta: "-2 بعد قرارَي أمس", direction: "down", good: true }}
          />
          <StatCard
            label="المهام المنجزة"
            value={`${doneTasks} / ${TASKS.length}`}
            context="آخر إنجاز: تعميم المصادقة — الدفعة الأولى"
            icon={ListChecks}
            tone="success"
            points={TREND.tasks}
            trend={{ delta: "+1 هذا الأسبوع", direction: "up", good: true }}
          />
        </MetricBar>
      </Reveal>

      <Section
        title="خريطة مواعيد السريان"
        sub="التواريخ ليست موزّعة — إنها متكدّسة. كل عنقود موجة عمل واحدة."
        aside={<span className="num font-mono text-caption text-ink-subtle">المرجع: 2026-09-18</span>}
      >
        <Reveal>
          <Card>
            <DeadlineTimeline changes={CHANGES} />
            <CardFoot>
              {nearest ? (
                <>
                  أقرب موجة: <span className="num font-mono text-ink">{nearest.date}</span> — {nearest.count} تغييراً
                  تستحق في اليوم نفسه، خلال {nearest.days} يوماً. اضغط أي عنقود لعرض تغييراته.
                </>
              ) : (
                "لا مواعيد سريان مرصودة بعد."
              )}
            </CardFoot>
          </Card>
        </Reveal>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal index={0} className="h-full">
          <Card className="h-full">
            <CardHead
              title="الأثر × الاستعجال"
              sub="اضغط أي خانة لعرض تغييراتها"
              aside={<span className="num font-mono text-caption text-ink-subtle">{total} تغييراً</span>}
            />
            <div className="grid grid-cols-[64px_1fr_1fr] gap-3">
              <span />
              <span className="pb-1 text-center font-body text-caption text-ink-subtle">أثر مرتفع</span>
              <span className="pb-1 text-center font-body text-caption text-ink-subtle">أثر منخفض</span>

              <span className="flex items-center font-body text-caption text-ink-muted">عاجل</span>
              <MatrixCell priority="critical" count={byPriority("critical")} note="تنفيذ فوري" />
              <MatrixCell priority="quick" count={byPriority("quick")} note="إجراء سريع" />

              <span className="flex items-center font-body text-caption text-ink-muted">غير عاجل</span>
              <MatrixCell priority="strategic" count={byPriority("strategic")} note="تخطيط مبكر" />
              <MatrixCell priority="watch" count={byPriority("watch")} note="متابعة" />
            </div>
          </Card>
        </Reveal>

        <Reveal index={1} className="h-full">
          <Card className="flex h-full flex-col">
            <CardHead title="حالة المراجعة البشرية" sub="لا يُستبعد أي تغيير تلقائياً" />
            {/* الأشرطة تتوسّط ما تبقى من ارتفاع اللوح بدل أن تتكدّس أعلاه بجوار لوح أطول */}
            <div className="flex flex-1 flex-col justify-center gap-4">
              {(["new", "pending", "approved", "rejected"] as Status[]).map((s) => (
                <StatusRow key={s} status={s} count={byStatus(s)} total={total} />
              ))}
            </div>
            <CardFoot>تصنيف «لا ينطبق» يحتاج موافقة المختص، ويُسجَّل في سجل التدقيق باسمه.</CardFoot>
          </Card>
        </Reveal>
      </div>

      <Section
        title="أحدث التغييرات"
        sub="أحدث خمسة بنود وصلت من محرك المقارنة"
        aside={
          <Button variant="secondary" size="sm" onClick={() => router.push("/changes")}>
            عرض الكل
            <ChevronLeft size={18} strokeWidth={2} aria-hidden />
          </Button>
        }
      >
        {CHANGES.length > 0 ? (
          <DataTable
            caption="أحدث خمسة تغييرات مرصودة"
            columns={columns}
            rows={CHANGES.slice(0, 5)}
            onRowClick={(c) => router.push(`/changes/${c.id}`)}
          />
        ) : (
          <Card flush>
            <EmptyState
              title="لا تغييرات مرصودة بعد"
              description="شغّل فحصاً للمصادر المفعّلة لبدء رصد الإصدارات الجديدة والمسودات."
              action={
                can("scan") ? (
                  <Button variant="secondary" onClick={runScan}>
                    افحص الآن
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
  return (
    <Portal>
      <div
        className="fixed inset-0 z-overlay flex animate-fade-in flex-col items-center justify-center gap-6 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-4 backdrop-blur-[4px]"
        role="status"
        aria-live="polite"
      >
        <MotifSpinner className="h-14 w-14" />
        <p className="font-display text-h1 text-ink">جارٍ فحص المصادر</p>
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
      <div dir="ltr" className="num text-end font-mono text-h2 text-ink">
        <CountUp value={value} />
        <span className="text-caption text-ink-subtle"> / {total}</span>
      </div>
      <div className="mt-1 font-body text-caption text-ink-muted">{label}</div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface" aria-hidden>
        <div className="h-full animate-bar-grow rounded-full" style={{ width: `${(value / total) * 100}%`, background: tone }} />
      </div>
    </div>
  );
}

/** شريط الحالة يمتلئ بعد التركيب فينقل فرق النسب بين الحالات بصرياً قبل قراءة الأرقام. */
function StatusRow({ status, count, total }: { status: Status; count: number; total: number }) {
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
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
        <span
          className="block h-full rounded-full"
          style={{
            width: filled ? `${pct}%` : "0%",
            background: STATUS_VAR[status],
            transition: "width var(--dur-5) var(--ease-out)"
          }}
        />
      </span>
      <span className="num w-8 text-end font-mono text-body-sm text-ink">{count}</span>
      <span className="sr-only">{STATUS_LABEL[status]}</span>
    </div>
  );
}

function MatrixCell({ priority, count, note }: { priority: Priority; count: number; note: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/changes?priority=${priority}`)}
      aria-label={`${PRIORITY_LABEL[priority]}: ${count} تغييراً`}
      className="well group relative flex min-h-[124px] flex-col items-start justify-between gap-3 overflow-hidden p-4 text-start transition-[background-color,border-color,transform] duration-2 ease-out hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--hairline))]"
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
      <PriorityBadge priority={priority} />
      <span className="flex items-baseline gap-2">
        <span className="num font-mono text-metric-sm text-ink">
          <CountUp value={count} />
        </span>
        <span className="font-body text-caption text-ink-muted">{note}</span>
      </span>
    </button>
  );
}
