import type { Priority } from "@/lib/types";
import { PRIORITY_LABEL } from "@/lib/vocab";
import { cx } from "@/lib/utils";

/**
 * شكل حبة الدواء (radius-full) إلزامي — يفرّقها عن StatusBadge المستطيلة في نفس الصف.
 * «متابعة» محايدة عمداً: لا تُلوَّن success لأن الأخضر محجوز لمعنى «معتمد».
 * لا يُستخدم danger لأي أولوية غير «حرج».
 */
const TONE: Record<Priority, string> = {
  critical: "bg-danger text-on-danger",
  strategic: "bg-warning text-on-warning",
  quick: "bg-info text-on-info",
  watch: "bg-surface-overlay text-ink"
};

export function PriorityBadge({ priority, size = "sm" }: { priority: Priority; size?: "sm" | "lg" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full font-body",
        size === "lg" ? "px-5 py-2 text-body font-bold" : "px-3 py-1 text-caption",
        TONE[priority]
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
