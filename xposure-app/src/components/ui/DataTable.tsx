"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronsUpDown } from "lucide-react";
import { cx } from "@/lib/utils";
import { staggerDelay } from "@/lib/motion";
import type { Density } from "@/components/ui/DensityToggle";

export interface Column<T> {
  key: string;
  header: string;
  /** يُخفى أولاً على الشاشات الصغيرة بدل تصغير الخط. */
  hideBelow?: "sm" | "xs";
  render: (row: T) => React.ReactNode;
  /** يفعّل الترتيب بالنقر على رأس العمود؛ القيمة المُعادة هي أساس المقارنة. */
  sortValue?: (row: T) => string | number;
}

/**
 * الجدول الموحّد لكل قائمة بيانات: التغييرات، المهام، سجل التدقيق.
 * رأس الجدول دائماً ink-muted بحجم caption بلا خلفية مميزة، ولاصق (sticky) أسفل شريط
 * التنقل العلوي مباشرة عند التمرير — طبقاً لاستخدام z-sticky الموثّق في tokens.json.
 * عمود الأولوية قبل عمود الحالة. hover يكسو الصف كاملاً إذا كان قابلاً للنقر فقط.
 *
 * الحركة هنا مقيّدة عمداً: الصفوف تظهر بتلاشٍ متتابع سريع فقط (بلا إزاحة ولا تجاوز)،
 * لأن أي حركة في بيانات كثيفة تُقرأ كاهتزاز. الخط الملوّن على حافة البداية عند hover
 * يقول «هذا الصف تحت المؤشر» بلا إعادة تخطيط.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  caption,
  density = "comfortable"
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  caption?: string;
  /** المضغوط يقلّص الحشو الرأسي فقط — لا حجم الخط ولا مساحة النقر الأفقية. */
  density?: Density;
}) {
  const cellY = density === "compact" ? "py-2" : "py-4";
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const hide = (c: Column<T>) => (c.hideBelow === "sm" ? "hidden md:table-cell" : c.hideBelow === "xs" ? "hidden sm:table-cell" : "");

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const withKey = rows.map((row) => ({ row, v: col.sortValue!(row) }));
    withKey.sort((a, b) => (a.v < b.v ? -1 : a.v > b.v ? 1 : 0));
    if (sort.dir === "desc") withKey.reverse();
    return withKey.map((x) => x.row);
  }, [rows, sort, columns]);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  return (
    /**
     * overflow-clip لا overflow-hidden: الأخير يجعل هذه الحاوية هي حاوية التمرير
     * التي يقيس عليها رأس الجدول اللاصق، فيستقر الرأس على بُعد 56px داخل البطاقة
     * ويغطّي الصف الأول دائماً. overflow-clip يقصّ الزوايا المستديرة نفسها
     * دون إنشاء حاوية تمرير، فيبقى الرأس ملتصقاً بشريط التنقل كما هو مقصود.
     */
    <div className="panel overflow-clip">
      <table className="w-full border-collapse">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const ariaSort = active ? (sort!.dir === "asc" ? "ascending" : "descending") : c.sortValue ? "none" : undefined;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={cx(
                    "glass sticky top-14 z-sticky whitespace-nowrap border-b border-hairline px-4 py-3 text-start font-body text-caption font-semibold",
                    active ? "text-ink" : "text-ink-subtle",
                    hide(c)
                  )}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 transition-colors duration-1 hover:text-ink"
                    >
                      {c.header}
                      {active ? (
                        /* سهم واحد يدور 180° بدل سهمين متبادلين — الدوران يربط الحالتين بصرياً */
                        <ChevronDown
                          size={14}
                          strokeWidth={2}
                          aria-hidden
                          className={cx(
                            "text-brand transition-transform duration-2 ease-out",
                            sort!.dir === "asc" && "rotate-180"
                          )}
                        />
                      ) : (
                        <ChevronsUpDown size={14} strokeWidth={2} className="opacity-40" aria-hidden />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, i) => (
            <tr
              key={row.id}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              style={{ animationDelay: staggerDelay(i, 28, 12) }}
              /**
               * لا تظليل متناوب للصفوف: هو حيلة لتعويض تباعد رأسي ضيّق، ومع صفوف
               * مرتاحة وخيط فاصل واحد يصبح ضجيجاً بصرياً يزاحم شارات الحالة.
               * التظليل هنا محجوز لصف واحد: الذي تحت المؤشر.
               */
              className={cx(
                "animate-fade-in",
                onRowClick &&
                  "cursor-pointer transition-colors duration-1 hover:bg-surface-overlay focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-border-focus",
                /* الخط الملوّن محجوز مكانه دائماً (شفاف) فلا يزيح المحتوى عند hover */
                onRowClick && "hover:[&>td:first-child]:border-s-brand focus-visible:[&>td:first-child]:border-s-brand"
              )}
            >
              {columns.map((c, ci) => (
                <td
                  key={c.key}
                  className={cx(
                    "border-b border-hairline px-4 align-middle font-body text-body-sm text-ink [tr:last-child_&]:border-b-0",
                    cellY,
                    ci === 0 && "border-s-[3px] border-s-transparent transition-colors duration-1",
                    hide(c)
                  )}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
