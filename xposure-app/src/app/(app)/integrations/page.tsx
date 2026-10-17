"use client";

import { useState } from "react";
import { Check, Download, FileJson, KeyRound, Network, Plug, ShieldQuestion } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { Num, Code } from "@/components/ui/Bidi";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { cx } from "@/lib/utils";

/**
 * الروابط والتكامل. هذه الصفحة هي جواب سؤال «هل يتكامل مع نظامنا؟» — وهو سؤال
 * لا يُجاب بنعم، بل بجدول: ما الذي يُقرأ، وما الذي يُكتب، وبأي صلاحية.
 *
 * التصدير بصيغة OSCAL انتقل إلى هنا من ترويسة صفحة التغييرات: التصدير ليس إجراء
 * مراجعة يُفعل أثناء البتّ في بند، بل قدرة تكامل يُرجع إليها عند الحاجة.
 */

type Level = "readOnly" | "writeOnApproval" | "planned";

interface Integration {
  id: string;
  icon: LucideIcon;
  title: string;
  scope: string;
  reads: string;
  writes: string;
  level: Level;
  connected: boolean;
  lastSync: string | null;
  /** الإجراء المتاح: تصدير ملف، أو اختبار اتصال، أو طلب تفعيل. */
  action: "export" | "test" | "request";
}

const LEVEL_TONE: Record<Level, string> = {
  readOnly: "text-success",
  writeOnApproval: "text-warning",
  planned: "text-ink-subtle"
};

export default function IntegrationsPage() {
  const toast = useToast();
  const t = useT();
  const { can } = useSession();
  const [busy, setBusy] = useState<string | null>(null);

  const integrations: Integration[] = [
    {
      id: "oscal",
      icon: FileJson,
      title: t.integrations.oscalTitle,
      scope: t.integrations.oscalScope,
      reads: t.integrations.oscalReads,
      writes: t.integrations.oscalWrites,
      level: "readOnly",
      connected: true,
      lastSync: "2026-09-18 05:04",
      action: "export"
    },
    {
      id: "odoo",
      icon: Plug,
      title: t.integrations.odooTitle,
      scope: t.integrations.odooScope,
      reads: t.integrations.odooReads,
      writes: t.integrations.odooWrites,
      level: "writeOnApproval",
      connected: true,
      lastSync: "2026-09-18 05:04",
      action: "test"
    },
    {
      id: "grc",
      icon: Network,
      title: t.integrations.grcConnTitle,
      scope: t.integrations.grcConnScope,
      reads: t.integrations.grcConnReads,
      writes: t.integrations.grcConnWrites,
      level: "planned",
      connected: false,
      lastSync: null,
      action: "request"
    },
    {
      id: "ldap",
      icon: KeyRound,
      title: t.integrations.ldapTitle,
      scope: t.integrations.ldapScope,
      reads: t.integrations.ldapReads,
      writes: t.integrations.ldapWrites,
      level: "readOnly",
      connected: true,
      lastSync: "2026-09-18 04:30",
      action: "test"
    }
  ];

  const live = integrations.filter((i) => i.connected).length;

  function run(item: Integration) {
    setBusy(item.id);
    setTimeout(() => {
      setBusy(null);
      if (item.action === "export") toast("success", t.integrations.exported);
      else if (item.action === "test") toast("success", t.integrations.tested);
      else toast("info", t.integrations.requested);
    }, 800);
  }

  return (
    <Page>
      <PageHead
        title={t.integrations.title}
        eyebrow={
          <>
            <Eyebrow tone="live">
              <Num>{live}</Num> / <Num>{integrations.length}</Num> {t.integrations.connected}
            </Eyebrow>
            <Eyebrow>OSCAL 1.1.2</Eyebrow>
          </>
        }
        lede={t.integrations.lede}
      />

      <Reveal>
        <Card>
          <CardHead
            title={t.integrations.grcTitle}
            aside={<ShieldQuestion size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />}
          />
          <p className="max-w-[90ch] font-body text-body text-ink">{t.integrations.grcBody}</p>
        </Card>
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-2">
        {integrations.map((item, i) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.id} index={i} className="h-full">
              <Card className="flex h-full flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-overlay text-ink-muted"
                    >
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-h3 text-ink">{item.title}</h2>
                      <p className="mt-1 font-body text-caption text-ink-muted">{item.scope}</p>
                    </div>
                  </div>

                  {/* الحالة أيقونة ونص لا شارة ملوّنة: اللون المصمت لغة الأولوية وحدها */}
                  <span
                    className={cx(
                      "flex shrink-0 items-center gap-1.5 font-body text-body-sm font-semibold",
                      item.connected ? "text-success" : "text-ink-subtle"
                    )}
                  >
                    {item.connected ? (
                      <Check size={16} strokeWidth={2.5} aria-hidden />
                    ) : (
                      <span aria-hidden className="h-[7px] w-[7px] rounded-full border-[1.5px] border-current" />
                    )}
                    {item.connected ? t.integrations.connected : t.integrations.notConnected}
                  </span>
                </div>

                <dl className="flex flex-col gap-3 border-t border-hairline pt-4">
                  <Row label={t.integrations.permissionLevel}>
                    <span className={cx("font-semibold", LEVEL_TONE[item.level])}>{t.integrations[item.level]}</span>
                  </Row>
                  <Row label={t.integrations.whatItReads}>{item.reads}</Row>
                  <Row label={t.integrations.whatItWrites}>{item.writes}</Row>
                  <Row label={t.integrations.lastSync}>
                    {item.lastSync ? <Num className="num font-mono">{item.lastSync}</Num> : t.common.none}
                  </Row>
                </dl>

                <div className="mt-auto flex items-center gap-3 border-t border-hairline pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={busy === item.id}
                    disabled={item.action === "export" ? !can("export") : !can("manageAgent")}
                    onClick={() => run(item)}
                  >
                    {busy !== item.id && item.action === "export" && (
                      <Download size={16} strokeWidth={2} aria-hidden />
                    )}
                    {item.action === "export"
                      ? t.integrations.exportNow
                      : item.action === "test"
                        ? t.integrations.testConnection
                        : t.integrations.requestConnection}
                  </Button>
                  {item.level === "writeOnApproval" && (
                    <span className="font-body text-caption text-ink-muted">{t.integrations.writeOnApproval}</span>
                  )}
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <Card>
          <CardFoot>{t.integrations.foot}</CardFoot>
        </Card>
      </Reveal>
    </Page>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline pb-3 last:border-b-0 last:pb-0">
      <dt className="shrink-0 font-body text-body-sm text-ink-muted">{label}</dt>
      <dd className="max-w-[46ch] font-body text-body-sm text-ink sm:text-end">{children}</dd>
    </div>
  );
}
