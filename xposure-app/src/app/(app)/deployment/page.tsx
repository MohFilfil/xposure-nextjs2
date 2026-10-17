"use client";

import { Building2, Cloud, Network, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { Num } from "@/components/ui/Bidi";
import { Reveal } from "@/components/motion/Reveal";
import { useT } from "@/components/I18nProvider";

/**
 * خيارات النشر — لا «الاشتراك». الفرق بين الخيارات هنا حدود الشبكة ومالك العتاد،
 * لا قائمة مزايا تتدرّج بالسعر: المنتج واحد في الثلاثة.
 *
 * لا أسعار في هذه الصفحة ولا مسار دفع. من يسأل «كم؟» يسأل بعد أن يعرف «أين؟»،
 * وهذه الصفحة تجيب الثاني وحده.
 */
export default function DeploymentPage() {
  const t = useT();

  const options: Array<{ icon: LucideIcon; title: string; body: string; points: string[]; primary?: boolean }> = [
    {
      icon: Server,
      title: t.deployment.onPremTitle,
      body: t.deployment.onPremBody,
      points: t.deployment.onPremPoints,
      primary: true
    },
    {
      icon: Cloud,
      title: t.deployment.localCloudTitle,
      body: t.deployment.localCloudBody,
      points: t.deployment.localCloudPoints
    },
    {
      icon: Building2,
      title: t.deployment.groupTitle,
      body: t.deployment.groupBody,
      points: t.deployment.groupPoints
    }
  ];

  return (
    <Page>
      <PageHead
        title={t.deployment.title}
        eyebrow={
          <>
            <Eyebrow tone="live">
              <Num>3</Num> {t.common.of} <Num>3</Num> — {t.deployment.sameProduct}
            </Eyebrow>
          </>
        }
        lede={t.deployment.lede}
      />

      <div className="grid items-start gap-6 xl:grid-cols-3">
        {options.map((o, i) => {
          const Icon = o.icon;
          return (
            <Reveal key={o.title} index={i} className="h-full">
              {/* الخيار الافتراضي وحده يحمل حدّ الهوية: ترشيح واحد لا ثلاثة متساوية */}
              <Card className="flex h-full flex-col gap-4" glow={o.primary}>
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-overlay text-ink-muted"
                  >
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <h2 className="font-display text-h3 text-ink">{o.title}</h2>
                </div>

                <p className="font-body text-body-sm text-ink">{o.body}</p>

                <ul className="mt-auto flex flex-col gap-2 border-t border-hairline pt-4">
                  {o.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 font-body text-caption text-ink-muted">
                      <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-subtle" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <Card>
          <CardHead
            title={t.deployment.requirementsTitle}
            aside={<Network size={18} strokeWidth={2} className="text-ink-muted" aria-hidden />}
          />
          <ul className="grid gap-3 md:grid-cols-2">
            {[t.deployment.req1, t.deployment.req2, t.deployment.req3, t.deployment.req4].map((req) => (
              <li key={req} className="flex items-start gap-2 font-body text-body-sm text-ink">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                {req}
              </li>
            ))}
          </ul>
          <CardFoot>{t.deployment.noPricing}</CardFoot>
        </Card>
      </Reveal>
    </Page>
  );
}
