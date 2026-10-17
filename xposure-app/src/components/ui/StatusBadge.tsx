import type { Status } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/vocab";

/**
 * الشارات تستخدم أزواج on-x الخاصة بها، لا قاعدة لون الأزرار.
 * الشكل radius-sm دائماً — هذا ما يميّزها بصرياً عن شارة الأولوية المجاورة.
 * حالة «جديد» وحدها تحمل نبضة: هي الحالة الوحيدة التي تطلب فعلاً من المستخدم،
 * وتعميم النبضة على بقية الحالات يُلغي معناها.
 */
const TONE: Record<Status, string> = {
  new: "bg-info text-on-info",
  pending: "bg-warning text-on-warning",
  approved: "bg-success text-on-success",
  rejected: "bg-danger text-on-danger"
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-body text-caption shadow-sm ${TONE[status]}`}
    >
      {status === "new" && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-current opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}
