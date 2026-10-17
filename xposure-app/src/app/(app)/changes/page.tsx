"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, ChevronLeft, ChevronRight, Download, List, SlidersHorizontal, X } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { EmptyState } from "@/components/ui/BrandMotif";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Input, Select } from "@/components/ui/FormControls";
import { DensityToggle, useDensity } from "@/components/ui/DensityToggle";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { CHANGES } from "@/lib/data";
import type { Priority, RegChange, Status } from "@/lib/types";
import { PRIORITY_LABEL, PRIORITY_RANK, STATUS_LABEL } from "@/lib/vocab";
import { cx, daysUntil } from "@/lib/utils";

type ViewMode = "list" | "waves";

const PER_PAGE = 6;

const LEDE =
  "كل فرق جوهري بين ECC-1:2018 وECC-2:2024، مرتباً حسب الأولوية. الفروق الشكلية مستبعدة بالكود قبل وصولها للنموذج.";

function ChangesView() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const { statusOf } = useDecisions();
  const { can } = useSession();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState(params.get("priority") ?? "all");
  const [agency, setAgency] = useState("all");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const { density, setDensity } = useDensity();
  /**
   * عنقود في خريطة المواعيد يفتح هذه الشاشة على موجته — فيصل الرسم بالعمل.
   * القيمة تُنسخ إلى حالة محلية لا تُقرأ من الرابط مباشرة، وإلا تعذّر مسحها:
   * فلترٌ لا يملك المستخدم إزالته يجعله يقرأ نتيجة مجتزأة على أنها كل البيانات.
   */
  const [wave, setWave] = useState<string | null>(params.get("wave"));
  const [view, setView] = useState<ViewMode>(wave ? "waves" : "list");

  const list = CHANGES.filter((c) => {
    if (status !== "all" && statusOf(c) !== status) return false;
    if (priority !== "all" && c.priority !== priority) return false;
    if (agency !== "all" && c.agency !== agency) return false;
    if (wave && c.effective !== wave) return false;
    if (query && !`${c.title} ${c.clause} ${c.id} ${c.type}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  /**
   * الموجات: التغييرات مجمّعة بتاريخ السريان ومرتّبة بالأقرب. خريطة المواعيد في
   * لوحة التحكم تكشف أن التواريخ متكدّسة لا موزّعة؛ وهذا العرض هو المكان الذي
   * يُعمل فيه بتلك المعرفة — موجة موجة، لا صفاً صفاً.
   */
  const waves = Array.from(new Set(list.map((c) => c.effective)))
    .sort()
    .map((date) => {
      const items = list.filter((c) => c.effective === date);
      return {
        date,
        items,
        days: daysUntil(date),
        open: items.filter((c) => ["new", "pending"].includes(statusOf(c))).length
      };
    });

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const slice = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  function reset() {
    setQuery("");
    setStatus("all");
    setPriority("all");
    setAgency("all");
    setWave(null);
    setPage(1);
  }

  /** التصدير يستغرق وقتاً فعلياً عند الربط — الزر يقول ذلك بدل أن يبدو بلا استجابة. */
  function exportOscal() {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast("success", "صُدِّر الملف بصيغة OSCAL إلى مجلد التقارير الداخلي.");
    }, 900);
  }

  /** الفلاتر المفعّلة كوسوم قابلة للإزالة فرادى — مصدرها الحالة نفسها لا نسخة منها. */
  const activeFilters = [
    query && { key: "q", field: "بحث", label: query, clear: () => setQuery("") },
    status !== "all" && { key: "s", field: "الحالة", label: STATUS_LABEL[status as Status], clear: () => setStatus("all") },
    priority !== "all" && {
      key: "p",
      field: "الأولوية",
      label: PRIORITY_LABEL[priority as Priority],
      clear: () => setPriority("all")
    },
    agency !== "all" && { key: "a", field: "الجهة", label: agency, clear: () => setAgency("all") },
    wave && { key: "w", field: "موجة السريان", label: wave, clear: () => setWave(null) }
  ].filter(Boolean) as Array<{ key: string; field: string; label: string; clear: () => void }>;

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
    {
      key: "priority",
      header: "الأولوية",
      hideBelow: "xs",
      render: (c) => <PriorityBadge priority={c.priority} />,
      sortValue: (c) => PRIORITY_RANK[c.priority]
    },
    { key: "status", header: "الحالة", render: (c) => <StatusBadge status={statusOf(c)} /> },
    {
      key: "effective",
      header: "تاريخ السريان",
      hideBelow: "sm",
      render: (c) => <span className="font-mono">{c.effective}</span>,
      sortValue: (c) => c.effective
    },
    {
      key: "confidence",
      header: "الثقة",
      hideBelow: "sm",
      render: (c) => (
        <span className="flex items-center gap-2">
          <span className="font-mono">{c.confidence}%</span>
          {/* شريط مصغّر بجانب الرقم: يجعل مقارنة الثقة بين الصفوف ممكنة بلا قراءة كل رقم */}
          <span className="hidden h-1 w-10 overflow-hidden rounded-full bg-surface-sunken lg:block" aria-hidden>
            <span
              className="block h-full rounded-full"
              style={{
                width: `${c.confidence}%`,
                background: c.confidence >= 95 ? "var(--success)" : c.confidence >= 70 ? "var(--warning)" : "var(--danger)"
              }}
            />
          </span>
        </span>
      ),
      sortValue: (c) => c.confidence
    }
  ];

  const isFiltered = query !== "" || status !== "all" || priority !== "all" || agency !== "all" || wave !== null;

  return (
    <Page>
      <PageHead
        title="التغييرات"
        eyebrow={
          <>
            <Eyebrow>{CHANGES.length} تغييراً جوهرياً</Eyebrow>
            <Eyebrow>ECC-1:2018 ← ECC-2:2024</Eyebrow>
          </>
        }
        lede={LEDE}
        action={
          can("export") ? (
            <Button variant="secondary" loading={exporting} onClick={exportOscal}>
              {!exporting && <Download size={20} strokeWidth={2} aria-hidden />}
              تصدير OSCAL
            </Button>
          ) : undefined
        }
      />

      <Reveal className="rounded-lg border border-border bg-surface-raised p-5 shadow-card print:hidden">
        <div className="mb-4 flex items-center gap-2 font-body text-body-sm font-bold text-ink">
          <SlidersHorizontal size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />
          تصفية النتائج
        </div>
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

        {isFiltered && (
          <div className="mt-4 flex animate-fade-in flex-wrap items-center gap-3 border-t border-hairline pt-4">
            {/**
             * كل فلتر مفعّل يظهر كوسم يُزال وحده. القائمة المنسدلة تقول «ماذا اخترت»
             * لكنها لا تُظهر مجموع ما هو مفعّل دفعة واحدة — ومن لا يرى فلتراً منسياً
             * يقرأ نتيجة ناقصة على أنها كل البيانات.
             */}
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={f.clear}
                /* التسمية تذكر الحقل لا القيمة وحدها: «إزالة الفلتر: 2026-12-31» لا تقول أي حقل يُزال */
                aria-label={`إزالة الفلتر: ${f.field} — ${f.label}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-overlay py-1 pe-2 ps-3 font-body text-caption text-ink transition-colors duration-1 hover:border-danger"
              >
                <span className="text-ink-muted">{f.field}:</span>
                {f.label}
                <X size={14} strokeWidth={2.5} aria-hidden className="text-ink-subtle transition-colors duration-1 group-hover:text-danger" />
              </button>
            ))}
            <button
              type="button"
              onClick={reset}
              className="font-body text-body-sm font-semibold text-brand transition-colors duration-1 hover:text-brand-hover"
            >
              مسح الكل
            </button>
          </div>
        )}
      </Reveal>

      <div className="-mb-4 flex flex-wrap items-center justify-between gap-3">
        {/**
         * الإعلان الحيّ إلزامي: تغيير فلتر يعيد بناء الجدول بلا صوت، فمن يستخدم قارئ
         * شاشة لا يعرف أن عدد النتائج تغيّر ما لم يُقَل له.
         */}
        <span aria-live="polite" className="font-body text-body-sm text-ink-muted">
          <span className="font-bold text-ink">{list.length}</span> تغييراً{" "}
          {isFiltered ? `مطابقاً من أصل ${CHANGES.length}` : "مرصوداً"}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <DensityToggle value={density} onChange={setDensity} />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="لا نتائج مطابقة"
          description="لا يوجد تغيير يطابق شروط التصفية الحالية. وسّع نطاق البحث أو أعد ضبط الفلاتر."
          action={
            <Button variant="secondary" onClick={reset}>
              إعادة ضبط الفلاتر
            </Button>
          }
        />
      ) : view === "waves" ? (
        <div className="flex flex-col gap-8">
          {waves.map((w, i) => (
            <Reveal key={w.date} index={i} as="section" className="flex flex-col gap-4">
              <WaveHead date={w.date} days={w.days} count={w.items.length} open={w.open} />
              <DataTable
                caption={`تغييرات تستحق في ${w.date}`}
                columns={columns}
                rows={w.items}
                density={density}
                onRowClick={(c) => router.push(`/changes/${c.id}`)}
              />
            </Reveal>
          ))}
        </div>
      ) : slice.length > 0 ? (
        <div>
          <DataTable
            caption="قائمة التغييرات"
            columns={columns}
            rows={slice}
            density={density}
            onRowClick={(c) => router.push(`/changes/${c.id}`)}
          />
          <div className="flex items-center justify-between gap-4 pt-4 print:hidden">
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

/**
 * مبدّل العرض. القائمة تُرتَّب وتُصفَّح بالأعمدة؛ والموجات تُجمّع بتاريخ السريان.
 * وجود العرضين معاً مقصود: الترتيب بالثقة أو بالأولوية عمل تحليلي يحتاج قائمة
 * مسطّحة، وإنجاز ما يستحق في تاريخ واحد عمل تنفيذي يحتاج تجميعاً.
 */
function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  const options: Array<{ value: ViewMode; label: string; icon: typeof List }> = [
    { value: "list", label: "قائمة", icon: List },
    { value: "waves", label: "موجات", icon: CalendarClock }
  ];
  return (
    <div
      role="group"
      aria-label="طريقة عرض التغييرات"
      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface p-1 print:hidden"
    >
      {options.map((o) => {
        const Icon = o.icon;
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            title={`عرض ${o.label}`}
            className={cx(
              "flex items-center gap-1.5 rounded-sm px-2 py-1 font-body text-caption transition-colors duration-2 ease-out",
              active ? "bg-surface-overlay font-semibold text-ink" : "text-ink-muted hover:text-ink"
            )}
          >
            <Icon size={16} strokeWidth={2} aria-hidden />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * ترويسة الموجة. الرقم الذي يهمّ ليس عدد البنود بل كم منها ما زال بلا قرار —
 * فموجة من سبعة بُتّ في كلها ليست عملاً متبقياً مهما كبر عددها.
 */
function WaveHead({ date, days, count, open }: { date: string; days: number; count: number; open: number }) {
  const urgent = days <= 120;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="rule h-8 w-[3px] shrink-0" aria-hidden />
        <div>
          <h2 className="num font-mono text-h2 text-ink" dir="ltr">
            {date}
          </h2>
          <p className="mt-0.5 font-body text-body-sm text-ink-muted">
            {days < 0 ? (
              <span className="text-danger">مرّ على السريان {Math.abs(days)} يوماً</span>
            ) : (
              <span className={urgent ? "text-warning" : undefined}>بعد {days} يوماً</span>
            )}
          </p>
        </div>
      </div>
      <p className="font-body text-body-sm text-ink-muted">
        <span className="num font-mono text-ink">{count}</span> بنداً ·{" "}
        {open > 0 ? (
          <>
            <span className="num font-mono font-bold text-ink">{open}</span> بانتظار قرار
          </>
        ) : (
          <span className="text-success">بُتَّ في كل بنودها</span>
        )}
      </p>
    </div>
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
        "transition-[background-color,color,transform] duration-2 ease-out active:enabled:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-transparent bg-[color-mix(in_srgb,var(--brand)_55%,var(--surface))] font-bold text-ink shadow-glow"
          : "bg-surface text-ink-muted hover:enabled:bg-surface-overlay hover:enabled:text-ink"
      )}
    >
      {children}
    </button>
  );
}

/**
 * useSearchParams يفرض تصيير هذه الصفحة على العميل، فتُعرض قشرة الصفحة أثناء الانتظار
 * بدل شاشة فارغة — العنوان والنص التمهيدي يظهران فوراً من الخادم، والهيكل يحجز
 * مقاس الجدول القادم فلا تقفز الصفحة عند وصوله.
 */
export default function ChangesPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <PageHead title="التغييرات" lede={LEDE} />
          <SkeletonTable rows={6} />
        </Page>
      }
    >
      <ChangesView />
    </Suspense>
  );
}
