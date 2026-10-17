import type { Priority, Status } from "./types";

/** أربع قيم ثابتة لا تُزاد عليها قيمة خامسة بدون نقاش في نموذج البيانات. */
export const STATUS_LABEL: Record<Status, string> = {
  new: "جديد",
  pending: "معلق",
  approved: "معتمد",
  rejected: "مرفوض"
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "حرج",
  strategic: "استراتيجي",
  quick: "إجراء سريع",
  watch: "متابعة"
};

/** لون كل أولوية كما هو في tokens.json — يُستخدم في مصفوفة الأولوية فقط. */
export const PRIORITY_VAR: Record<Priority, string> = {
  critical: "var(--danger)",
  strategic: "var(--warning)",
  quick: "var(--info)",
  watch: "var(--surface-overlay)"
};

export const STATUS_VAR: Record<Status, string> = {
  new: "var(--info)",
  pending: "var(--warning)",
  approved: "var(--success)",
  rejected: "var(--danger)"
};

/** ترتيب الاستعجال من الأعلى للأدنى — يُستخدم حصراً لترتيب الجداول بالنقر على العمود. */
export const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  strategic: 1,
  quick: 2,
  watch: 3
};
