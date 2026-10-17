"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronLeft, FileLock2, History, ShieldCheck, X } from "lucide-react";
import { Eyebrow, Page } from "@/components/layout/Page";
import { Hero, HeroFigure } from "@/components/layout/Hero";
import { Section } from "@/components/dashboards/Section";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { MetricBar, StatCard } from "@/components/ui/StatCard";
import { Reveal } from "@/components/motion/Reveal";
import { useDecisions } from "@/components/DecisionsProvider";
import { useT } from "@/components/I18nProvider";
import { Num } from "@/components/ui/Bidi";
import { useContent } from "@/lib/content";

/**
 * شاشة المدقّق. لا تملك زراً واحداً يغيّر حالة شيء — وهذا هو جوهرها:
 * المدقّق يسأل «من قرّر، ومتى، وبأي دليل؟»، فتُفتتح الشاشة بعدد القيود لا بعدد
 * البنود، وتنتهي بما يثبت أن ما يُعرض هو ما كان في الوثيقة فعلاً.
 */
export function AuditorDashboard() {
  const router = useRouter();
  const { statusOf, auditExtra, decisions } = useDecisions();
  const t = useT();
  const { changes: CHANGES, audit } = useContent();

  const all = [...audit, ...auditExtra];
  const approved = CHANGES.filter((c) => statusOf(c) === "approved").length;
  const rejected = CHANGES.filter((c) => statusOf(c) === "rejected").length;
  const undecided = CHANGES.length - approved - rejected;

  /* قيود الوكيل تُفصل عن قيود البشر: التمييز بينهما أول ما يسأل عنه المدقّق */
  const agentRows = all.filter(
    (e) =>
      e.who.includes("الوكيل") ||
      e.who.includes("محرك") ||
      e.who.includes("مكوّن") ||
      e.who.includes("Agent") ||
      e.who.includes("engine") ||
      e.who.includes("component")
  );
  const humanRows = all.filter((e) => !agentRows.includes(e));

  const lowConfidence = CHANGES.filter((c) => c.confidence < 70);
  const decidedWithReason = Object.values(decisions).filter((d) => d.status === "rejected" && d.reason);

  return (
    <Page>
      <Hero
        eyebrow={
          <>
            <Eyebrow tone="live">{t.auditor.immutable}</Eyebrow>
            <Eyebrow>{t.auditor.readOnlyEverywhere}</Eyebrow>
          </>
        }
        headline={
          <>
            <HeroFigure>{all.length}</HeroFigure> {t.auditor.entriesHead}
          </>
        }
        lede={
          <>{t.auditor.lede}</>
        }
        actions={
          <Button variant="primary" onClick={() => router.push("/audit")}>
            <History size={20} strokeWidth={2} aria-hidden />
            {t.auditor.openFull}
          </Button>
        }
        facts={[
          { label: t.auditor.agentEntries, value: agentRows.length },
          { label: t.auditor.humanEntries, value: humanRows.length },
          { label: t.auditor.undecided, value: undecided }
        ]}
      />

      <Reveal>
        <MetricBar>
          <StatCard
            label={t.auditor.approvedMetric}
            value={approved}
            context={t.auditor.approvedCtx}
            icon={Check}
            tone="success"
          />
          <StatCard
            label={t.auditor.rejectedMetric}
            value={rejected}
            context={`${decidedWithReason.length} ${t.auditor.withReason}`}
            icon={X}
          />
          <StatCard
            label={t.auditor.escalatedMetric}
            value={lowConfidence.length}
            context={t.auditor.escalatedCtx}
            icon={ShieldCheck}
          />
          <StatCard
            label={t.auditor.agentEntries}
            value={agentRows.length}
            context={t.auditor.agentEntriesCtx}
            icon={FileLock2}
          />
        </MetricBar>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Section title={t.auditor.latest} sub={t.auditor.latestSub}>
          <Reveal>
            <Card>
              <ol className="flex flex-col">
                {all
                  .slice(-6)
                  .reverse()
                  .map((entry, i) => (
                    <li
                      key={`${entry.time}-${i}`}
                      className="grid gap-1 border-b border-hairline py-3 last:border-b-0 md:grid-cols-[150px_1fr] md:gap-4"
                    >
                      <Num className="num font-mono text-body-sm text-ink-muted">{entry.time}</Num>
                      <span>
                        <span className="block font-body text-body-sm text-ink">{entry.what}</span>
                        <span className="block font-body text-caption text-ink-muted">{entry.who}</span>
                      </span>
                    </li>
                  ))}
              </ol>
              <CardFoot>
                <span className="flex flex-wrap items-center justify-between gap-3">
                  {t.auditor.exportNote}
                  <Button variant="secondary" size="sm" onClick={() => router.push("/audit")}>
                    {t.auditor.allEntries}
                    <ChevronLeft size={16} strokeWidth={2} aria-hidden className="ltr:rotate-180" />
                  </Button>
                </span>
              </CardFoot>
            </Card>
          </Reveal>
        </Section>

        <Section title={t.auditor.evidence} sub={t.auditor.evidenceSub}>
          <Reveal>
            <Card className="flex flex-col gap-4">
              <EvidenceRow label={t.auditor.rawFile} value={t.auditor.rawFileValue} note={t.auditor.rawFileNote} />
              <EvidenceRow label={t.auditor.versionHash} value="f3a9c1…" note={t.auditor.versionHashNote} mono />
              <EvidenceRow label={t.auditor.model} value="Qwen2.5 14B" note={t.auditor.modelNote} mono />
              <EvidenceRow
                label={t.auditor.citationCheck}
                value={`${CHANGES.length} / ${CHANGES.length}`}
                note={t.auditor.citationCheckNote}
                mono
              />
              <CardFoot>{t.auditor.evidenceFoot}</CardFoot>
            </Card>
          </Reveal>
        </Section>
      </div>

      <Section title={t.auditor.decisionState} sub={t.auditor.decisionStateSub}>
        <Reveal>
          <Card>
            <CardHead
              title={t.auditor.distribution}
              sub={t.auditor.distributionSub}
              aside={
                <span className="num font-mono text-caption text-ink-subtle">
                  <Num>{CHANGES.length}</Num> {t.common.changes}
                </span>
              }
            />
            <div className="flex flex-col gap-4">
              <DecisionBar label={t.auditor.approvedBar} count={approved} total={CHANGES.length} tone="var(--success)" />
              <DecisionBar label={t.auditor.rejectedBar} count={rejected} total={CHANGES.length} tone="var(--danger)" />
              <DecisionBar
                label={t.auditor.undecidedBar}
                count={undecided}
                total={CHANGES.length}
                tone="var(--ink-subtle)"
              />
            </div>
            <CardFoot>{t.auditor.distributionFoot}</CardFoot>
          </Card>
        </Reveal>
      </Section>
    </Page>
  );
}

function EvidenceRow({
  label,
  value,
  note,
  mono
}: {
  label: string;
  value: string;
  note: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-hairline pb-3 last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-body text-body-sm text-ink-muted">{label}</span>
        {mono ? (
          <Num className="num font-mono text-body-sm font-semibold text-ink">{value}</Num>
        ) : (
          <span className="font-body text-body-sm font-semibold text-ink">{value}</span>
        )}
      </div>
      <span className="font-body text-caption text-ink-muted">{note}</span>
    </div>
  );
}

function DecisionBar({ label, count, total, tone }: { label: string; count: number; total: number; tone: string }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-4">
      <span className="w-[84px] shrink-0 font-body text-body-sm text-ink">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </span>
      {/* النسبة والعدد داخل عزلة واحدة باتجاه LTR، وإلا قُرئت «٪70» معكوسة بين النصّين */}
      <Num className="num w-[86px] shrink-0 text-end font-mono text-body-sm text-ink">
        {count} · {pct}%
      </Num>
    </div>
  );
}
