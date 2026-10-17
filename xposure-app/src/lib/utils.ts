/** تاريخ مرجعي ثابت لبيانات العرض. استبدله بـ new Date() عند الربط بمصدر حقيقي. */
export const TODAY = new Date("2026-09-18T00:00:00");

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function daysUntil(isoDate: string) {
  return Math.round((new Date(`${isoDate}T00:00:00`).getTime() - TODAY.getTime()) / 86_400_000);
}

/**
 * نغمة الموعد وعدد أيامه. النص يُبنى في الواجهة من المعجم لا هنا:
 * الواجهة بلغتين، واللون وحده لا يكفي في أي منهما — فيبقى الرقم مقروناً بنصّ دائماً.
 */
export function dueState(isoDate: string): { tone: "danger" | "warning" | "success"; days: number } {
  const days = daysUntil(isoDate);
  if (days < 0) return { tone: "danger", days };
  if (days <= 45) return { tone: "warning", days };
  return { tone: "success", days };
}

export function stamp(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `2026-09-18 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
