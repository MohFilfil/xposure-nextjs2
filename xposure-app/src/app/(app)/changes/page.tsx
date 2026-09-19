"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { EmptyState, MotifSpinner } from "@/components/ui/BrandMotif";
import { Input, Select } from "@/components/ui/FormControls";
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { CHANGES } from "@/lib/data";
import type { RegChange } from "@/lib/types";
import { cx } from "@/lib/utils";

const PER_PAGE = 6;

function ChangesView() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const { statusOf } = useDecisions();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState(params.get("priority") ?? "all");
  const [agency, setAgency] = useState("all");
  const [page, setPage] = useState(1);

  const list = CHANGES.filter((c) => {
    if (status !== "all" && statusOf(c) !== status) return false;
    if (priority !== "all" && c.priority !== priority) return false;
    if (agency !== "all" && c.agency !== agency) return false;
    if (query && !`${c.title} ${c.clause} ${c.id} ${c.type}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const slice = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  function reset() {
    setQuery("");
    setStatus("all");
    setPriority("all");
    setAgency("all");
    setPage(1);
  }

  const columns: Column<RegChange>[] = [
    {
      key: "title",
      header: "التغيير",
      render: (c) => (
        <>
          <div className="font-medium text-ink">{c.title}</div>
          <div className="font-mono text-caption text-ink-muted">
            {c.clause} · {c.docTo}
          </div>
        </>
      )
    },
    { key: "type", header: "نوع التغيير", hideBelow: "sm", render: (c) => c.type },
    { key: "priority", header: "الأولوية", hideBelow: "xs", render: (c) => <PriorityBadge priority={c.priority} /> },
    { key: "status", header: "الحالة", render: (c) => <StatusBadge status={statusOf(c)} /> },
    { key: "effective", header: "تاريخ السريان", hideBelow: "sm", render: (c) => <span className="font-mono">{c.effective}</span> },
    { key: "confidence", header: "الثقة", hideBelow: "sm", render: (c) => <span className="font-mono">{c.confidence}%</span> }
  ];

  return (
    <Page>
      <PageHead
        title="التغييرات"
        lede="كل فرق جوهري بين ECC-1:2018 وECC-2:2024، مرتباً حسب الأولوية. الفروق الشكلية مستبعدة بالكود قبل وصولها للنموذج."
        action={
          <Button variant="secondary" onClick={() => toast("success", "صُدِّر الملف بصيغة OSCAL إلى مجلد التقارير الداخلي.")}>
            <Download size={20} strokeWidth={2} aria-hidden />
            تصدير OSCAL
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
        <Input
          label="بحث في التغييرات"
          type="search"
          placeholder="رقم البند، أو كلمة من العنوان"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <Select
          label="الحالة"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "كل الحالات" },
            { value: "new", label: "جديد" },
            { value: "pending", label: "معلق" },
            { value: "approved", label: "معتمد" },
            { value: "rejected", label: "مرفوض" }
          ]}
        />
        <Select
          label="الأولوية"
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "كل الأولويات" },
            { value: "critical", label: "حرج" },
            { value: "strategic", label: "استراتيجي" },
            { value: "quick", label: "إجراء سريع" },
            { value: "watch", label: "متابعة" }
          ]}
        />
        <Select
          label="الجهة"
          value={agency}
          onChange={(e) => {
            setAgency(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "كل الجهات" },
            { value: "الهيئة الوطنية للأمن السيبراني", label: "الهيئة الوطنية للأمن السيبراني" }
          ]}
        />
      </div>

      {slice.length > 0 ? (
        <div>
          <DataTable caption="قائمة التغييرات" columns={columns} rows={slice} onRowClick={(c) => router.push(`/changes/${c.id}`)} />
          <div className="flex items-center justify-between gap-4 pt-4">
            <span className="font-body text-body-sm text-ink-muted">
              عرض {(current - 1) * PER_PAGE + 1}–{(current - 1) * PER_PAGE + slice.length} من {list.length}
            </span>
            <div className="flex gap-2">
              <PageButton onClick={() => setPage(current - 1)} disabled={current === 1} label="السابق">
                <ChevronRight size={20} strokeWidth={2} aria-hidden />
              </PageButton>
              {Array.from({ length: pages }, (_, i) => (
                <PageButton key={i} onClick={() => setPage(i + 1)} active={current === i + 1}>
                  {i + 1}
                </PageButton>
              ))}
              <PageButton onClick={() => setPage(current + 1)} disabled={current === pages} label="التالي">
                <ChevronLeft size={20} strokeWidth={2} aria-hidden />
              </PageButton>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="لا نتائج مطابقة"
          description="لا يوجد تغيير يطابق شروط التصفية الحالية. وسّع نطاق البحث أو أعد ضبط الفلاتر."
          action={
            <Button variant="secondary" onClick={reset}>
              إعادة ضبط الفلاتر
            </Button>
          }
        />
      )}
    </Page>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  label
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex h-8 min-w-8 items-center justify-center rounded-md border border-border font-body text-body-sm",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-transparent bg-[color-mix(in_srgb,var(--brand)_55%,var(--surface))] font-bold text-ink"
          : "bg-surface text-ink-muted hover:enabled:bg-surface-overlay hover:enabled:text-ink"
      )}
    >
      {children}
    </button>
  );
}

/**
 * useSearchParams يفرض تصيير هذه الصفحة على العميل، فتُعرض قشرة الصفحة أثناء الانتظار
 * بدل شاشة فارغة — العنوان والنص التمهيدي يظهران فوراً من الخادم.
 */
export default function ChangesPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <PageHead
            title="التغييرات"
            lede="كل فرق جوهري بين ECC-1:2018 وECC-2:2024، مرتباً حسب الأولوية. الفروق الشكلية مستبعدة بالكود قبل وصولها للنموذج."
          />
          <div className="flex items-center justify-center py-12">
            <MotifSpinner className="h-12 w-12" />
          </div>
        </Page>
      }
    >
      <ChangesView />
    </Suspense>
  );
}
