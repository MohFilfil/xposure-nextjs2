"use client";

import { Download } from "lucide-react";
import { Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { AUDIT } from "@/lib/data";

export default function AuditPage() {
  const toast = useToast();
  const { auditExtra } = useDecisions();
  const rows = [...AUDIT, ...auditExtra];

  return (
    <Page>
      <PageHead
        title="سجل التدقيق"
        lede="من فعل ماذا ومتى، مع اسم النموذج وإصداره والتعليمات المستخدمة. السجل غير قابل للتعديل أو الحذف."
        action={
          <Button variant="secondary" onClick={() => toast("success", "صُدِّر سجل التدقيق إلى مجلد التقارير الداخلي.")}>
            <Download size={20} strokeWidth={2} aria-hidden />
            تصدير السجل
          </Button>
        }
      />
      <Card>
        <ol className="flex flex-col">
          {rows.map((entry, i) => (
            <li
              key={`${entry.time}-${i}`}
              className="grid gap-4 border-b border-[color-mix(in_srgb,var(--border)_60%,transparent)] py-3 last:border-b-0 md:grid-cols-[148px_1fr]"
            >
              <span className="font-mono text-body-sm text-ink-muted">{entry.time}</span>
              <span>
                <span className="block font-body text-body-sm text-ink">{entry.what}</span>
                <span className="block font-body text-caption text-ink-muted">{entry.who}</span>
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </Page>
  );
}
