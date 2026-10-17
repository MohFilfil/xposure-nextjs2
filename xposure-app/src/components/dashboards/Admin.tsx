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
import { useT } from "@/components/I18nProvider";
import { Num, Code } from "@/components/ui/Bidi";
import { useContent } from "@/lib/content";
import { LAST_RUN_STAMPS } from "@/lib/data";
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
  const t = useT();
  const { changes: CHANGES, sources: SOURCES, agentStatus: AGENT_STATUS } = useContent();
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
      toast("success", t.scan.doneAdmin);
    }, (AGENT_STEPS.length + 1) * 900);
  }

  return (
    <Page>
      <Hero
        eyebrow={
          <>
            <Eyebrow tone="live">
              {t.admin.lastCycle} <Num>{AGENT_STATUS.lastCycle}</Num>
            </Eyebrow>
            <Eyebrow>
              <Code>{AGENT_STATUS.host}</Code>
            </Eyebrow>
          </>
        }
        headline={
          paused.length > 0 ? (
            <>
              <HeroFigure tone="danger">{paused.length}</HeroFigure> {t.admin.pausedHead}
            </>
          ) : (
            <>
              <HeroFigure tone="success">{active.length}</HeroFigure> {t.admin.healthyHead}
            </>
          )
        }
        lede={
          <>
            {t.admin.uptimeLede} <Num className="num font-mono text-ink">{AGENT_STATUS.uptimeDays}</Num>{" "}
            {t.admin.uptimeLede2} <Num className="num font-mono text-ink">{AGENT_STATUS.cycleSeconds}</Num>{" "}
            {t.admin.uptimeLede3}{" "}
            {paused.length > 0 ? (
              <>
                <Code>{paused[0].short}</Code> {t.admin.pausedNote}
              </>
            ) : (
              t.admin.allScanned
            )}
          </>
        }
        actions={
          <>
            {can("scan") && (
              <Button variant="primary" onClick={runScan} loading={running !== null}>
                {running === null && <ScanSearch size={20} strokeWidth={2} aria-hidden />}
                {t.scan.runCycle}
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.push("/sources")}>
              <Radar size={20} strokeWidth={2} aria-hidden />
              {t.admin.manageSources}
            </Button>
          </>
        }
        facts={[
          { label: t.admin.queue, value: AGENT_STATUS.queue },
          { label: t.admin.pendingSources, value: pending.length },
          { label: t.admin.escalated, value: escalated }
        ]}
      />

      <Reveal>
        <MetricBar>
          <StatCard
            label={t.admin.activeSources}
            value={`${active.length} / ${SOURCES.length}`}
            context={paused.length > 0 ? `${paused.length} ${t.admin.pausedCount}` : t.admin.noPaused}
            icon={Radar}
            tone={paused.length > 0 ? "danger" : "success"}
            alert={paused.length > 0}
          />
          <StatCard
            label={t.admin.cycleSeconds}
            value={AGENT_STATUS.cycleSeconds}
            context={t.admin.cycleCtx}
            icon={TimerReset}
          />
          <StatCard
            label={t.admin.memory}
            value={`${AGENT_STATUS.memoryUsed} / ${AGENT_STATUS.memoryTotal} GB`}
            context={AGENT_STATUS.accelerator}
            icon={Cpu}
          />
          <StatCard
            label={t.admin.belowThreshold}
            value={escalated}
            context={`${AGENT_STATUS.threshold}% — ${t.admin.belowThresholdCtx}`}
            icon={ShieldAlert}
          />
        </MetricBar>
      </Reveal>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Section title={t.admin.sourceHealth} sub={t.admin.sourceHealthSub}>
          <Reveal>
            <Card className="flex flex-col gap-3">
              {SOURCES.map((s) => (
                <SourceHealth key={s.id} source={s} />
              ))}
              <CardFoot>
                <span className="flex flex-wrap items-center justify-between gap-3">
                  {t.admin.sourceHealthFoot}
                  <Button variant="secondary" size="sm" onClick={() => router.push("/sources")}>
                    {t.admin.sourcesPage}
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
                title={t.admin.agentState}
                sub={running !== null ? t.admin.cycleRunning : t.admin.lastFullCycle}
                aside={<Activity size={18} strokeWidth={2} className="text-brand" aria-hidden />}
              />
              <AgentActivity
                active={running ?? AGENT_STEPS.length - 1}
                stamps={running === null ? LAST_RUN_STAMPS : undefined}
                compact
                note={t.admin.agentNote}
              />
            </Card>
          </Reveal>

          <Reveal index={1}>
            <Card>
              <CardHead title={t.admin.modelState} sub={t.admin.modelStateSub} />
              <dl className="flex flex-col gap-3">
                <StatusRow label={t.admin.modelName} value={AGENT_STATUS.model} mono />
                <StatusRow label={t.admin.quantization} value={AGENT_STATUS.quantization} mono />
                <StatusRow label={t.admin.instructions} value={AGENT_STATUS.instructions} mono />
                <StatusRow label={t.admin.runtime} value={AGENT_STATUS.runtime} />
                <StatusRow label={t.admin.threshold} value={`${AGENT_STATUS.threshold}%`} mono />
              </dl>
              <CardFoot>{t.admin.modelFoot}</CardFoot>
            </Card>
          </Reveal>

          <Reveal index={2}>
            <Card>
              <CardHead
                title={t.admin.isolation}
                aside={<Boxes size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />}
              />
              <p className="font-body text-body-sm text-ink">{t.admin.isolationBody}</p>
            </Card>
          </Reveal>
        </div>
      </div>
    </Page>
  );
}

function SourceHealth({ source }: { source: Source }) {
  const t = useT();
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
          <Num className="num block font-mono text-caption text-ink">{source.lastScan}</Num>
        ) : (
          <span className="block font-body text-caption text-ink-muted">{t.admin.notScanned}</span>
        )}
        <Code className="text-caption text-ink-subtle">{source.short}</Code>
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
          <Num className="num font-mono">{value}</Num>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
