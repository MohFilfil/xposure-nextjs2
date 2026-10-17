"use client";

import { AlertCircle, Check, FileSearch, GitCompare, Hand, Quote, Radar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useT } from "@/components/I18nProvider";
import { cx } from "@/lib/utils";

/**
 * مراحل عمل الوكيل الخمس، بالترتيب نفسه في كل مكان يُعرض فيه: صفحة المصادر،
 * وتدفّق «افحص الآن»، وشرح «كيف يعمل» في الصفحة التعريفية.
 *
 * المرحلة الخامسة ليست زينة: الوكيل يقف عندها دائماً ولا يتجاوزها. عرضها كخطوة
 * صريحة في الخط نفسه هو ما يجعل «التوقّف بانتظار قرار بشري» سلوكاً مُعلناً في
 * المنتج لا وعداً في عرض تقديمي.
 */
export interface AgentStep {
  /** مفتاح المرحلة — هو نفسه مفتاحها في المعجم وفي طوابع آخر دورة. */
  key: "fetch" | "compare" | "impact" | "citation" | "await";
  icon: LucideIcon;
}

export const AGENT_STEPS: AgentStep[] = [
  { key: "fetch", icon: Radar },
  { key: "compare", icon: GitCompare },
  { key: "impact", icon: FileSearch },
  { key: "citation", icon: Quote },
  { key: "await", icon: Hand }
];

export type StepState = "done" | "running" | "waiting" | "idle";

function stateOf(index: number, active: number): StepState {
  if (index < active) return "done";
  if (index > active) return "idle";
  /* المرحلة الأخيرة لا «تجري»: هي وقوف معلن، فلها شكلها الخاص */
  return index === AGENT_STEPS.length - 1 ? "waiting" : "running";
}

/**
 * خط نشاط الوكيل. يُستعمل حيّاً أثناء الفحص (active يتقدّم بالوقت) وساكناً في
 * صفحة المصادر (active = 4، أي: انتهى كل شيء والقرار معلّق عند الإنسان).
 *
 * الحالة تُنقل بثلاث طرق معاً — أيقونة، ولون، ونص — فلا يعتمد الفهم على اللون.
 */
export function AgentActivity({
  active,
  stamps,
  compact,
  note
}: {
  /** فهرس المرحلة الجارية؛ ما قبلها منجز وما بعدها لم يبدأ. */
  active: number;
  /** طابع زمني لكل مرحلة منجزة — يُعرض في العرض الساكن لا أثناء الجريان. */
  stamps?: Record<string, string>;
  compact?: boolean;
  note?: React.ReactNode;
}) {
  const t = useT();
  return (
    <div>
      <ol className="relative flex flex-col gap-1" aria-live="polite">
        {/* الخيط الرأسي يصل المراحل: الخطوات سلسلة واحدة لا خمس بطاقات */}
        <span
          aria-hidden
          className="absolute bottom-5 top-5 w-px"
          style={{ insetInlineStart: "15px", background: "var(--hairline)" }}
        />

        {AGENT_STEPS.map((step, i) => {
          const state = stateOf(i, active);
          const Icon = step.icon;
          const copy = t.agent.steps[step.key];
          return (
            <li key={step.key} className="relative flex items-start gap-3 py-2">
              <span
                aria-hidden
                className={cx(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-3",
                  state === "done" && "border-transparent bg-[color-mix(in_srgb,var(--success)_22%,var(--surface-raised))]",
                  state === "running" && "border-transparent bg-[color-mix(in_srgb,var(--brand)_32%,var(--surface-raised))]",
                  state === "waiting" && "border-transparent bg-[color-mix(in_srgb,var(--warning)_26%,var(--surface-raised))]",
                  state === "idle" && "border-border bg-surface"
                )}
              >
                {state === "done" ? (
                  <Check size={16} strokeWidth={2.5} className="text-success" />
                ) : state === "waiting" ? (
                  <Hand size={16} strokeWidth={2} className="text-warning" />
                ) : (
                  <Icon
                    size={16}
                    strokeWidth={2}
                    className={cx(state === "running" ? "text-brand" : "text-ink-subtle")}
                  />
                )}
                {state === "running" && (
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand opacity-40 motion-reduce:hidden" />
                )}
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    className={cx(
                      "font-body text-body-sm",
                      state === "idle" ? "text-ink-muted" : "font-semibold text-ink"
                    )}
                  >
                    {copy.label}
                  </span>
                  {stamps?.[step.key] && (
                    <span className="num font-mono text-caption text-ink-muted" dir="ltr">
                      {stamps[step.key]}
                    </span>
                  )}
                  {state === "running" && <span className="font-body text-caption text-brand">{t.agent.inProgress}</span>}
                  {state === "waiting" && (
                    <span className="font-body text-caption font-semibold text-warning">{t.agent.pausedNow}</span>
                  )}
                </span>
                {!compact && <span className="font-body text-caption text-ink-muted">{copy.detail}</span>}
              </span>
            </li>
          );
        })}
      </ol>

      {note && (
        <p className="mt-3 flex items-start gap-2 border-t border-hairline pt-3 font-body text-caption text-ink-muted">
          <AlertCircle size={14} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
          {note}
        </p>
      )}
    </div>
  );
}
