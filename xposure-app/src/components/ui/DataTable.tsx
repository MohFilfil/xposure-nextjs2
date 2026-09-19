"use client";

import { cx } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  /** يُخفى أولاً على الشاشات الصغيرة بدل تصغير الخط. */
  hideBelow?: "sm" | "xs";
  render: (row: T) => React.ReactNode;
}

/**
 * الجدول الموحّد لكل قائمة بيانات: التغييرات، المهام، سجل التدقيق.
 * رأس الجدول دائماً ink-muted بحجم caption بلا خلفية مميزة.
 * عمود الأولوية قبل عمود الحالة. hover يكسو الصف كاملاً إذا كان قابلاً للنقر فقط.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  caption
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  caption?: string;
}) {
  const hide = (c: Column<T>) => (c.hideBelow === "sm" ? "hidden md:table-cell" : c.hideBelow === "xs" ? "hidden sm:table-cell" : "");

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
      <table className="w-full border-collapse">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cx(
                  "whitespace-nowrap border-b border-border px-4 py-3 text-start font-body text-caption text-ink-muted",
                  hide(c)
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
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
              className={cx(
                "[&:nth-child(even)]:bg-[color-mix(in_srgb,var(--surface)_45%,transparent)]",
                onRowClick &&
                  "cursor-pointer transition-colors duration-150 hover:bg-surface-overlay focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-border-focus"
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cx(
                    "border-b border-[color-mix(in_srgb,var(--border)_60%,transparent)] px-4 py-3 align-middle font-body text-body-sm text-ink",
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
