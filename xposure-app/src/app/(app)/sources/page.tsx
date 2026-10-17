"use client";

import { useEffect, useRef, useState } from "react";
import { CircleDashed, CirclePause, CircleSlash, Plus, Radar, ScanSearch } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button, ButtonNote } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/FormControls";
import { AGENT_STEPS, AgentActivity } from "@/components/ui/AgentActivity";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { Num, Code, DocArrow } from "@/components/ui/Bidi";
import { useContent } from "@/lib/content";
import { LAST_RUN_STAMPS } from "@/lib/data";
import type { Source, SourceState } from "@/lib/types";
import type { Dict } from "@/lib/i18n/ar";
import { cx, stamp } from "@/lib/utils";

/**
 * المصادر التنظيمية كشاشة قائمة بذاتها لا تبويباً في الإعدادات: هذه هي الحدود
 * التي يرى منها الوكيل العالم. من يسأل «هل فاتنا شيء؟» يسأل عن هذه الصفحة،
 * والجواب فيها رقمان: متى فُحص كل مصدر، وبأي تكرار يُفحص.
 *
 * ولأن الوكيل لا يُضيف مصدراً من تلقائه، زر الإضافة هنا يُنشئ طلباً معلّقاً
 * باسم صاحب الجلسة — لا مصدراً مفعّلاً.
 */

function stateUi(t: Dict): Record<SourceState, { label: string; icon: typeof Radar; tone: string }> {
  return {
    active: { label: t.sources.stateActive, icon: Radar, tone: "text-success" },
    paused: { label: t.sources.statePaused, icon: CirclePause, tone: "text-warning" },
    pending: { label: t.sources.statePending, icon: CircleDashed, tone: "text-warning" },
    soon: { label: t.sources.stateSoon, icon: CircleSlash, tone: "text-ink-subtle" }
  };
}

