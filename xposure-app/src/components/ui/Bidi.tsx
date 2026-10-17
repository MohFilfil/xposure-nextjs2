/**
 * عزل الاتجاه. المشكلة ليست نظرية: «CH-2401» و«2-3-3-1» و«70%» و«3 / 12»
 * كلها سلاسل ذات اتجاه ضعيف أو مختلط، فإذا وقعت داخل فقرة عربية رتّبتها قواعد
 * الاتجاه الثنائي بحسب ما حولها — فينقلب رقم البند، ويصير «70%» في صورة «%70»،
 * وينعكس ترتيب الكسر فيقلب معناه.
 *
 * `<bdi>` هو العنصر المخصّص لهذا في HTML: يعزل ما بداخله عن سياقه.
 * ومعه dir="ltr" يُفرض الترتيب اللاتيني داخل العزلة نفسها.
 */

/** رقم أو تاريخ أو نسبة أو كسر — كل ما يُقرأ من اليسار لليمين داخل نص عربي. */
export function Num({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <bdi dir="ltr" className={className}>
      {children}
    </bdi>
  );
}

/** معرّف أو رمز لاتيني: CH-2401، ECC-2:2024، AES-256، Qwen2.5 14B. */
export function Code({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <bdi dir="ltr" className={className ? `num font-mono ${className}` : "num font-mono"}>
      {children}
    </bdi>
  );
}

/**
 * انتقال بين إصدارين. السهم هنا معلومة لا زينة: «من» قبل «إلى».
 * العزلة الواحدة حول الطرفين والسهم معاً هي ما يمنع انعكاس ترتيبهما في RTL،
 * فيقرأ العربي والإنجليزي الاتجاه نفسه.
 */
export function DocArrow({ from, to, className }: { from: string; to: string; className?: string }) {
  return (
    <bdi dir="ltr" className={className ? `num whitespace-nowrap font-mono ${className}` : "num whitespace-nowrap font-mono"}>
      {from} → {to}
    </bdi>
  );
}
