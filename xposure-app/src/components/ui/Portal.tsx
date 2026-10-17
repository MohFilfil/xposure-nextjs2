"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * ينقل الطبقات التي تغطي الشاشة (نافذة منبثقة، شاشة فحص) إلى جسم المستند.
 *
 * السبب ليس تنظيمياً: عنصر `position: fixed` لا يُقاس على نافذة المتصفح إذا كان
 * أحد آبائه يحمل `transform` أو `filter` أو `will-change` — بل يُقاس على ذلك الأب.
 * وهذا يقع هنا فعلاً: غلاف انتقال الصفحة (PageTransition) يحمل حركة تُحرّك
 * transform، فتبقى قيمته مصفوفةَ الوحدة بعد انتهائها لا `none`، وتكفي لجعله
 * حاوية القياس. النتيجة أن طبقة بعرض الشاشة تُقصّ عند عمود المحتوى، ويُركَّز
 * محتواها في منتصف ارتفاع الصفحة كاملةً — أي أسفل الشاشة بألف بكسل وزيادة.
 *
 * الحركة في الغلاف ليست خطأ، والطبقة ليست خطأ؛ الخطأ أن تُرسم الطبقة داخله.
 * ونقلها إلى جسم المستند يحصّنها من أي سلف يحمل تحويلاً اليوم أو غداً —
 * و`.lift:hover` و`.reveal` كلاهما يحمل تحويلاً.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  /* التصيير على الخادم لا يملك document؛ فيُؤجَّل النقل إلى ما بعد التركيب */
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
