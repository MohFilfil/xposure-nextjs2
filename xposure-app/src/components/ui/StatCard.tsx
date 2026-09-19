import type { LucideIcon } from "lucide-react";
import { cx } from "@/lib/utils";

/**
 * أربع بطاقات كحد أقصى في صف واحد أعلى الصفحة؛ أي مؤشر خامس ينتقل لصفحة تحليلات.
 * لون الرقم محايد إلا إذا كان الرقم نفسه حالة (قضايا حرجة، درجة امتثال).
 * الشريط الجانبي الملون للبطاقة التي تمثل تحذيراً فعلياً فقط.
 */
export function StatCard({
  label,
  value,
  context,
  icon: Icon,
  tone,
  alert
}: {
  label: string;
  value: string | number;
  context: string;
  icon: LucideIcon;
  tone?: "danger" | "success";
  alert?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-2 rounded-lg border border-border bg-surface-raised p-5",
        alert && "border-s-[3px] border-s-danger"
      )}
    >
      <div className="flex items-center gap-2 font-body text-body-sm text-ink-muted">
        <Icon size={20} strokeWidth={2} aria-hidden />
        <span>{label}</span>
      </div>
      <div
        className={cx(
          "font-display text-display-sm",
          tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-ink"
        )}
      >
        {value}
      </div>
      <div className="font-body text-body-sm text-ink-muted">{context}</div>
    </div>
  );
}
