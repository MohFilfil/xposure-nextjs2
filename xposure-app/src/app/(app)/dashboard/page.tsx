"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronLeft, GitCompare, Info, ListChecks, ScanSearch, ShieldCheck } from "lucide-react";
import { Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState, MotifSpinner } from "@/components/ui/BrandMotif";
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { CHANGES, COMPANY, TASKS } from "@/lib/data";
import type { Priority, RegChange, Status } from "@/lib/types";
import { PRIORITY_LABEL, PRIORITY_VAR, STATUS_LABEL, STATUS_VAR } from "@/lib/vocab";

const SCAN_STEPS = [
  "فحص مصادر الجهات المفعّلة (1 مصدر)…",
  "مقارنة بصمة النص بآخر نسخة محفوظة…",
  "لا إصدار جديد. إعادة فحص المسودات المفتوحة…",
  "اكتمل الفحص."
];

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { statusOf } = useDecisions();
  const [scanStep, setScanStep] = useState<number | null>(null);

  function runScan() {
    setScanStep(0);
    const tick = (i: number) => {
      if (i < SCAN_STEPS.length) {
        setScanStep(i);
        setTimeout(() => tick(i + 1), 750);
      } else {
        setScanStep(null);
        toast("success", "اكتمل الفحص في 3.1 ثانية. لا إصدارات جديدة منذ رصد ECC-2:2024.");
      }
    };
    tick(0);
  }

  const total = CHANGES.length;
  const critical = CHANGES.filter((c) => c.priority === "critical").length;
  const doneTasks = TASKS.filter((t) => t.status === "approved").length;

  const byPriority = (p: Priority) => CHANGES.filter((c) => c.priority === p).length;
  const byStatus = (s: Status) => CHANGES.filter((c) => statusOf(c) === s).length;

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
    { key: "priority", header: "الأولوية", hideBelow: "xs", render: (c) => <PriorityBadge priority={c.priority} /> },
    { key: "status", header: "الحالة", render: (c) => <StatusBadge status={statusOf(c)} /> },
    { key: "effective", header: "تاريخ السريان", hideBelow: "sm", render: (c) => <span className="font-mono">{c.effective}</span> }
  ];

  return (
    <Page>
      {scanStep !== null && (
        <div className="fixed inset-0 z-overlay flex flex-col items-center justify-center gap-5 bg-[color-mix(in_srgb,var(--surface)_88%,transparent)]" role="status">
          <MotifSpinner className="h-16 w-16" />
          <p className="font-display text-h2 text-ink">جارٍ فحص المصادر</p>
          <div className="flex flex-col items-center gap-2 font-body text-body-sm text-ink-muted">
            {SCAN_STEPS.slice(0, scanStep + 1).map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <PageHead
        title="لوحة التحكم"
        lede={`${COMPANY} — مصدر تنظيمي واحد مفعّل، ومقارنة كاملة بين ECC-1:2018 وECC-2:2024.`}
        action={
          <Button variant="primary" onClick={runScan}>
            <ScanSearch size={20} strokeWidth={2} aria-hidden />
            افحص الآن
          </Button>
        }
      />

      <div className="flex items-center gap-3 rounded-lg border border-border border-s-[3px] border-s-info bg-surface-raised px-5 py-4 font-body text-body-sm text-ink-muted">
        <Info size={20} strokeWidth={2} className="shrink-0 text-info" aria-hidden />
        <span>آخر فحص: 2026-09-18 الساعة 05:00 — لا إصدارات جديدة. آخر رصد فعلي كان 2026-09-17 (ECC-2:2024).</span>
      </div>

      {/* أربع بطاقات كحد أقصى — أي مؤشر خامس ينتقل لصفحة تحليلات */}
      <div className="grid gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي التغييرات الجوهرية"
          value={total}
          context="من أصل 47 فرقاً مرصوداً؛ 35 فرقاً شكلياً استُبعد بالكود"
          icon={GitCompare}
        />
        <StatCard label="قضايا حرجة" value={critical} context="تحتاج قراراً قبل 2026-12-31" icon={AlertTriangle} tone="danger" alert />
        <StatCard
          label="المهام المنجزة"
          value={`${doneTasks} / ${TASKS.length}`}
          context="آخر إنجاز: تعميم المصادقة — الدفعة الأولى"
          icon={ListChecks}
        />
        <StatCard label="درجة الامتثال" value="78%" context="ارتفعت 6 نقاط بعد اعتماد قرارين" icon={ShieldCheck} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHead title="الأثر × الاستعجال" aside={<span className="font-body text-body-sm text-ink-muted">{total} تغييراً</span>} />
          <div className="grid grid-cols-[76px_1fr_1fr] gap-2">
            <span />
            <span className="pb-2 text-center font-body text-caption text-ink-muted">أثر مرتفع</span>
            <span className="pb-2 text-center font-body text-caption text-ink-muted">أثر منخفض</span>

            <span className="flex items-center font-body text-caption text-ink-muted">عاجل</span>
            <MatrixCell priority="critical" count={byPriority("critical")} note="حرج — تنفيذ فوري" />
            <MatrixCell priority="quick" count={byPriority("quick")} note="إجراء سريع" />

            <span className="flex items-center font-body text-caption text-ink-muted">غير عاجل</span>
            <MatrixCell priority="strategic" count={byPriority("strategic")} note="استراتيجي — تخطيط مبكر" />
            <MatrixCell priority="watch" count={byPriority("watch")} note="متابعة" />
          </div>
          <CardFoot>اضغط على أي خانة لعرض تغييراتها.</CardFoot>
        </Card>

        <Card>
          <CardHead title="حالة المراجعة البشرية" />
          {(["new", "pending", "approved", "rejected"] as Status[]).map((s) => (
            <div key={s} className="mb-3 flex items-center gap-3">
              <span className="w-[76px] shrink-0">
                <StatusBadge status={s} />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-overlay">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${Math.round((byStatus(s) / total) * 100)}%`, background: STATUS_VAR[s] }}
                />
              </span>
              <span className="font-mono text-body-sm text-ink-muted">{byStatus(s)}</span>
              <span className="sr-only">{STATUS_LABEL[s]}</span>
            </div>
          ))}
          <CardFoot>لا يُستبعد أي تغيير تلقائياً. تصنيف «لا ينطبق» يحتاج موافقة المختص.</CardFoot>
        </Card>
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-h2 text-ink">أحدث التغييرات</h2>
          <Button variant="secondary" size="sm" onClick={() => router.push("/changes")}>
            عرض الكل
            <ChevronLeft size={20} strokeWidth={2} aria-hidden />
          </Button>
        </div>

        {CHANGES.length > 0 ? (
          <DataTable
            caption="أحدث خمسة تغييرات مرصودة"
            columns={columns}
            rows={CHANGES.slice(0, 5)}
            onRowClick={(c) => router.push(`/changes/${c.id}`)}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
            <EmptyState
              title="لا تغييرات مرصودة بعد"
              description="شغّل فحصاً للمصادر المفعّلة لبدء رصد الإصدارات الجديدة والمسودات."
              action={
                <Button variant="secondary" onClick={runScan}>
                  افحص الآن
                </Button>
              }
            />
          </div>
        )}
      </section>
    </Page>
  );
}

function MatrixCell({ priority, count, note }: { priority: Priority; count: number; note: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/changes?priority=${priority}`)}
      aria-label={`${PRIORITY_LABEL[priority]}: ${count} تغييراً`}
      className="flex min-h-[112px] flex-col justify-between gap-2 rounded-lg border border-border bg-surface p-4 text-start transition-colors duration-150 hover:bg-surface-overlay"
    >
      <span className="h-[3px] rounded-full" style={{ background: PRIORITY_VAR[priority] }} aria-hidden />
      <span>
        <span className="block font-display text-display-sm text-ink">{count}</span>
        <span className="block font-body text-body-sm text-ink-muted">{note}</span>
      </span>
    </button>
  );
}
