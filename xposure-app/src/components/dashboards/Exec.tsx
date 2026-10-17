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
import { CHANGES, COMPANY, TASKS } from "@/lib/data";
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
      header: "البند الحرج",
      render: (c) => (
        <>
          <div className="font-medium text-ink">{c.title}</div>
          <div className="num mt-0.5 font-mono text-caption text-ink-subtle">
            <bdi dir="ltr">{c.clause}</bdi> · <bdi dir="ltr">{c.docTo}</bdi>
          </div>
        </>
      )
    },
    { key: "status", header: "الحالة", render: (c) => <StatusBadge status={statusOf(c)} /> },
    {
      key: "effective",
      header: "تاريخ السريان",
      hideBelow: "sm",
      render: (c) => (
        <span className="num font-mono">
          <bdi dir="ltr">{c.effective}</bdi>
        </span>
      )
    },
    {
      key: "owner",
      header: "المالك المقترح",
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
              الوكيل يعمل — آخر فحص <bdi dir="ltr">2026-09-18 05:00</bdi>
            </Eyebrow>
            <Eyebrow>
              <bdi dir="ltr">ECC-1:2018 → ECC-2:2024</bdi>
            </Eyebrow>
          </>
        }
        headline={
          criticalOpen.length > 0 ? (
            <>
              <HeroFigure tone="danger">{criticalOpen.length}</HeroFigure> بنود حرجة
              <br />
              ما زالت بلا قرار
            </>
          ) : (
            <>
              <HeroFigure tone="success">{CHANGES.length}</HeroFigure> بنداً
              <br />
              بُتَّ في جميعها
            </>
          )
        }
        lede={
          nearest ? (
            <>
              أقرب موجة سريان في{" "}
              <bdi dir="ltr" className="num font-mono text-ink">
                {nearest.date}
              </bdi>{" "}
              — بعد <span className="num font-mono text-ink">{nearest.days}</span> يوماً، ويستحق فيها{" "}
              {nearest.items.length} بنداً دفعةً واحدة. {COMPANY}.
            </>
          ) : (
            <>{COMPANY}.</>
          )
        }
        actions={
          <Button variant="primary" onClick={() => router.push("/changes?priority=critical")}>
            <AlertTriangle size={20} strokeWidth={2} aria-hidden />
            اعرض البنود الحرجة
          </Button>
        }
        aside={
          <Card className="w-full xl:w-[300px]">
            <Gauge value={78} size={188} label="درجة الامتثال" />
            <dl className="mt-5 flex flex-col gap-3">
              <ScoreRow label="ضوابط مستوفاة" value="39 / 50" tone="var(--success)" />
              <ScoreRow label="فجوات مفتوحة" value="11 / 50" tone="var(--danger)" />
            </dl>
            <CardFoot>الضوابط المستوفاة فعلياً، لا التغييرات المراجَعة.</CardFoot>
          </Card>
        }
        facts={[
          {
            label: "بُتَّ فيه",
            /* الكسر معزول باتجاه LTR — «3 / 12» داخل نص عربي ينقلب إلى «12 / 3» */
            value: (
              <bdi dir="ltr">
                {decided} / {CHANGES.length}
              </bdi>
            )
          },
          { label: "مهام متأخرة", value: overdueTasks },
          { label: "موجات سريان قادمة", value: waves.length }
        ]}
      />

      <Reveal>
        <MetricBar>
          <StatCard
            label="قضايا حرجة مفتوحة"
            value={criticalOpen.length}
            context="بلا قرار بعد — من أصل 4 بنود حرجة مرصودة"
            icon={AlertTriangle}
            tone={criticalOpen.length > 0 ? "danger" : "success"}
            alert={criticalOpen.length > 0}
          />
          <StatCard
            label="بانتظار قرار بشري"
            value={awaiting}
            context="لا يُغلق الوكيل أي بند من تلقائه"
            icon={Stamp}
          />
          <StatCard
            label="يوماً حتى أقرب سريان"
            value={nearest ? nearest.days : 0}
            context={nearest ? `${nearest.date} · ${nearest.items.length} بنداً تستحق معاً` : "لا مواعيد مرصودة"}
            icon={CalendarClock}
            tone={nearest && nearest.days <= 120 ? "danger" : undefined}
          />
          <StatCard
            label="مهام متأخرة"
            value={overdueTasks}
            context="تجاوزت موعدها المقترح ولم تُغلق"
            icon={ListChecks}
            tone={overdueTasks > 0 ? "danger" : "success"}
          />
        </MetricBar>
      </Reveal>

      <Section
        title="مواعيد السريان القادمة"
        sub="التواريخ ليست موزّعة — إنها متكدّسة. كل عنقود موجة عمل واحدة."
        aside={
          <span className="num font-mono text-caption text-ink-subtle">
            المرجع: <bdi dir="ltr">2026-09-18</bdi>
          </span>
        }
      >
        <Reveal>
          <Card>
            <DeadlineTimeline changes={CHANGES} />
            <CardFoot>
              {waves.length} موجة قادمة. أقربها{" "}
              <bdi dir="ltr" className="num font-mono text-ink">
                {nearest?.date}
              </bdi>{" "}
              — {nearest?.open ?? 0} بنداً فيها ما زال بلا قرار.
            </CardFoot>
          </Card>
        </Reveal>
      </Section>

      <Section
        title="البنود الحرجة المفتوحة"
        sub="ما قد يُسأل عنه مجلس الإدارة قبل غيره"
        aside={
          <Button variant="secondary" size="sm" onClick={() => router.push("/changes")}>
            عرض كل التغييرات
            <ChevronLeft size={18} strokeWidth={2} aria-hidden />
          </Button>
        }
      >
        {criticalOpen.length > 0 ? (
          <DataTable
            caption="البنود الحرجة التي لم يُبتّ فيها"
            columns={columns}
            rows={criticalOpen}
            onRowClick={(c) => router.push(`/changes/${c.id}`)}
          />
        ) : (
          <Card>
            <CardHead title="لم يبقَ بند حرج بلا قرار" aside={<PriorityBadge priority="critical" />} />
            <p className="font-body text-body text-ink">
              بُتَّ في البنود الحرجة الأربعة كلها، وكل قرار مسجَّل باسم صاحبه في سجل التدقيق. ما يبقى عملاً تنفيذياً
              هو المهام المنبثقة عنها.
            </p>
            <CardFoot>سيظهر هنا أول بند حرج جديد فور رصده في الفحص القادم.</CardFoot>
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
      <bdi dir="ltr" className="num font-mono text-body-sm font-semibold text-ink">
        {value}
      </bdi>
    </div>
  );
}
