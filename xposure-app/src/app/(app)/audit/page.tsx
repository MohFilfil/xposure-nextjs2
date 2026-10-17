"use client";

import { useState } from "react";
import { Download, FileLock2, ListChecks, ShieldCheck, UserSearch } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card, CardHead } from "@/components/ui/Card";
import { Num } from "@/components/ui/Bidi";
import { Input } from "@/components/ui/FormControls";
import { EmptyState } from "@/components/ui/BrandMotif";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { useContent } from "@/lib/content";

export default function AuditPage() {
  const toast = useToast();
  const { auditExtra } = useDecisions();
  const { can } = useSession();
  const t = useT();
  const { audit } = useContent();
  const all = [...audit, ...auditExtra];
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  const rows = query ? all.filter((e) => `${e.what} ${e.who}`.toLowerCase().includes(query.toLowerCase())) : all;

  function exportLog() {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast("success", t.audit.exported);
    }, 900);
  }

  return (
    <Page>
      <PageHead
        title={t.audit.title}
        eyebrow={
          <>
            <Eyebrow tone="live">
              <Num>{all.length}</Num> {t.audit.immutableCount}
            </Eyebrow>
            <Eyebrow>{t.audit.includesModel}</Eyebrow>
          </>
        }
        lede={t.audit.lede}
        action={
          can("export") ? (
            <Button variant="secondary" loading={exporting} onClick={exportLog}>
              {!exporting && <Download size={20} strokeWidth={2} aria-hidden />}
              {t.audit.exportLog}
            </Button>
          ) : undefined
        }
      />

      {/**
       * ثلاثة ألواح تُجيب أسئلة المدقّق قبل أن يسأل: لمن هذه الصفحة، وما الذي
       * يُسجَّل فيها، ولماذا لا تُعدَّل. السجل بلا هذا الشرح يُقرأ كقائمة أحداث؛
       * ومعه يُقرأ كأداة إثبات.
       */}
      <Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="h-full">
            <CardHead
              title={t.audit.forWhom}
              aside={<UserSearch size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />}
            />
            <p className="font-body text-body-sm text-ink">{t.audit.forWhomBody}</p>
          </Card>
          <Card className="h-full">
            <CardHead
              title={t.audit.whatIsRecorded}
              aside={<ListChecks size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />}
            />
            <p className="font-body text-body-sm text-ink">{t.audit.whatIsRecordedBody}</p>
          </Card>
          <Card className="h-full">
            <CardHead
              title={t.audit.immutability}
              aside={<FileLock2 size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />}
            />
            <p className="font-body text-body-sm text-ink">{t.audit.immutabilityBody}</p>
          </Card>
        </div>
      </Reveal>

      <div className="flex flex-wrap items-end gap-4">
        <Input
          label={t.audit.searchLabel}
          type="search"
          placeholder={t.audit.searchPlaceholder}
          className="max-w-[420px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="flex items-center gap-2 pb-3 font-body text-body-sm text-ink-muted">
          <ShieldCheck size={18} strokeWidth={2} className="text-success" aria-hidden />
          {t.audit.signed}
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
                  <Num className="num font-mono text-body-sm text-ink-muted">{entry.time}</Num>
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
        <EmptyState title={t.common.noResults} description={t.audit.noMatch} />
      )}
    </Page>
  );
}
