export type Priority = "critical" | "strategic" | "quick" | "watch";
export type Status = "new" | "pending" | "approved" | "rejected";
export type ChangeType = "متطلب جديد" | "تشديد" | "توضيح" | "إلغاء";

/** جزء من فقرة: نص ثابت، أو نص محذوف، أو نص مضاف — يصل جاهزاً من محرك المقارنة. */
export type DiffSegment = { text: string; kind?: "del" | "add" };

export interface RegChange {
  id: string;
  clause: string;
  type: ChangeType;
  title: string;
  agency: string;
  docFrom: string;
  docTo: string;
  page: number;
  priority: Priority;
  status: Status;
  confidence: number;
  effective: string;
  detected: string;
  previous: DiffSegment[];
  current: DiffSegment[];
  products: string[];
  processes: string[];
  controls: string[];
  /** ثلاثة أجزاء: ما قبل المقتبس، النص المقتبس المبرَّز، ما بعده. */
  citation: string[];
  why: string;
  recommendation: string;
  owner: string;
  due: string;
  decidedBy?: string;
  decidedAt?: string;
  taskRef?: string;
  rejectReason?: string;
}

export interface Task {
  id: string;
  title: string;
  change: string;
  owner: string;
  due: string;
  status: Status;
  priority: Priority;
}

export interface AuditEntry {
  time: string;
  what: string;
  who: string;
}

/**
 * حالة المصدر التنظيمي:
 * - active: مفعّل ويُفحص بالجدول.
 * - paused: موقوف مؤقتاً بقرار مسؤول تقني.
 * - pending: طلب إضافة بانتظار موافقة المختص — لا يُفحص قبلها.
 * - soon: مُعدّ في النظام ولم يُفعّل بعد.
 */
export type SourceState = "active" | "paused" | "pending" | "soon";

export interface Source {
  id: string;
  /** اسم الجهة كاملاً. */
  name: string;
  /** الاختصار اللاتيني للجهة — يُعرَض معزولاً باتجاه LTR. */
  short: string;
  /** الوثائق المتابَعة من هذه الجهة. */
  docs: string;
  state: SourceState;
  /** آخر فحص بصيغة YYYY-MM-DD HH:MM، أو null لمن لم يُفحص بعد. */
  lastScan: string | null;
  /** تكرار الفحص المجدول. */
  frequency: string;
  /** نتيجة آخر فحص بجملة واحدة. */
  lastResult: string;
  /** الإصداران اللذان تجري المقارنة بينهما إن وجدا. */
  versions?: { from: string; to: string };
  /** عدد التغييرات الجوهرية المرصودة من هذا المصدر. */
  changes?: number;
  /** طلب الإضافة: من طلبه ومتى — للمصادر في حالة pending. */
  requested?: { by: string; at: string };
}

export interface Decision {
  status: Extract<Status, "approved" | "rejected">;
  at: string;
  by: string;
  reason?: string;
  task?: string;
}
