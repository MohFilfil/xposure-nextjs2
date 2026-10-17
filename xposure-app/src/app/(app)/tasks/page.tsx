"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlarmClock, CircleCheck, ExternalLink, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { MetricBar, StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { EmptyState } from "@/components/ui/BrandMotif";
import { Input, Select } from "@/components/ui/FormControls";
import { DensityToggle, useDensity } from "@/components/ui/DensityToggle";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { TASKS } from "@/lib/data";
import type { Task } from "@/lib/types";
import { daysUntil, dueState } from "@/lib/utils";
import { PRIORITY_RANK } from "@/lib/vocab";

const TONE = { danger: "text-danger", warning: "text-warning", success: "text-success" } as const;

export default function TasksPage() {
  const router = useRouter();
  const toast = useToast();
  const { extraTasks } = useDecisions();
  const { role, account } = useSession();
  /**
   * مالك العملية يرى مهامه وحده: طابور المنشأة كاملاً ليس عمله، وعرضه عليه
   * يدفن ما يخصّه بين ما يخصّ غيره.
   */
  const scoped = role === "owner" && account;
  const all = scoped ? [...TASKS, ...extraTasks].filter((t) => t.owner === account.name) : [...TASKS, ...extraTasks];

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const { density, setDensity } = useDensity();

  const rows = all.filter((t) => {
    if (status !== "all" && t.status !== status) return false;
    if (priority !== "all" && t.priority !== priority) return false;
    if (query && !`${t.title} ${t.id} ${t.change} ${t.owner}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const open = all.filter((t) => t.status !== "approved");
  const overdue = open.filter((t) => daysUntil(t.due) < 0).length;
  const soon = open.filter((t) => daysUntil(t.due) >= 0 && daysUntil(t.due) <= 45).length;
  const done = all.length - open.length;

  const isFiltered = query !== "" || status !== "all" || priority !== "all";
  function reset() {
    setQuery("");
    setStatus("all");
    setPriority("all");
  }

  const columns: Column<Task>[] = [
    {
      key: "title",
      header: "المهمة",
      render: (t) => (
        <>
          <div className="font-medium text-ink">{t.title}</div>
          <div className="font-mono text-caption text-ink-muted">
            {t.id} · {t.change}
          </div>
        </>
      )
    },
    { key: "owner", header: "المُسند إليه", hideBelow: "sm", render: (t) => t.owner },
    {
      key: "due",
      header: "تاريخ الاستحقاق",
      // اللون مقروناً بنص دائماً — لا يُعتمد على اللون وحده
      render: (t) => {
        const { tone, label } = dueState(t.due);
        return (
          <>
            <span className="font-mono">{t.due}</span>
            <div className={`text-caption ${TONE[tone]}`}>{label}</div>
          </>
        );
      },
      sortValue: (t) => t.due
    },
    {
      key: "priority",
      header: "الأولوية",
      hideBelow: "xs",
      render: (t) => <PriorityBadge priority={t.priority} />,
      sortValue: (t) => PRIORITY_RANK[t.priority]
    },
    { key: "status", header: "الحالة", render: (t) => <StatusBadge status={t.status} /> }
  ];

  return (
    <Page>
      <PageHead
        title="المهام"
        eyebrow={
          <>
            <Eyebrow>{open.length} مهمة مفتوحة من {all.length}</Eyebrow>
            {scoped && <Eyebrow>مهامي وحدها — {account.name}</Eyebrow>}
            <Eyebrow>مزامنة Odoo — عرض توضيحي</Eyebrow>
          </>
        }
        lede="كل مهمة هنا نشأت بعد اعتماد صريح من المختص، ومرتبطة بالتغيير الذي تسبب بها. الوكيل لا يُغلق مهمة ولا يعتبر متطلباً مستوفى."
        action={
          <Button variant="secondary" onClick={() => toast("info", "يفتح نظام المهام في تبويب منفصل — نموذج عرض، بلا ربط فعلي.")}>
            <ExternalLink size={20} strokeWidth={2} aria-hidden />
            فتح في Odoo
          </Button>
        }
      />

      {/* ثلاث خانات تجيب عن «ما الذي يحترق الآن؟» قبل النزول إلى الجدول — بلغة شريط المؤشرات نفسها */}
      <Reveal>
        <MetricBar>
          <StatCard
            label="متأخرة"
            value={overdue}
            context="تجاوزت موعدها المقترح ولم تُغلق بعد"
            icon={TriangleAlert}
            tone={overdue > 0 ? "danger" : undefined}
            alert={overdue > 0}
          />
          <StatCard
            label="تستحق خلال 45 يوماً"
            value={soon}
            context="تحتاج جدولة ضمن هذا الشهر"
            icon={AlarmClock}
          />
          <StatCard
            label="منجزة"
            value={done}
            context="أُغلقت باعتماد المختص، لا بقرار الوكيل"
            icon={CircleCheck}
            tone="success"
          />
        </MetricBar>
      </Reveal>

      <Reveal className="rounded-lg border border-border bg-surface-raised p-5 shadow-card print:hidden">
        <div className="mb-4 flex items-center gap-2 font-body text-body-sm font-bold text-ink">
          <SlidersHorizontal size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />
          تصفية المهام
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="بحث في المهام"
            type="search"
            placeholder="عنوان المهمة، أو المُسند إليه"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            label="الحالة"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: "all", label: "كل الأولويات" },
              { value: "critical", label: "حرج" },
              { value: "strategic", label: "استراتيجي" },
              { value: "quick", label: "إجراء سريع" },
              { value: "watch", label: "متابعة" }
            ]}
          />
        </div>

        {isFiltered && (
          /* العدد يُعلن مرة واحدة فوق الجدول لا هنا أيضاً — تكراره يجعل قارئ الشاشة ينطقه مرتين */
          <div className="mt-4 flex animate-fade-in items-center justify-end gap-4 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={reset}
              className="font-body text-body-sm font-semibold text-brand transition-colors duration-1 hover:text-brand-hover"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </Reveal>

      <div className="-mb-4 flex flex-wrap items-center justify-between gap-3">
        <span aria-live="polite" className="font-body text-body-sm text-ink-muted">
          <span className="font-bold text-ink">{rows.length}</span> مهمة{" "}
          {isFiltered ? `مطابقة من أصل ${all.length}` : "في القائمة"}
        </span>
        <DensityToggle value={density} onChange={setDensity} />
      </div>

      {rows.length > 0 ? (
        <DataTable
          caption="قائمة المهام"
          columns={columns}
          rows={rows}
          density={density}
          onRowClick={(t) => router.push(`/changes/${t.change}`)}
        />
      ) : (
        <EmptyState
          title="لا نتائج مطابقة"
          description="لا توجد مهمة تطابق شروط التصفية الحالية. وسّع نطاق البحث أو أعد ضبط الفلاتر."
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
