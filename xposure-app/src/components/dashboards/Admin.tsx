"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Boxes, Cpu, Radar, ScanSearch, ShieldAlert, TimerReset } from "lucide-react";
import { Eyebrow, Page } from "@/components/layout/Page";
import { Hero, HeroFigure } from "@/components/layout/Hero";
import { Section } from "@/components/dashboards/Section";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { MetricBar, StatCard } from "@/components/ui/StatCard";
import { AGENT_STEPS, AgentActivity } from "@/components/ui/AgentActivity";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/components/SessionProvider";
import { AGENT_STATUS, CHANGES, LAST_RUN_STAMPS, SOURCES } from "@/lib/data";
import type { Source } from "@/lib/types";
import { cx } from "@/lib/utils";

/**
 * شاشة المسؤول التقني. لا تعرض محتوى البنود إطلاقاً — ليس عمله ولا صلاحيته.
 * تعرض ما يُبقي الوكيل يعمل: صحة المصادر، آخر دورة، والنموذج الذي يعمل الآن
 * بأي إصدار وأي نسخة تعليمات — لأن سجل التدقيق يذكرها، فيجب أن تكون معروفة
 * قبل أن يُسأل عنها.
 */
export function AdminDashboard() {
  const router = useRouter();
  const toast = useToast();
  const { can } = useSession();
  const [running, setRunning] = useState<number | null>(null);

  const active = SOURCES.filter((s) => s.state === "active");
  const paused = SOURCES.filter((s) => s.state === "paused");
  const pending = SOURCES.filter((s) => s.state === "pending");
  const escalated = CHANGES.filter((c) => c.confidence < AGENT_STATUS.threshold).length;

  function runScan() {
    if (running !== null) return;
    setRunning(0);
    AGENT_STEPS.slice(1).forEach((_, i) => setTimeout(() => setRunning(i + 1), (i + 1) * 900));
    setTimeout(() => {
      setRunning(null);
      toast("success", "اكتملت الدورة في 3.1 ثانية. لا إصدارات جديدة — والوكيل متوقّف بانتظار قرار بشري.");
    }, (AGENT_STEPS.length + 1) * 900);
  }

  return (
    <Page>
      <Hero
        eyebrow={
          <>
            <Eyebrow tone="live">
              آخر دورة <bdi dir="ltr">{AGENT_STATUS.lastCycle}</bdi>
            </Eyebrow>
            <Eyebrow>
              <bdi dir="ltr">{AGENT_STATUS.host}</bdi>
            </Eyebrow>
          </>
        }
        headline={
          paused.length > 0 ? (
            <>
              <HeroFigure tone="danger">{paused.length}</HeroFigure> مصدر موقوف
              <br />
              يحتاج تدخّلك
            </>
          ) : (
            <>
              <HeroFigure tone="success">{active.length}</HeroFigure> مصادر تعمل
              <br />
              بلا أعطال
            </>
          )
        }
        lede={
          <>
            الوكيل يعمل منذ <span className="num font-mono text-ink">{AGENT_STATUS.uptimeDays}</span> يوماً بلا انقطاع،
            ومتوسط الدورة <span className="num font-mono text-ink">{AGENT_STATUS.cycleSeconds}</span> ثانية.{" "}
            {paused.length > 0
              ? `مصدر ${paused[0].short} موقوف مؤقتاً — لا يُفحص حتى يُعاد تفعيله.`
              : "كل المصادر المفعّلة فُحصت في دورتها الأخيرة."}
          </>
        }
        actions={
          <>
            {can("scan") && (
              <Button variant="primary" onClick={runScan} loading={running !== null}>
                {running === null && <ScanSearch size={20} strokeWidth={2} aria-hidden />}
                شغّل دورة الآن
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.push("/sources")}>
              <Radar size={20} strokeWidth={2} aria-hidden />
              إدارة المصادر
            </Button>
          </>
        }
        facts={[
          { label: "طابور الانتظار", value: AGENT_STATUS.queue },
          { label: "طلبات مصادر معلّقة", value: pending.length },
          { label: "محوّل للمراجعة اليدوية", value: escalated }
        ]}
      />

      <Reveal>
        <MetricBar>
          <StatCard
            label="مصادر مفعّلة"
            value={`${active.length} / ${SOURCES.length}`}
            context={paused.length > 0 ? `${paused.length} موقوف مؤقتاً` : "لا مصدر موقوف"}
            icon={Radar}
            tone={paused.length > 0 ? "danger" : "success"}
            alert={paused.length > 0}
          />
          <StatCard
            label="زمن الدورة بالثواني"
            value={AGENT_STATUS.cycleSeconds}
            context="من الجلب حتى التوقّف بانتظار القرار"
            icon={TimerReset}
          />
          <StatCard
            label="ذاكرة المسرّع"
            value={`${AGENT_STATUS.memoryUsed} / ${AGENT_STATUS.memoryTotal} GB`}
            context={AGENT_STATUS.accelerator}
            icon={Cpu}
          />
          <StatCard
            label="دون عتبة الثقة"
            value={escalated}
            context={`ثقة أقل من ${AGENT_STATUS.threshold}% — تُحوَّل للمراجعة اليدوية`}
            icon={ShieldAlert}
          />
        </MetricBar>
      </Reveal>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Section title="صحة المصادر" sub="آخر فحص لكل مصدر وتكراره المجدول">
          <Reveal>
            <Card className="flex flex-col gap-3">
              {SOURCES.map((s) => (
                <SourceHealth key={s.id} source={s} />
              ))}
              <CardFoot>
                <span className="flex flex-wrap items-center justify-between gap-3">
                  إضافة مصدر أو تفعيله يحتاج موافقة المختص ويُسجَّل في سجل التدقيق.
                  <Button variant="secondary" size="sm" onClick={() => router.push("/sources")}>
                    صفحة المصادر
                  </Button>
                </span>
              </CardFoot>
            </Card>
          </Reveal>
        </Section>

        <div className="flex flex-col gap-6">
          <Reveal index={0}>
            <Card glow={running !== null}>
              <CardHead
                title="حالة الوكيل"
                sub={running !== null ? "دورة جارية الآن" : "آخر دورة كاملة"}
                aside={<Activity size={18} strokeWidth={2} className="text-brand" aria-hidden />}
              />
              <AgentActivity
                active={running ?? AGENT_STEPS.length - 1}
                stamps={running === null ? LAST_RUN_STAMPS : undefined}
                compact
                note="الوكيل يقف عند المرحلة الخامسة دائماً — لا اعتماد تلقائي ولا إغلاق بند."
              />
            </Card>
          </Reveal>

          <Reveal index={1}>
            <Card>
              <CardHead title="حالة النموذج" sub="ما يُكتب اسمه في كل قيد تدقيق" />
              <dl className="flex flex-col gap-3">
                <StatusRow label="النموذج" value={AGENT_STATUS.model} mono />
                <StatusRow label="التكميم" value={AGENT_STATUS.quantization} mono />
                <StatusRow label="نسخة التعليمات" value={AGENT_STATUS.instructions} mono />
                <StatusRow label="موضع التشغيل" value={AGENT_STATUS.runtime} />
                <StatusRow label="عتبة الثقة" value={`${AGENT_STATUS.threshold}%`} mono />
              </dl>
              <CardFoot>
                تغيير النموذج أو نسخة التعليمات يُسجَّل في سجل التدقيق، وتبقى القيود القديمة محمولةً على إصدارها.
              </CardFoot>
            </Card>
          </Reveal>

          <Reveal index={2}>
            <Card>
              <CardHead title="العزل" aside={<Boxes size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />} />
              <p className="font-body text-body-sm text-ink">
                النواة معزولة: لا منفذ خارجي مفتوح، والنماذج تعمل على عتاد المنشأة. الجلب وحده يخرج إلى صفحات الجهات
                المنشورة علناً، ولا يحمل معه أي بيانات داخلية.
              </p>
            </Card>
          </Reveal>
        </div>
      </div>
    </Page>
  );
}

function SourceHealth({ source }: { source: Source }) {
  const ok = source.state === "active";
  const warn = source.state === "paused" || source.state === "pending";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3 last:border-b-0 last:pb-0">
      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className={cx(
            "h-2 w-2 shrink-0 rounded-full",
            ok ? "bg-success" : warn ? "bg-warning" : "bg-ink-subtle"
          )}
        />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-body text-body-sm text-ink">{source.name}</span>
          <span className="font-body text-caption text-ink-muted">{source.frequency}</span>
        </span>
      </span>
      <span className="shrink-0 text-end">
        {source.lastScan ? (
          <bdi dir="ltr" className="num block font-mono text-caption text-ink">
            {source.lastScan}
          </bdi>
        ) : (
          <span className="block font-body text-caption text-ink-muted">لم يُفحص بعد</span>
        )}
        <span className="font-body text-caption text-ink-subtle">
          <bdi dir="ltr">{source.short}</bdi>
        </span>
      </span>
    </div>
  );
}

function StatusRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-3 last:border-b-0 last:pb-0">
      <dt className="font-body text-body-sm text-ink-muted">{label}</dt>
      <dd className="text-end font-body text-body-sm text-ink">
        {mono ? (
          <bdi dir="ltr" className="num font-mono">
            {value}
          </bdi>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
