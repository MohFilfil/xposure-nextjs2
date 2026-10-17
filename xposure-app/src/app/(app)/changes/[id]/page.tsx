"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarClock, Check, Eye, X } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Button, ButtonNote } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { DiffText } from "@/components/ui/DiffText";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/FormControls";
import { EmptyState } from "@/components/ui/BrandMotif";
import { QueueNav } from "@/components/ui/QueueNav";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { Num, Code, DocArrow } from "@/components/ui/Bidi";
import { useContent, useRoleCopy } from "@/lib/content";
import { CHANGES } from "@/lib/data";
import { cx, daysUntil } from "@/lib/utils";

/** ترتيب الطابور هو ترتيب القائمة الافتراضي — حتى يطابق j/k ما يراه المراجع في الجدول. */
const QUEUE = CHANGES.map((c) => c.id);

export default function ChangeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const { statusOf, decisions, approve, reject, nextUndecided, progress } = useDecisions();
  const { role, can } = useSession();
  const t = useT();
  const roleCopy = useRoleCopy();
  const { changeById, localizeName } = useContent();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const change = changeById(params.id);

  if (!change) {
    return (
      <Page>
        <EmptyState
          title={t.detail.notFound}
          description={t.detail.notFoundHint}
          action={
            <Button variant="secondary" onClick={() => router.push("/changes")}>
              {t.detail.backToList}
            </Button>
          }
        />
      </Page>
    );
  }

  const status = statusOf(change);
  const decision = decisions[change.id];
  const decided = status === "approved" || status === "rejected";
  const remaining = daysUntil(change.effective);

  /**
   * بعد القرار يتقدّم النظام للبند التالي الذي لم يُبتّ فيه، لا إلى القائمة.
   * المراجعة عمل متسلسل: العودة للقائمة بعد كل قرار تُجبر المراجع على إيجاد
   * موضعه من جديد اثنتي عشرة مرة. وحين لا يبقى بند مفتوح يعود إلى القائمة —
   * فهناك تُقرأ الحصيلة.
   */
  function advance() {
    if (!change) return;
    const next = nextUndecided(change.id);
    setTimeout(() => router.push(next ? `/changes/${next.id}` : "/changes"), 650);
  }

  function onApprove() {
    if (!change) return;
    setBusy(true);
    const taskId = approve(change);
    const next = nextUndecided(change.id);
    toast(
      "success",
      next
        ? `${t.detail.approvedToast} ${taskId} ${t.detail.approvedToastFor} ${change.owner.split(" — ")[0]}. ${t.detail.nextIs} ${next.clause}.`
        : `${t.detail.approvedToast} ${taskId}. ${t.detail.nothingLeft}`
    );
    advance();
  }

  function onReject() {
    if (!change) return;
    setBusy(true);
    reject(change, reason.trim());
    setRejecting(false);
    const next = nextUndecided(change.id);
    toast(
      "error",
      next
        ? `${change.id} ${t.detail.rejectedToast} ${t.detail.nextIs} ${next.clause}.`
        : `${change.id} ${t.detail.rejectedToast}`
    );
    advance();
  }

  const reasonWritten = reason.trim().length > 0;

  return (
    <Page>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/changes")}
          className="group inline-flex w-fit items-center gap-2 font-body text-body-sm text-ink-muted transition-colors duration-1 hover:text-ink"
        >
          {/* السهم يتقدّم نحو جهة البداية عند hover — تلميح لاتجاه الرجوع في واجهة RTL */}
          <ArrowRight
            size={20}
            strokeWidth={2}
            aria-hidden
            className="transition-transform duration-2 ease-out group-hover:translate-x-1 ltr:rotate-180"
          />
          {t.detail.back}
        </button>

        <QueueNav ids={QUEUE} currentId={change.id} hrefFor={(id) => `/changes/${id}`} />
      </div>

      <div className="-mt-6 animate-fade-up">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {/* الشارة كبيرة بجانب العنوان: القرار يُقرأ خلال ثانية من فتح الصفحة */}
          <PriorityBadge priority={change.priority} size="lg" />
          <StatusBadge status={status} />
          <span className="font-mono text-body-sm text-ink-muted">
            <Code>{change.id}</Code> · {t.detail.clause} <Code>{change.clause}</Code>
          </span>
          <span
            className={cx(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-body text-caption",
              remaining < 0
                ? "border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger"
                : remaining <= 120
                  ? "border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-warning"
                  : "border-border bg-surface-raised text-ink-muted"
            )}
          >
            <CalendarClock size={14} strokeWidth={2} aria-hidden />
            {remaining < 0 ? (
              <>
                {t.detail.overdueBy} <Num>{Math.abs(remaining)}</Num> {t.common.days}
              </>
            ) : (
              <>
                {t.detail.effectiveIn}{" "}
                <Num>
                  <CountUp value={remaining} />
                </Num>{" "}
                {t.common.days}
              </>
            )}
          </span>
        </div>
        <h1 className="font-display text-display-lg text-ink">{change.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 font-body text-body-lg text-ink-muted">
          {change.agency} — <DocArrow from={change.docFrom} to={change.docTo} /> · {t.detail.page}{" "}
          <Num>{change.page}</Num>
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Reveal as="section" className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-h2 text-ink">{t.detail.textComparison}</h2>
              {/* نوع التغيير يُعرض بشارة منفصلة، لا داخل DiffText */}
              <Chip>{change.type}</Chip>
            </div>
            <DiffText
              previous={change.previous}
              current={change.current}
              previousLabel={`${t.detail.previousVersion} · ${change.docFrom}`}
              currentLabel={`${t.detail.newVersion} · ${change.docTo}`}
            />
          </Reveal>

          <Reveal>
            <Card>
              <CardHead
                title={t.detail.sourceText}
                aside={
                  <span className="inline-flex items-center gap-1 font-body text-body-sm font-bold text-success">
                    <Check size={20} strokeWidth={2} aria-hidden />
                    {t.detail.citationMatches}
                  </span>
                }
              />
              <p className="rounded-md border border-border bg-surface p-4 font-body text-body leading-[28px] text-ink-muted">
                {change.citation[0]}
                <mark className="rounded-sm bg-[color-mix(in_srgb,var(--info)_25%,transparent)] px-1 text-ink">
                  {change.citation[1]}
                </mark>
                {change.citation[2]}
              </p>
              <CardFoot>
                <Code>{change.docTo}</Code> — {t.detail.page} <Num>{change.page}</Num> · {t.detail.citationFoot}
              </CardFoot>
            </Card>
          </Reveal>

          <Reveal>
            <Card>
              <CardHead title={t.detail.whyPriority} aside={<PriorityBadge priority={change.priority} />} />
              <p className="font-body text-body text-ink">{change.why}</p>
              <CardFoot>{t.detail.whyFoot}</CardFoot>
            </Card>
          </Reveal>

          <Reveal>
            <Card glow>
              <CardHead title={t.detail.recommendation} />
              <p className="font-body text-body text-ink">{change.recommendation}</p>
              <dl className="mt-4 flex flex-col gap-3">
                <MetaRow label={t.detail.proposedOwner} value={change.owner} />
                <MetaRow label={t.detail.proposedDue} value={<Num className="num font-mono">{change.due}</Num>} />
              </dl>
            </Card>
          </Reveal>

          {decided ? (
            <Reveal>
              <Card className={status === "approved" ? "border-s-[3px] border-s-success" : "border-s-[3px] border-s-danger"}>
                <CardHead
                  title={status === "approved" ? t.detail.approved : t.detail.rejected}
                  aside={<StatusBadge status={status} />}
                />
                <dl className="flex flex-col gap-3">
                  <MetaRow
                    label={t.detail.by}
                    value={localizeName(decision?.by ?? change.decidedBy ?? t.common.none)}
                  />
                  <MetaRow
                    label={t.detail.decidedAt}
                    value={<Num className="num font-mono">{decision?.at ?? change.decidedAt ?? t.common.none}</Num>}
                  />
                  {(decision?.task ?? change.taskRef) && (
                    <MetaRow
                      label={t.detail.createdTask}
                      value={
                        <>
                          <Code>{decision?.task ?? change.taskRef}</Code> {t.detail.inOdoo}
                        </>
                      }
                    />
                  )}
                </dl>
                {(decision?.reason ?? change.rejectReason) && (
                  <p className="mt-4 font-body text-body text-ink-muted">
                    {t.detail.reason}: {decision?.reason ?? change.rejectReason}
                  </p>
                )}
                <CardFoot>{t.detail.decisionFoot}</CardFoot>
              </Card>
            </Reveal>
          ) : !can("decide") ? (
            /**
             * دور بلا صلاحية قرار: لا تُعرض أزرار معطّلة بل يُقال من يملك القرار.
             * زرّ رمادي لا يُضغط يترك المستخدم يظنّ النظام معطّلاً؛ وجملة واحدة تشرح حدود دوره تكفي.
             */
            <Reveal>
              <Card className="border-s-[3px] border-s-border">
                <CardHead
                  title={t.detail.readOnly}
                  aside={
                    <span className="inline-flex items-center gap-1.5 font-body text-body-sm text-ink-muted">
                      <Eye size={18} strokeWidth={2} aria-hidden />
                      {role ? roleCopy.label(role) : ""}
                    </span>
                  }
                />
                <p className="font-body text-body text-ink">
                  {t.detail.readOnlyBody1} <span className="font-semibold">{roleCopy.label("compliance")}</span>
                  {t.detail.readOnlyBody2}
                </p>
                <CardFoot>{t.detail.readOnlyFoot}</CardFoot>
              </Card>
            </Reveal>
          ) : (
            /**
             * لوحة القرار ملتصقة بأسفل الشاشة: القرار متاح بلا عودة لأعلى الصفحة.
             * وهي تعلن أثر الاعتماد بالتفصيل — اسم المكلَّف والموعد — لا بجملة عامة:
             * زرٌّ يُنشئ مهمة باسم شخص ويُلزمه بتاريخ يجب أن يقول ذلك قبل الضغط،
             * لا بعده في تنبيه عابر.
             */
            /**
             * اللوح معتم لا زجاجي: النص الذي يمرّ تحته كان يُقرأ من خلاله فيتداخل
             * سطران في سطر. والصفحة تحتها مساحة بارتفاعه (pb في Page) فلا يغطّي
             * آخر بطاقة عند نهاية التمرير.
             */
            <div className="sticky bottom-0 z-sticky mt-2 flex flex-col gap-4 rounded-lg border border-border bg-surface-raised p-5 shadow-lg print:hidden">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <p className="max-w-[62ch] font-body text-body-sm text-ink-muted">
                  <span className="font-semibold text-ink">{t.detail.onApprove}</span> {t.detail.onApproveBody1}{" "}
                  <span className="font-semibold text-ink">{change.owner.split(" — ")[0]}</span>{" "}
                  {t.detail.onApproveBody2} <Num className="num font-mono text-ink">{change.due}</Num>,{" "}
                  {t.detail.onApproveBody3}
                </p>
                <QueueProgress decided={progress.decided} total={progress.total} />
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-4 max-md:w-full [&>button]:max-md:flex-1 [&>button]:max-md:justify-center">
                {/* زر primary واحد فقط في هذه الشاشة */}
                <Button variant="primary" loading={busy} onClick={onApprove}>
                  {!busy && <Check size={20} strokeWidth={2} aria-hidden />}
                  {t.detail.approveAction}
                </Button>
                {can("requestAnalysis") && (
                  <Button
                    variant="secondary"
                    onClick={() => toast("info", `${change.id} — ${t.detail.analysisQueued}`)}
                  >
                    {t.detail.requestAnalysis}
                  </Button>
                )}
                <Button variant="danger" onClick={() => setRejecting(true)}>
                  <X size={20} strokeWidth={2} aria-hidden />
                  {t.detail.rejectAction}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Reveal index={0}>
            <Card>
              <CardHead title={t.detail.detailsCard} />
              <dl className="flex flex-col gap-3">
                <MetaRow label={t.detail.agency} value={change.agency} />
                <MetaRow label={t.detail.document} value={<DocArrow from={change.docFrom} to={change.docTo} />} />
                <MetaRow label={t.detail.clauseNumber} value={<Code>{change.clause}</Code>} />
                <MetaRow label={t.detail.changeType} value={change.type} />
                <MetaRow label={t.detail.effectiveDate} value={<Num className="num font-mono">{change.effective}</Num>} />
                <MetaRow
                  label={t.detail.remaining}
                  value={
                    <>
                      <Num>{remaining}</Num> {t.common.days}
                    </>
                  }
                />
                {/* الطابع الزمني داخل عزلة واحدة: «2026-09-17 06:12» ينقلب إلى «06:12 2026-09-17» بلا عزل */}
                <MetaRow label={t.detail.detectedAt} value={<Num className="num font-mono">{change.detected}</Num>} />
              </dl>
            </Card>
          </Reveal>

          <Reveal index={1}>
            <Card>
              <ConfidenceBar value={change.confidence} />
            </Card>
          </Reveal>

          <Reveal index={2}>
            <Card>
              <CardHead title={t.detail.affectedAssets} />
              <div className="flex flex-col gap-4">
                <ChipGroup label={t.detail.productsLabel} items={change.products} />
                <ChipGroup label={t.detail.processesLabel} items={change.processes} />
                <ChipGroup label={t.detail.controlsLabel} items={change.controls} />
              </div>
              <CardFoot>{t.detail.assetsFoot}</CardFoot>
            </Card>
          </Reveal>
        </div>
      </div>

      {rejecting && (
        <Modal
          title={`${t.detail.rejectTitle} — ${change.id}`}
          warning={t.detail.rejectWarning}
          onClose={() => setRejecting(false)}
          actions={
            <>
              {/* لون الزر يعكس خطورة الفعل، لا كونه الزر الرئيسي */}
              <Button variant="danger" disabled={!reasonWritten} onClick={onReject}>
                {t.detail.rejectConfirm}
              </Button>
              <Button variant="ghost" onClick={() => setRejecting(false)}>
                {t.common.cancel}
              </Button>
              <ButtonNote>{reasonWritten ? t.detail.reasonWritten : t.detail.reasonMissing}</ButtonNote>
            </>
          }
        >
          <Textarea
            label={t.detail.reasonLabel}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t.detail.reasonPlaceholder}
          />
        </Modal>
      )}
    </Page>
  );
}

/**
 * تقدّم الطابور داخل لوحة القرار. المراجعة عمل له نهاية، ومعرفة بُعدِها يغيّر
 * إيقاع العمل: من يرى «بقي بندان» ينهيهما الآن، ومن لا يرى شيئاً يؤجّل الكل.
 */
function QueueProgress({ decided, total }: { decided: number; total: number }) {
  const t = useT();
  const pct = total === 0 ? 0 : Math.round((decided / total) * 100);
  return (
    <div className="shrink-0">
      <div className="mb-1.5 flex items-baseline gap-1.5 font-body text-caption text-ink-muted">
        {t.detail.decidedOf}
        <Num className="num font-mono text-body-sm font-bold text-ink">{decided}</Num>
        {t.common.of}
        <Num className="num font-mono text-body-sm text-ink">{total}</Num>
      </div>
      <div className="h-1.5 w-[132px] overflow-hidden rounded-full bg-surface-sunken" role="progressbar" aria-valuenow={decided} aria-valuemin={0} aria-valuemax={total} aria-label={t.detail.reviewProgress}>
        <div
          className="h-full rounded-full bg-gradient-brand"
          style={{ width: `${pct}%`, transition: "width var(--dur-4) var(--ease-out)" }}
        />
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-3 last:border-b-0 last:pb-0">
      <dt className="shrink-0 font-body text-body-sm text-ink-muted">{label}</dt>
      <dd className="text-end font-body text-body-sm text-ink">{value}</dd>
    </div>
  );
}

function ChipGroup({ label, items }: { label: string; items: string[] }) {
  const t = useT();
  return (
    <div>
      <div className="mb-2 font-body text-body-sm font-bold text-ink">{label}</div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </div>
      ) : (
        <p className="font-body text-body-sm text-ink-muted">{t.detail.nothingAffected}</p>
      )}
    </div>
  );
}
