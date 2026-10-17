"use client";

import { Check, X } from "lucide-react";
import type { Status } from "@/lib/types";
import { useT } from "@/components/I18nProvider";
import { cx } from "@/lib/utils";

/**
 * الحالة محايدة اللون عمداً.
 *
 * قبل هذا كانت الحالة شارةً مصمتة: «جديد» أزرق و«معلق» برتقالي — وهما لونا
 * «إجراء سريع» و«استراتيجي» في شارة الأولوية المجاورة لها في الصف نفسه. فكان
 * الصف يحمل أربعة ألوان دلالية لمعنيين مختلفين، ويقرأ المستخدم لون الحالة
 * كأنه درجة خطورة.
 *
 * اللون الدلالي صار محجوزاً للأولوية وحدها. والحالة تُنقل بثلاث إشارات لا لون
 * فيها: شكل العلامة (نقطة مصمتة، حلقة مفرّغة، صح، إكس)، والنص، ووزنه.
 * «جديد» وحده ينبض — هو الحالة الوحيدة التي تطلب فعلاً.
 */
export function StatusBadge({ status }: { status: Status }) {
  const t = useT();

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface-raised px-2 py-1 font-body text-caption",
        status === "new" ? "font-semibold text-ink" : "text-ink-muted"
      )}
    >
      <Mark status={status} />
      {t.status[status]}
    </span>
  );
}

/** العلامة: شكلها وحده يكفي لتمييز الحالة في صورة رمادية. */
function Mark({ status }: { status: Status }) {
  if (status === "approved") return <Check size={13} strokeWidth={3} aria-hidden className="shrink-0" />;
  if (status === "rejected") return <X size={13} strokeWidth={3} aria-hidden className="shrink-0" />;
  if (status === "pending") {
    return <span aria-hidden className="h-[7px] w-[7px] shrink-0 rounded-full border-[1.5px] border-current" />;
  }
  return (
    <span className="relative flex h-[7px] w-[7px] shrink-0" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-current opacity-50 motion-reduce:hidden" />
      <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-current" />
    </span>
  );
}
