"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, X } from "lucide-react";
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
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { CHANGES } from "@/lib/data";
import { daysUntil } from "@/lib/utils";

export default function ChangeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const { statusOf, decisions, approve, reject } = useDecisions();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

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

  function onApprove() {
    if (!change) return;
    const taskId = approve(change);
    toast("success", `اعتُمدت التوصية. أُنشئت المهمة ${taskId} وأُسندت إلى ${change.owner.split(" — ")[0]}.`);
    setTimeout(() => router.push("/changes"), 700);
  }

  function onReject() {
    if (!change) return;
    reject(change, reason.trim());
    setRejecting(false);
    toast("error", `رُفض ${change.id}. سُجِّل السبب في سجل التدقيق.`);
    setTimeout(() => router.push("/changes"), 700);
  }

  const reasonWritten = reason.trim().length > 0;

  return (
    <Page>
      <button
        type="button"
        onClick={() => router.push("/changes")}
        className="inline-flex w-fit items-center gap-2 font-body text-body-sm text-ink-muted hover:text-ink"
      >
        <ArrowRight size={20} strokeWidth={2} aria-hidden />
        العودة إلى التغييرات
      </button>

      <div className="-mt-6">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {/* الشارة كبيرة بجانب العنوان: القرار يُقرأ خلال ثانية من فتح الصفحة */}
          <PriorityBadge priority={change.priority} size="lg" />
          <StatusBadge status={status} />
          <span className="font-mono text-body-sm text-ink-muted">
            {change.id} · البند {change.clause}
          </span>
        </div>
        <h1 className="font-display text-display-lg text-ink">{change.title}</h1>
        <p className="mt-2 font-body text-body-lg text-ink-muted">
          {change.agency} — {change.docFrom} ← {change.docTo} · صفحة {change.page}
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-8">
          <section className="flex flex-col gap-6">
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
          </section>

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

          <Card>
            <CardHead title="سبب الأولوية" aside={<PriorityBadge priority={change.priority} />} />
            <p className="font-body text-body text-ink">{change.why}</p>
            <CardFoot>
              الدرجة تُحسب بمعادلة ثابتة (نوع التغيير، حالة الوثيقة، المدة المتبقية، حساسية الأصول وعددها). النموذج يشرح
              السبب فقط ولا يحسب الدرجة.
            </CardFoot>
          </Card>

          <Card>
            <CardHead title="التوصية المقترحة" />
            <p className="font-body text-body text-ink">{change.recommendation}</p>
            <dl className="mt-4 flex flex-col gap-3">
              <MetaRow label="المالك المقترح" value={change.owner} />
              <MetaRow label="الموعد المقترح" value={<span className="font-mono">{change.due}</span>} />
            </dl>
          </Card>

          {decided ? (
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
          ) : (
            <div className="sticky bottom-0 z-sticky mt-2 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface-raised p-5 shadow-lg">
              <p className="font-body text-body-sm text-ink-muted">
                الاعتماد يُنشئ مهمة في Odoo ويُسندها للمالك. لا يُعدّل الوكيل أي سياسة أو ملف في المنشأة.
              </p>
              <div className="flex flex-wrap items-center gap-3 max-md:w-full [&>button]:max-md:flex-1 [&>button]:max-md:justify-center">
                {/* زر primary واحد فقط في هذه الشاشة */}
                <Button variant="primary" onClick={onApprove}>
                  <Check size={20} strokeWidth={2} aria-hidden />
                  اعتماد التوصية
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => toast("info", `أُعيد ${change.id} إلى الوكيل لتحليل إضافي. ستصلك النتيجة خلال دقائق.`)}
                >
                  طلب تحليل إضافي
                </Button>
                <Button variant="danger" onClick={() => setRejecting(true)}>
                  <X size={20} strokeWidth={2} aria-hidden />
                  رفض
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHead title="تفاصيل البند" />
            <dl className="flex flex-col gap-3">
              <MetaRow label="الجهة" value={change.agency} />
              <MetaRow label="الوثيقة" value={`${change.docFrom} ← ${change.docTo}`} />
              <MetaRow label="رقم البند" value={<span className="font-mono">{change.clause}</span>} />
              <MetaRow label="نوع التغيير" value={change.type} />
              <MetaRow label="تاريخ السريان" value={<span className="font-mono">{change.effective}</span>} />
              <MetaRow label="المتبقي" value={`${daysUntil(change.effective)} يوماً`} />
              <MetaRow label="وقت الرصد" value={<span className="font-mono">{change.detected}</span>} />
            </dl>
          </Card>

          <Card>
            <ConfidenceBar value={change.confidence} />
          </Card>

          <Card>
            <CardHead title="الأصول المتأثرة" />
            <div className="flex flex-col gap-4">
              <ChipGroup label="المنتجات" items={change.products} />
              <ChipGroup label="العمليات" items={change.processes} />
              <ChipGroup label="الضوابط الداخلية" items={change.controls} />
            </div>
            <CardFoot>آخر تحديث لسجلات المنشأة: 2026-09-14</CardFoot>
          </Card>
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

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
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
