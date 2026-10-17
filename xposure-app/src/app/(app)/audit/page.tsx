"use client";

import { useState } from "react";
import { Download, ShieldCheck } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/FormControls";
import { EmptyState } from "@/components/ui/BrandMotif";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { AUDIT } from "@/lib/data";

export default function AuditPage() {
  const toast = useToast();
  const { auditExtra } = useDecisions();
  const { can } = useSession();
  const all = [...AUDIT, ...auditExtra];
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  const rows = query ? all.filter((e) => `${e.what} ${e.who}`.toLowerCase().includes(query.toLowerCase())) : all;

  function exportLog() {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast("success", "صُدِّر سجل التدقيق إلى مجلد التقارير الداخلي.");
    }, 900);
  }

  return (
    <Page>
      <PageHead
        title="سجل التدقيق"
        eyebrow={
          <>
            <Eyebrow tone="live">{all.length} قيداً — غير قابل للتعديل</Eyebrow>
            <Eyebrow>يشمل اسم النموذج وإصداره</Eyebrow>
          </>
        }
        lede="من فعل ماذا ومتى، مع اسم النموذج وإصداره والتعليمات المستخدمة. السجل غير قابل للتعديل أو الحذف."
        action={
          can("export") ? (
            <Button variant="secondary" loading={exporting} onClick={exportLog}>
              {!exporting && <Download size={20} strokeWidth={2} aria-hidden />}
              تصدير السجل
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-end gap-4">
        <Input
          label="بحث في السجل"
          type="search"
          placeholder="اسم المستخدم، أو كلمة من وصف الإجراء"
          className="max-w-[420px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="flex items-center gap-2 pb-3 font-body text-body-sm text-ink-muted">
          <ShieldCheck size={18} strokeWidth={2} className="text-success" aria-hidden />
          كل قيد موقّع ومرتبط بهوية المستخدم
        </span>
      </div>

      {rows.length > 0 ? (
        <Card>
          {/**
           * خط زمني لا جدول: السجل يُقرأ كتسلسل أحداث، والخط الرأسي مع نقطة كل قيد
           * يجعل الترتيب الزمني مقروءاً قبل قراءة أي طابع زمني.
           */}
          <ol className="relative flex flex-col">
            {/* الخط يتلاشى عند طرفيه: السجل مستمر قبل أول قيد وبعد آخره، ولا يبدأ وينتهي هنا */}
            <span
              aria-hidden
              className="absolute bottom-3 top-3 w-px"
              style={{
                insetInlineStart: "7px",
                background: "linear-gradient(to bottom, transparent, var(--ink-subtle) 12%, var(--ink-subtle) 88%, transparent)"
              }}
            />
            {rows.map((entry, i) => (
              <Reveal as="li" key={`${entry.time}-${i}`} index={i} className="relative ps-8">
                <span
                  aria-hidden
                  className="absolute top-[18px] h-[15px] w-[15px] rounded-full border-2 border-surface-raised bg-brand"
                  style={{ insetInlineStart: 0 }}
                />
                <span className="grid gap-2 border-b border-hairline py-3 md:grid-cols-[148px_1fr] md:gap-4">
                  <span className="font-mono text-body-sm text-ink-muted">{entry.time}</span>
                  <span>
                    <span className="block font-body text-body-sm text-ink">{entry.what}</span>
                    <span className="block font-body text-caption text-ink-muted">{entry.who}</span>
                  </span>
                </span>
              </Reveal>
            ))}
          </ol>
        </Card>
      ) : (
        <EmptyState title="لا نتائج مطابقة" description="لا يوجد سجل يطابق كلمة البحث الحالية." />
      )}
    </Page>
  );
}
