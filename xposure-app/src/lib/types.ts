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

export interface Source {
  name: string;
  detail: string;
  state: "active" | "soon";
}

export interface Decision {
  status: Extract<Status, "approved" | "rejected">;
  at: string;
  by: string;
  reason?: string;
  task?: string;
}
