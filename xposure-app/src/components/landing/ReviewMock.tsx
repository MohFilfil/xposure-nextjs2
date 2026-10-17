"use client";

import { Check, ShieldCheck } from "lucide-react";
import { Num, Code, DocArrow } from "@/components/ui/Bidi";
import { useT } from "@/components/I18nProvider";
import { useContent } from "@/lib/content";
import { cx } from "@/lib/utils";

/**
 * الصورة المنتَجية في الصدارة: محاكاة مصقولة لشاشة مراجعة التغيير.
 *
 * ليست صورة ولا إطار جهاز ولا أعمدة رمادية: مبنية من واجهة التطبيق نفسها —
 * رموز الألوان نفسها، والبيانات نفسها من lib/data.ts (البند CH-2401 بنصّه قبل
 * وبعد)، والتسميات من معجم التطبيق. فما يراه الزائر هنا هو ما سيراه بعد الدخول.
 *
 * aria-hidden لأنها تكرار بصري لما تقوله الصدارة نصّاً؛ قارئ الشاشة يقرأ العنوان
 * والجملة والفعل، ولا حاجة به إلى قراءة محاكاة واجهة.
 */
export function ReviewMock({ className }: { className?: string }) {
  const t = useT();
  const { changes } = useContent();
  const change = changes[0];
  if (!change) return null;

  return (
    <div
      aria-hidden
      className={cx(
        "pointer-events-none select-none overflow-hidden rounded-lg border border-border bg-surface-raised shadow-card",
        className
      )}
    >
      {/* شريط الشاشة: رقم البند والوثيقتان — كلها معرّفات لاتينية معزولة الاتجاه */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-hairline bg-surface-overlay/70 px-4 py-3">
        <span className="rounded-full bg-danger px-2.5 py-0.5 font-body text-caption font-bold text-on-danger">
          {t.priority.critical}
        </span>
        <Code className="text-caption text-ink-muted">{change.id}</Code>
        <span className="font-body text-caption text-ink-muted">
          {t.detail.clause} <Code>{change.clause}</Code>
        </span>
        <DocArrow from={change.docFrom} to={change.docTo} className="ms-auto text-caption text-ink-muted" />
      </div>

      <div className="flex flex-col gap-4 p-4 md:p-5">
        <p className="font-display text-h3 text-ink">{change.title}</p>

        {/* النص قبل وبعد: الكلمات المتغيّرة مُعلَّمة بلون وعلامة معاً، لا بلون وحده */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-hairline bg-surface p-3.5">
            <p className="mb-2 font-body text-caption text-ink-muted">
              {t.detail.newVersion} · <Code>{change.docTo}</Code>
            </p>
            <p className="font-body text-body-sm leading-[1.9] text-ink">
              {change.current.map((seg, i) =>
                seg.kind === "add" ? (
                  <mark
                    key={i}
                    className="rounded-sm bg-[color-mix(in_srgb,var(--success)_22%,transparent)] px-1 text-ink"
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </p>
          </div>

          <div className="rounded-md border border-hairline bg-surface p-3.5">
            <p className="mb-2 font-body text-caption text-ink-muted">
              {t.detail.previousVersion} · <Code>{change.docFrom}</Code>
            </p>
            <p className="font-body text-body-sm leading-[1.9] text-ink-muted">
              {change.previous.map((seg, i) =>
                seg.kind === "del" ? (
                  <mark
                    key={i}
                    className="rounded-sm bg-[color-mix(in_srgb,var(--danger)_20%,transparent)] px-1 text-ink line-through decoration-2"
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </p>
          </div>
        </div>

        {/* سطر الاستشهاد: من أي وثيقة وأي صفحة ومتى يسري — بصيغة تاريخ واحدة */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline pt-3.5">
          <span className="inline-flex items-center gap-1.5 font-body text-caption font-semibold text-success">
            <ShieldCheck size={14} strokeWidth={2} aria-hidden />
            {t.detail.citationMatches}
          </span>
          <span className="font-body text-caption text-ink-muted">
            <Code>{change.docTo}</Code> · {t.detail.page} <Num>{change.page}</Num> · {t.detail.effectiveDate}{" "}
            <Num>{change.effective}</Num>
          </span>
        </div>

        {/* شريط القرار: الزرّ الذي يُنشئ المهمة، ونصّ يقول إن القرار للمختص */}
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface-overlay/70 p-3">
          <span className="inline-flex items-center gap-2 rounded-md bg-brand px-3.5 py-2 font-body text-body-sm font-semibold text-on-brand">
            <Check size={16} strokeWidth={2.5} aria-hidden />
            {t.detail.approveAction}
          </span>
          <span className="font-body text-caption text-ink-muted">{t.detail.reviewProgress}</span>
        </div>
      </div>
    </div>
  );
}
