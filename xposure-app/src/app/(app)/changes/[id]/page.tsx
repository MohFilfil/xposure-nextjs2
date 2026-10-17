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
import { ROLES } from "@/lib/roles";
import { CHANGES } from "@/lib/data";
import { cx, daysUntil } from "@/lib/utils";

/** ترتيب الطابور هو ترتيب القائمة الافتراضي — حتى يطابق j/k ما يراه المراجع في الجدول. */
const QUEUE = CHANGES.map((c) => c.id);

export default function ChangeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const { statusOf, decisions, approve, reject, nextUndecided, progress } = useDecisions();
  const { role, can } = useSession();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const change = CHANGES.find((c) => c.id === params.id);

  if (!change) {
    return (
      <Page>
        <EmptyState
          title="التغيير غير موجود"
          description="تعذّر العثور على هذا التغيير."
          action={
            <Button variant="secondary" onClick={() => router.push("/changes")}>
              العودة للقائمة
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
        ? `اعتُمدت التوصية وأُنشئت المهمة ${taskId} لـ${change.owner.split(" — ")[0]}. التالي: ${next.clause}.`
        : `اعتُمدت التوصية وأُنشئت المهمة ${taskId}. لم يبقَ بند بانتظار قرارك.`
    );
    advance();
  }

  function onReject() {
    if (!change) return;
    setBusy(true);
    reject(change, reason.trim());
    setRejecting(false);
    const next = nextUndecided(change.id);
    toast("error", next ? `رُفض ${change.id}. سُجِّل السبب. التالي: ${next.clause}.` : `رُفض ${change.id}. سُجِّل السبب.`);
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
            className="transition-transform duration-2 ease-out group-hover:translate-x-1"
          />
          العودة إلى التغييرات
        </button>

        <QueueNav ids={QUEUE} currentId={change.id} hrefFor={(id) => `/changes/${id}`} />
      </div>

      <div className="-mt-6 animate-fade-up">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {/* الشارة كبيرة بجانب العنوان: القرار يُقرأ خلال ثانية من فتح الصفحة */}
          <PriorityBadge priority={change.priority} size="lg" />
          <StatusBadge status={status} />
          <span className="font-mono text-body-sm text-ink-muted">
            {change.id} · البند {change.clause}
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
              <>مرّ على السريان {Math.abs(remaining)} يوماً</>
            ) : (
              <>
                يبدأ السريان خلال <CountUp value={remaining} /> يوماً
              </>
            )}
          </span>
        </div>
        <h1 className="font-display text-display-lg text-ink">{change.title}</h1>
        <p className="mt-2 font-body text-body-lg text-ink-muted">
          {change.agency} — {change.docFrom} ← {change.docTo} · صفحة {change.page}
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Reveal as="section" className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-h2 text-ink">مقارنة نص البند</h2>
              {/* نوع التغيير يُعرض بشارة منفصلة، لا داخل DiffText */}
              <Chip>{change.type}</Chip>
            </div>
            <DiffText
              previous={change.previous}
              current={change.current}
              previousLabel={`الإصدار السابق · ${change.docFrom}`}
              currentLabel={`الإصدار الجديد · ${change.docTo}`}
            />
          </Reveal>

          <Reveal>
            <Card>
              <CardHead
                title="النص الأصلي في الوثيقة"
                aside={
                  <span className="inline-flex items-center gap-1 font-body text-body-sm font-bold text-success">
                    <Check size={20} strokeWidth={2} aria-hidden />
                    الاستشهاد مطابق
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
                {change.docTo} — صفحة {change.page} · تحقّق الكود من وجود النص حرفياً في الملف الخام المحفوظ.
              </CardFoot>
            </Card>
          </Reveal>

          <Reveal>
            <Card>
              <CardHead title="سبب الأولوية" aside={<PriorityBadge priority={change.priority} />} />
              <p className="font-body text-body text-ink">{change.why}</p>
              <CardFoot>
                الدرجة تُحسب بمعادلة ثابتة (نوع التغيير، حالة الوثيقة، المدة المتبقية، حساسية الأصول وعددها). النموذج يشرح
                السبب فقط ولا يحسب الدرجة.
              </CardFoot>
            </Card>
          </Reveal>

          <Reveal>
            <Card glow>
              <CardHead title="التوصية المقترحة" />
              <p className="font-body text-body text-ink">{change.recommendation}</p>
              <dl className="mt-4 flex flex-col gap-3">
                <MetaRow label="المالك المقترح" value={change.owner} />
                <MetaRow label="الموعد المقترح" value={<span className="font-mono">{change.due}</span>} />
              </dl>
            </Card>
          </Reveal>

          {decided ? (
            <Reveal>
              <Card className={status === "approved" ? "border-s-[3px] border-s-success" : "border-s-[3px] border-s-danger"}>
                <CardHead
                  title={status === "approved" ? "اعتُمدت التوصية" : "رُفض التغيير"}
                  aside={<StatusBadge status={status} />}
                />
                <dl className="flex flex-col gap-3">
                  <MetaRow label="بواسطة" value={decision?.by ?? change.decidedBy ?? "—"} />
                  <MetaRow label="وقت القرار" value={<span className="font-mono">{decision?.at ?? change.decidedAt ?? "—"}</span>} />
                  {(decision?.task ?? change.taskRef) && (
                    <MetaRow
                      label="المهمة المُنشأة"
                      value={
                        <>
                          <span className="font-mono">{decision?.task ?? change.taskRef}</span> في Odoo
                        </>
                      }
                    />
                  )}
                </dl>
                {(decision?.reason ?? change.rejectReason) && (
                  <p className="mt-4 font-body text-body text-ink-muted">السبب: {decision?.reason ?? change.rejectReason}</p>
                )}
                <CardFoot>
                  القرار مسجَّل في سجل التدقيق ولا يمكن تعديله — أي تغيير لاحق يُسجَّل كقرار جديد.
                </CardFoot>
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
                  title="اطّلاع فقط"
                  aside={
                    <span className="inline-flex items-center gap-1.5 font-body text-body-sm text-ink-muted">
                      <Eye size={18} strokeWidth={2} aria-hidden />
                      {role ? ROLES[role].label : ""}
                    </span>
                  }
                />
                <p className="font-body text-body text-ink">
                  هذا البند معروض عليك للاطّلاع. القرار فيه — اعتماداً أو رفضاً — من صلاحية{" "}
                  <span className="font-semibold">{ROLES.compliance.label}</span>، وهو من يُكتب اسمه في سجل
                  التدقيق بجانبه.
                </p>
                <CardFoot>
                  ما تراه هنا هو نفسه ما يراه المراجِع: النص قبل وبعد، الاستشهاد من الوثيقة، سبب الأولوية،
                  والتوصية المقترحة — بلا أزرار قرار.
                </CardFoot>
              </Card>
            </Reveal>
          ) : (
            /**
             * لوحة القرار ملتصقة بأسفل الشاشة: القرار متاح بلا عودة لأعلى الصفحة.
             * وهي تعلن أثر الاعتماد بالتفصيل — اسم المكلَّف والموعد — لا بجملة عامة:
             * زرٌّ يُنشئ مهمة باسم شخص ويُلزمه بتاريخ يجب أن يقول ذلك قبل الضغط،
             * لا بعده في تنبيه عابر.
             */
            <div className="glass sticky bottom-0 z-sticky mt-2 flex flex-col gap-4 rounded-lg border p-5 shadow-lg print:hidden">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <p className="max-w-[62ch] font-body text-body-sm text-ink-muted">
                  <span className="font-semibold text-ink">عند الاعتماد:</span> تُنشأ مهمة في Odoo باسم{" "}
                  <span className="font-semibold text-ink">{change.owner.split(" — ")[0]}</span> موعدها{" "}
                  <span className="num font-mono text-ink">{change.due}</span>، ويُسجَّل القرار في سجل التدقيق باسمك.
                  لا يُعدّل الوكيل أي سياسة أو ملف في المنشأة.
                </p>
                <QueueProgress decided={progress.decided} total={progress.total} />
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-4 max-md:w-full [&>button]:max-md:flex-1 [&>button]:max-md:justify-center">
                {/* زر primary واحد فقط في هذه الشاشة */}
                <Button variant="primary" loading={busy} onClick={onApprove}>
                  {!busy && <Check size={20} strokeWidth={2} aria-hidden />}
                  اعتماد التوصية
                </Button>
                {can("requestAnalysis") && (
                  <Button
                    variant="secondary"
                    onClick={() => toast("info", `أُعيد ${change.id} إلى الوكيل لتحليل إضافي. ستصلك النتيجة خلال دقائق.`)}
                  >
                    طلب تحليل إضافي
                  </Button>
                )}
                <Button variant="danger" onClick={() => setRejecting(true)}>
                  <X size={20} strokeWidth={2} aria-hidden />
                  رفض
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Reveal index={0}>
            <Card>
              <CardHead title="تفاصيل البند" />
              <dl className="flex flex-col gap-3">
                <MetaRow label="الجهة" value={change.agency} />
                <MetaRow label="الوثيقة" value={`${change.docFrom} ← ${change.docTo}`} />
                <MetaRow label="رقم البند" value={<span className="font-mono">{change.clause}</span>} />
                <MetaRow label="نوع التغيير" value={change.type} />
                <MetaRow label="تاريخ السريان" value={<span className="font-mono">{change.effective}</span>} />
                <MetaRow label="المتبقي" value={`${remaining} يوماً`} />
                <MetaRow label="وقت الرصد" value={<span className="font-mono">{change.detected}</span>} />
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
              <CardHead title="الأصول المتأثرة" />
              <div className="flex flex-col gap-4">
                <ChipGroup label="المنتجات" items={change.products} />
                <ChipGroup label="العمليات" items={change.processes} />
                <ChipGroup label="الضوابط الداخلية" items={change.controls} />
              </div>
              <CardFoot>آخر تحديث لسجلات المنشأة: 2026-09-14</CardFoot>
            </Card>
          </Reveal>
        </div>
      </div>

      {rejecting && (
        <Modal
          title={`رفض التغيير ${change.id}`}
          warning="الرفض يعني أن هذا التغيير لن يُنشأ له أي إجراء. القرار يُسجَّل في سجل التدقيق باسمك ولا يمكن حذفه لاحقاً."
          onClose={() => setRejecting(false)}
          actions={
            <>
              {/* لون الزر يعكس خطورة الفعل، لا كونه الزر الرئيسي */}
              <Button variant="danger" disabled={!reasonWritten} onClick={onReject}>
                تأكيد الرفض
              </Button>
              <Button variant="ghost" onClick={() => setRejecting(false)}>
                إلغاء
              </Button>
              <ButtonNote>
                {reasonWritten
                  ? "يُسجَّل السبب في سجل التدقيق باسمك."
                  : "زر الرفض معطّل حتى تكتب سبباً — لا رفض بلا سبب مكتوب."}
              </ButtonNote>
            </>
          }
        >
          <Textarea
            label="سبب الرفض (إلزامي)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مثال: الضابط مغطّى أصلاً بالإجراء الداخلي رقم ... وأُرفق الدليل."
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
  const pct = total === 0 ? 0 : Math.round((decided / total) * 100);
  return (
    <div className="shrink-0">
      <div className="mb-1.5 flex items-baseline gap-1.5 font-body text-caption text-ink-muted">
        بُتَّ في
        <span className="num font-mono text-body-sm font-bold text-ink">{decided}</span>
        من
        <span className="num font-mono text-body-sm text-ink">{total}</span>
      </div>
      <div className="h-1.5 w-[132px] overflow-hidden rounded-full bg-surface-sunken" role="progressbar" aria-valuenow={decided} aria-valuemin={0} aria-valuemax={total} aria-label="تقدّم مراجعة التغييرات">
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
        <p className="font-body text-body-sm text-ink-muted">لا شيء متأثر</p>
      )}
    </div>
  );
}
