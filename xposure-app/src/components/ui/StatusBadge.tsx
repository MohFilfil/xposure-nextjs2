import type { Status } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/vocab";

/**
 * الشارات تستخدم أزواج on-x الخاصة بها، لا قاعدة لون الأزرار.
 * الشكل radius-sm دائماً — هذا ما يميّزها بصرياً عن شارة الأولوية المجاورة.
 */
const TONE: Record<Status, string> = {
  new: "bg-info text-on-info",
  pending: "bg-warning text-on-warning",
  approved: "bg-success text-on-success",
  rejected: "bg-danger text-on-danger"
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-1 font-body text-caption ${TONE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
