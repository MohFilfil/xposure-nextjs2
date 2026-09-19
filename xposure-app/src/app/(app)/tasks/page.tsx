"use client";

import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { TASKS } from "@/lib/data";
import type { Task } from "@/lib/types";
import { dueState } from "@/lib/utils";

const TONE = { danger: "text-danger", warning: "text-warning", success: "text-success" } as const;

export default function TasksPage() {
  const router = useRouter();
  const toast = useToast();
  const { extraTasks } = useDecisions();
  const rows = [...TASKS, ...extraTasks];

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
      }
    },
    { key: "priority", header: "الأولوية", hideBelow: "xs", render: (t) => <PriorityBadge priority={t.priority} /> },
    { key: "status", header: "الحالة", render: (t) => <StatusBadge status={t.status} /> }
  ];

  return (
    <Page>
      <PageHead
        title="المهام"
        lede="كل مهمة هنا نشأت بعد اعتماد صريح من المختص، ومرتبطة بالتغيير الذي تسبب بها. الوكيل لا يُغلق مهمة ولا يعتبر متطلباً مستوفى."
        action={
          <Button variant="secondary" onClick={() => toast("info", "يفتح نظام المهام في تبويب منفصل — نموذج عرض، بلا ربط فعلي.")}>
            <ExternalLink size={20} strokeWidth={2} aria-hidden />
            فتح في Odoo
          </Button>
        }
      />
      <DataTable caption="قائمة المهام" columns={columns} rows={rows} onRowClick={(t) => router.push(`/changes/${t.change}`)} />
    </Page>
  );
}