export default function SourcesPage() {
  const toast = useToast();
  const { can, account } = useSession();
  const t = useT();
  const { sources } = useContent();
  const ui = stateUi(t);
  const frequencies = [
    { value: "daily", label: t.sources.freqDaily },
    { value: "weekly", label: t.sources.freqWeekly },
    { value: "monthly", label: t.sources.freqMonthly }
  ];

  /* الطلبات المُنشأة في الجلسة تُضاف إلى القائمة المعروضة بحالة «معلّق» */
  const [added, setAdded] = useState<Source[]>([]);
  const [asking, setAsking] = useState(false);
  const [name, setName] = useState("");
  const [docs, setDocs] = useState("");
  const [frequency, setFrequency] = useState("weekly");

  /** الفحص الحيّ: active يتقدّم مرحلة كل ثانية ثم يقف عند المرحلة الخامسة. */
  const [running, setRunning] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function runScan() {
    if (running !== null) return;
    setRunning(0);
    timers.current = AGENT_STEPS.slice(1).map((_, i) =>
      setTimeout(() => setRunning(i + 1), (i + 1) * 900)
    );
    timers.current.push(
      setTimeout(() => {
        toast("info", t.scan.doneSources);
      }, AGENT_STEPS.length * 900)
    );
  }

  const list = [...sources, ...added];
  const active = list.filter((s) => s.state === "active").length;
  const pending = list.filter((s) => s.state === "pending").length;
  const nameWritten = name.trim().length > 0;

  function submitRequest() {
    const chosen = frequencies.find((f) => f.value === frequency)?.label ?? "";
    setAdded((prev) => [
      ...prev,
      {
        id: `SRC-REQ-${prev.length + 1}`,
        name: name.trim(),
        short: "—",
        docs: docs.trim() || t.sources.requestNoDocs,
        state: "pending",
        lastScan: null,
        frequency: `${t.sources.proposed} ${chosen}`,
        lastResult: t.sources.requestPendingResult,
        requested: { by: account?.name ?? "—", at: stamp() }
      }
    ]);
    setAsking(false);
    setName("");
    setDocs("");
    toast("success", t.sources.requestDone);
  }

  return (
    <Page>
      <PageHead
        title={t.sources.title}
        eyebrow={
          <>
            <Eyebrow tone="live">
              <Num>{active}</Num> {t.sources.activeOf} <Num>{list.length}</Num>
            </Eyebrow>
            {pending > 0 && (
              <Eyebrow>
                <Num>{pending}</Num> {t.sources.pendingRequests}
              </Eyebrow>
            )}
          </>
        }
        lede={t.sources.lede}
        action={
          <div className="flex flex-wrap items-center gap-3">
            {can("scan") && (
              <Button variant="secondary" onClick={runScan} loading={running !== null && running < AGENT_STEPS.length - 1}>
                {running === null && <ScanSearch size={20} strokeWidth={2} aria-hidden />}
                {t.scan.action}
              </Button>
            )}
            {can("addSource") && (
              <Button variant="primary" onClick={() => setAsking(true)}>
                <Plus size={20} strokeWidth={2} aria-hidden />
                {t.sources.addSource}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex min-w-0 flex-col gap-4">
          {list.map((source, i) => (
            <Reveal key={source.id} index={i}>
              <SourceRow source={source} canManage={can("manageAgent")} onToggle={(message) => toast("info", message)} />
            </Reveal>
          ))}
        </section>

        <div className="flex flex-col gap-6">
          <Reveal index={0}>
            <Card glow={running !== null}>
              <CardHead
                title={t.agent.title}
                sub={running !== null ? t.agent.running : t.agent.lastRun}
                aside={
                  running !== null ? (
                    <Chip>{t.agent.runningChip}</Chip>
                  ) : (
                    <Num className="num font-mono text-caption text-ink-subtle">2026-09-17</Num>
                  )
                }
              />
              <AgentActivity
                active={running ?? AGENT_STEPS.length - 1}
                stamps={running === null ? LAST_RUN_STAMPS : undefined}
                note={running !== null ? t.agent.noteRunning : t.agent.noteIdle}
              />
            </Card>
          </Reveal>

          <Reveal index={1}>
            <Card>
              <CardHead title={t.sources.permissions} />
              <ul className="flex flex-col gap-3">
                <PermRow label={t.sources.permRead} value={t.sources.allowed} tone="success" />
                <PermRow label={t.sources.permAnalyze} value={t.sources.allowed} tone="success" />
                <PermRow label={t.sources.permAdd} value={t.sources.needsApproval} tone="warning" />
                <PermRow label={t.sources.permWrite} value={t.sources.denied} tone="danger" />
              </ul>
              <CardFoot>{t.sources.permFoot}</CardFoot>
            </Card>
          </Reveal>
        </div>
      </div>

      {asking && (
        <Modal
          title={t.sources.requestTitle}
          warning={t.sources.requestWarning}
          onClose={() => setAsking(false)}
          actions={
            <>
              <Button variant="primary" disabled={!nameWritten} onClick={submitRequest}>
                {t.sources.requestSend}
              </Button>
              <Button variant="ghost" onClick={() => setAsking(false)}>
                {t.common.cancel}
              </Button>
              <ButtonNote>
                {nameWritten ? t.sources.requestReady : t.sources.requestBlocked}
              </ButtonNote>
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <Input
              label={t.sources.requestNameLabel}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.sources.requestNamePlaceholder}
            />
            <Input
              label={t.sources.requestDocsLabel}
              value={docs}
              onChange={(e) => setDocs(e.target.value)}
              placeholder={t.sources.requestDocsPlaceholder}
            />
            <Select
              label={t.sources.requestFreqLabel}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              options={frequencies}
            />
          </div>
        </Modal>
      )}
    </Page>
  );
}

/**
 * صفّ المصدر. الحالة تُعرض بأيقونة ونص لا بشارة ملوّنة مصمتة: اللون المصمت في
 * هذا المنتج لغة الأولوية، والمصدر لا أولوية له.
 */
function SourceRow({
  source,
  canManage,
  onToggle
}: {
  source: Source;
  canManage: boolean;
  onToggle: (message: string) => void;
}) {
  const t = useT();
  const state = stateUi(t)[source.state];
  const Icon = state.icon;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-h3 text-ink">{source.name}</h2>
            {/* الاختصار اللاتيني معزول باتجاهه، وإلا التصق بعلامات الترقيم العربية حوله */}
            <Code className="rounded-sm bg-surface-overlay px-1.5 py-0.5 text-caption text-ink-muted">
              {source.short}
            </Code>
          </div>
          <p className="font-body text-body-sm text-ink-muted">{source.docs}</p>
        </div>

        <span className={cx("flex shrink-0 items-center gap-2 font-body text-body-sm font-semibold", state.tone)}>
          <Icon size={18} strokeWidth={2} aria-hidden />
          {state.label}
        </span>
      </div>

      <dl className="grid gap-x-6 gap-y-3 border-t border-hairline pt-4 sm:grid-cols-3">
        <Field label={t.sources.lastScan}>
          {source.lastScan ? (
            <Num className="num font-mono">{source.lastScan}</Num>
          ) : (
            <span className="text-ink-muted">{t.sources.notScanned}</span>
          )}
        </Field>
        <Field label={t.sources.frequency}>{source.frequency}</Field>
        <Field label={t.sources.trackedVersion}>
          {source.versions ? (
            <DocArrow from={source.versions.from} to={source.versions.to} />
          ) : (
            <span className="text-ink-muted">{t.common.none}</span>
          )}
        </Field>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
        <p className="max-w-[70ch] font-body text-caption text-ink-muted">
          {source.lastResult}
          {source.requested && (
            <>
              {" "}
              {t.sources.requestedBy} {source.requested.by} {t.sources.requestedAt}{" "}
              <Num className="num font-mono">{source.requested.at}</Num>.
            </>
          )}
        </p>

        <div className="flex items-center gap-3">
          {typeof source.changes === "number" && (
            <span className="font-body text-caption text-ink-muted">
              <Num className="num font-mono font-semibold text-ink">{source.changes}</Num> {t.sources.changesFrom}
            </span>
          )}
          {canManage && source.state !== "pending" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                onToggle(source.state === "active" ? t.sources.pausedToast : t.sources.activateToast)
              }
            >
              {source.state === "active" ? t.sources.pause : t.sources.activate}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-body text-caption text-ink-subtle">{label}</dt>
      <dd className="font-body text-body-sm text-ink">{children}</dd>
    </div>
  );
}

function PermRow({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "danger" }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-hairline pb-3 font-body text-body-sm last:border-b-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span
        className={cx(
          "shrink-0 font-semibold",
          tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-danger"
        )}
      >
        {value}
      </span>
    </li>
  );
}
