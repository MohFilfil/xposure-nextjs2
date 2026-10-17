"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Keyboard, ShieldCheck } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { useRoleCopy } from "@/lib/content";
import { homeFor } from "@/lib/roles";

/**
 * دليل قصير لا وثيقة. الفرق بينهما أن الوثيقة تشرح النظام، وهذا يشرح يومك:
 * أربع أو خمس خطوات بترتيب تنفيذها، تخصّ دورك أنت لا كل الأدوار.
 *
 * ولأنه مرتبط بالدور، لا يحتاج القارئ أن يتخطّى ما لا يعنيه — وهذا وحده الفرق
 * بين دليل يُقرأ ودليل يُغلَق.
 */
export default function HelpPage() {
  const router = useRouter();
  const t = useT();
  const { role } = useSession();
  const roleCopy = useRoleCopy();

  const steps = role ? t.help.stepsFor[role] : t.help.stepsFor.compliance;

  return (
    <Page>
      <PageHead
        title={t.help.title}
        eyebrow={
          <>
            <Eyebrow tone="live">{role ? roleCopy.label(role) : ""}</Eyebrow>
            <Eyebrow>{t.help.dailyFlow}</Eyebrow>
          </>
        }
        lede={t.help.lede}
        action={
          <Button variant="primary" onClick={() => router.push(role ? homeFor(role) : "/dashboard")}>
            {t.help.whereToStart}
            <ArrowLeft size={18} strokeWidth={2} aria-hidden className="ltr:rotate-180" />
          </Button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Reveal>
          <Card>
            <CardHead title={t.help.dailyFlow} sub={role ? roleCopy.scope(role) : ""} />
            {/**
             * خطوات مرقّمة بخيط واصل: الدليل تسلسل تنفيذ لا قائمة نصائح، والرقم
             * الكبير يجعل العودة إليه في منتصف العمل ممكنة بلا إعادة قراءة.
             */}
            <ol className="relative flex flex-col gap-4">
              <span
                aria-hidden
                className="absolute bottom-4 top-4 w-px"
                style={{ insetInlineStart: "15px", background: "var(--hairline)" }}
              />
              {steps.map((step, i) => (
                <li key={step} className="relative flex items-start gap-3">
                  <span
                    aria-hidden
                    className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-mono text-body-sm text-ink"
                  >
                    {i + 1}
                  </span>
                  <span className="pt-1.5 font-body text-body text-ink">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </Reveal>

        <div className="flex flex-col gap-6">
          <Reveal index={0}>
            <Card>
              <CardHead
                title={t.help.rules}
                aside={<ShieldCheck size={18} strokeWidth={2} className="text-success" aria-hidden />}
              />
              <ul className="flex flex-col gap-3">
                {[t.help.rule1, t.help.rule2, t.help.rule3, t.help.rule4].map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-2 border-b border-hairline pb-3 font-body text-body-sm text-ink last:border-b-0 last:pb-0"
                  >
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                    {rule}
                  </li>
                ))}
              </ul>
              <CardFoot>{t.agent.noteIdle}</CardFoot>
            </Card>
          </Reveal>

          <Reveal index={1}>
            <Card>
              <CardHead
                title={t.help.shortcuts}
                aside={<Keyboard size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />}
              />
              <ul className="flex flex-col gap-2.5">
                <Shortcut keys={["Ctrl", "K"]} label={t.shortcuts.palette} />
                <Shortcut keys={["g", "d"]} label={t.nav.dashboard} />
                <Shortcut keys={["j"]} label={t.shortcuts.nextChange} />
                <Shortcut keys={["k"]} label={t.shortcuts.prevChange} />
                <Shortcut keys={["?"]} label={t.shortcuts.showList} />
              </ul>
              <CardFoot>{t.help.shortcutsNote}</CardFoot>
            </Card>
          </Reveal>
        </div>
      </div>
    </Page>
  );
}

function Shortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <li className="flex items-center justify-between gap-4">
      <span className="font-body text-body-sm text-ink-muted">{label}</span>
      <span className="flex shrink-0 items-center gap-1" dir="ltr">
        {keys.map((k) => (
          <kbd
            key={k}
            className="rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-caption text-ink-muted"
          >
            {k}
          </kbd>
        ))}
      </span>
    </li>
  );
}
