/**
 * مطابقة ضبابية خفيفة للوحة الأوامر: تقبل الحروف متفرقة («تشفر» تطابق «تشفير»،
 * و«2401» تطابق «CH-2401»)، وتكافئ المطابقة في أول الكلمة وتتابع الحروف.
 * الغرض أن يصل من يتذكر جزءاً من رقم البند أو من العنوان — لا بحث دلالي.
 */
export interface Match {
  score: number;
  /** مواضع الحروف المطابقة داخل النص الأصلي — تُستخدم لتظليلها في النتيجة. */
  indices: number[];
}

/** تُزال التشكيلات وتُوحَّد صور الألف والياء والتاء المربوطة قبل المقارنة. */
export function normalizeArabic(s: string) {
  return s
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[‏‎]/g, "");
}

export function fuzzyMatch(query: string, text: string): Match | null {
  const q = normalizeArabic(query.trim());
  if (!q) return { score: 0, indices: [] };

  const t = normalizeArabic(text);
  const indices: number[] = [];
  let score = 0;
  let ti = 0;
  let streak = 0;

  for (const ch of q) {
    if (ch === " ") {
      streak = 0;
      continue;
    }
    const at = t.indexOf(ch, ti);
    if (at === -1) return null;

    /* بداية كلمة تستحق ضعف نقاط حرف في وسطها — هكذا يسبق «تشفير» كلمةً تصادف أن تحوي الحروف */
    const atWordStart = at === 0 || /[\s\-·/:.,()]/.test(t[at - 1]);
    score += atWordStart ? 6 : 2;
    score += streak * 3;
    /* كل حرف مُتخطّى بين المطابقتين يخصم قليلاً، بحدّ أقصى حتى لا تنهار النتائج الطويلة */
    score -= Math.min(4, at - ti);

    streak = at === ti ? streak + 1 : 0;
    indices.push(at);
    ti = at + 1;
  }

  /* النص الأقصر أدقّ عند تساوي المطابقة: «المهام» تسبق «قائمة المهام المفتوحة» */
  score -= Math.min(10, Math.floor(t.length / 12));
  return { score, indices };
}

/** يقسم النص إلى مقاطع مطابقة وغير مطابقة لتظليل الأولى في واجهة النتائج. */
export function highlight(text: string, indices: number[]) {
  if (indices.length === 0) return [{ text, hit: false }];
  const set = new Set(indices);
  const parts: Array<{ text: string; hit: boolean }> = [];
  let buf = "";
  let hit = set.has(0);

  for (let i = 0; i < text.length; i++) {
    const isHit = set.has(i);
    if (isHit !== hit) {
      if (buf) parts.push({ text: buf, hit });
      buf = "";
      hit = isHit;
    }
    buf += text[i];
  }
  if (buf) parts.push({ text: buf, hit });
  return parts;
}
