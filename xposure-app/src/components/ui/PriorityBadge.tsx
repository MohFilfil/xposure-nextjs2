"use client";

import type { Priority } from "@/lib/types";
import { useT } from "@/components/I18nProvider";
import { cx } from "@/lib/utils";

/**
 * شكل حبة الدواء (radius-full) إلزامي — يفرّقها عن StatusBadge المستطيلة في نفس الصف.
 * اللون الدلالي محجوز لهذه الشارة وحدها في الصف: الحالة محايدة بعد أن تزاحم اللونان.
 * «متابعة» محايدة عمداً: لا تُلوَّن success لأن الأخضر محجوز لمعنى «معتمد».
 * لا يُستخدم danger لأي أولوية غير «حرج».
 * «حرج» وحده يحمل هالة خفيفة — تمييز ثالث فوق اللون والنص، يُقرأ حتى بطرف العين.
 */
const TONE: Record<Priority, string> = {
  critical: "bg-danger text-on-danger shadow-[0_0_16px_-4px_var(--danger)]",
  strategic: "bg-warning text-on-warning",
  quick: "bg-info text-on-info",
  watch: "bg-surface-overlay text-ink"
};

export function PriorityBadge({ priority, size = "sm" }: { priority: Priority; size?: "sm" | "lg" }) {
  const t = useT();
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full font-body transition-transform duration-2 ease-spring",
        size === "lg" ? "px-5 py-2 text-body font-bold" : "px-3 py-1 text-caption",
        TONE[priority]
      )}
    >
      {t.priority[priority]}
    </span>
  );
}
