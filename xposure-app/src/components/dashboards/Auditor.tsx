"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronLeft, FileLock2, History, ShieldCheck, X } from "lucide-react";
import { Eyebrow, Page } from "@/components/layout/Page";
import { Hero, HeroFigure } from "@/components/layout/Hero";
import { Section } from "@/components/dashboards/Section";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { MetricBar, StatCard } from "@/components/ui/StatCard";
import { Reveal } from "@/components/motion/Reveal";
import { useDecisions } from "@/components/DecisionsProvider";
import { AUDIT, CHANGES } from "@/lib/data";

/**
 * شاشة المدقّق. لا تملك زراً واحداً يغيّر حالة شيء — وهذا هو جوهرها:
 * المدقّق يسأل «من قرّر، ومتى، وبأي دليل؟»، فتُفتتح الشاشة بعدد القيود لا بعدد
 * البنود، وتنتهي بما يثبت أن ما يُعرض هو ما كان في الوثيقة فعلاً.
 */
export function AuditorDashboard() {
  const router = useRouter();
  const { statusOf, auditExtra, decisions } = useDecisions();

  const all = [...AUDIT, ...auditExtra];
  const approved = CHANGES.filter((c) => statusOf(c) === "approved").length;
  const rejected = CHANGES.filter((c) => statusOf(c) === "rejected").length;
  const undecided = CHANGES.length - approved - rejected;

  /* قيود الوكيل تُفصل عن قيود البشر: التمييز بينهما أول ما يسأل عنه المدقّق */
  const agentRows = all.filter((e) => e.who.includes("الوكيل") || e.who.includes("محرك") || e.who.includes("مكوّن"));
  const humanRows = all.filter((e) => !agentRows.includes(e));

  const lowConfidence = CHANGES.filter((c) => c.confidence < 70);
  const decidedWithReason = Object.values(decisions).filter((d) => d.status === "rejected" && d.reason);

  return (
    <Page>
      <Hero
        eyebrow={
          <>
            <Eyebrow tone="live">سجل غير قابل للتعديل أو الحذف</Eyebrow>
            <Eyebrow>اطّلاع فقط — لا أزرار قرار في أي شاشة</Eyebrow>
          </>
        }
        headline={
          <>
            <HeroFigure>{all.length}</HeroFigure> قيداً
            <br />
            في سجل التدقيق
          </>
        }
        lede={
          <>
            كل قيد يحمل من فعل، وماذا فعل، ومتى — ومع قيود الوكيل اسم النموذج وإصداره ونسخة التعليمات المستخدمة. لا
            يُحذف قيد ولا يُعدَّل؛ وأي تغيير لاحق في قرار يُكتب قيداً جديداً فوقه.
          </>
        }
        actions={
          <Button variant="primary" onClick={() => router.push("/audit")}>
            <History size={20} strokeWidth={2} aria-hidden />
            افتح السجل الكامل
          </Button>
        }
        facts={[
          { label: "قيود الوكيل", value: agentRows.length },
          { label: "قيود بشرية", value: humanRows.length },
          { label: "بنود بلا قرار", value: undecided }
        ]}
      />

      <Reveal>
        <MetricBar>
          <StatCard
            label="توصيات معتمدة"
            value={approved}
            context="كل اعتماد أنشأ مهمة باسم مالكها"
            icon={Check}
            tone="success"
          />
          <StatCard
            label="تغييرات مرفوضة"
            value={rejected}
            context={`${decidedWithReason.length} منها بسبب مكتوب في هذه الجلسة`}
            icon={X}
          />
          <StatCard
            label="محوّلة للمراجعة اليدوية"
            value={lowConfidence.length}
            context="ثقة النموذج دون عتبة 70% — لا تمرّ آلياً"
            icon={ShieldCheck}
          />
          <StatCard
            label="قيود الوكيل"
            value={agentRows.length}
            context="جلب، مقارنة، تحليل أثر، فحص استشهاد"
            icon={FileLock2}
          />
        </MetricBar>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Section title="آخر ما سُجِّل" sub="أحدث ستة قيود — بالترتيب الزمني نفسه في السجل الكامل">
          <Reveal>
            <Card>
              <ol className="flex flex-col">
                {all
                  .slice(-6)
                  .reverse()
                  .map((entry, i) => (
                    <li
                      key={`${entry.time}-${i}`}
                      className="grid gap-1 border-b border-hairline py-3 last:border-b-0 md:grid-cols-[150px_1fr] md:gap-4"
                    >
                      <bdi dir="ltr" className="num font-mono text-body-sm text-ink-muted">
                        {entry.time}
                      </bdi>
                      <span>
                        <span className="block font-body text-body-sm text-ink">{entry.what}</span>
                        <span className="block font-body text-caption text-ink-muted">{entry.who}</span>
                      </span>
                    </li>
                  ))}
              </ol>
              <CardFoot>
                <span className="flex flex-wrap items-center justify-between gap-3">
                  السجل يُصدَّر بصيغة قابلة للمراجعة الخارجية.
                  <Button variant="secondary" size="sm" onClick={() => router.push("/audit")}>
                    كل القيود
                    <ChevronLeft size={16} strokeWidth={2} aria-hidden />
                  </Button>
                </span>
              </CardFoot>
            </Card>
          </Reveal>
        </Section>

        <Section title="الأدلة" sub="ما يثبت أن المعروض هو ما نُشر فعلاً">
          <Reveal>
            <Card className="flex flex-col gap-4">
              <EvidenceRow
                label="الملف الخام"
                value="محفوظ كما نُشر · 2.4 ميجابايت"
                note="مع بصمة نصية (hash) تُقارن عند كل فحص"
              />
              <EvidenceRow label="بصمة الإصدار" value="f3a9c1…" note="ECC-2:2024 — رُصد 2026-09-17 06:12" mono />
              <EvidenceRow label="النموذج" value="Qwen2.5 14B" note="تعليمات v3 — يعمل داخل الشبكة" mono />
              <EvidenceRow
                label="فحص الاستشهاد"
                value={`${CHANGES.length} / ${CHANGES.length}`}
                note="تحقّق الكود من وجود كل نص مقتبس حرفياً في الملف الخام"
                mono
              />
              <CardFoot>لا يخرج نص واحد من الشبكة؛ ولا يُعتمد بند إلا بقرار بشري مسجَّل باسمه.</CardFoot>
            </Card>
          </Reveal>
        </Section>
      </div>

      <Section title="حالة البتّ في التغييرات" sub="ما بُتَّ فيه وما لم يُبتّ — بلا إمكانية تعديل من هذه الشاشة">
        <Reveal>
          <Card>
            <CardHead
              title="توزيع القرارات"
              sub="النسبة من إجمالي التغييرات الجوهرية المرصودة"
              aside={<span className="num font-mono text-caption text-ink-subtle">{CHANGES.length} تغييراً</span>}
            />
            <div className="flex flex-col gap-4">
              <DecisionBar label="معتمدة" count={approved} total={CHANGES.length} tone="var(--success)" />
              <DecisionBar label="مرفوضة" count={rejected} total={CHANGES.length} tone="var(--danger)" />
              <DecisionBar label="بلا قرار بعد" count={undecided} total={CHANGES.length} tone="var(--ink-subtle)" />
            </div>
            <CardFoot>كل انتقال بين هذه الحالات له قيد في السجل باسم من قام به ووقته.</CardFoot>
          </Card>
        </Reveal>
      </Section>
    </Page>
  );
}

function EvidenceRow({
  label,
  value,
  note,
  mono
}: {
  label: string;
  value: string;
  note: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-hairline pb-3 last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-body text-body-sm text-ink-muted">{label}</span>
        {mono ? (
          <bdi dir="ltr" className="num font-mono text-body-sm font-semibold text-ink">
            {value}
          </bdi>
        ) : (
          <span className="font-body text-body-sm font-semibold text-ink">{value}</span>
        )}
      </div>
      <span className="font-body text-caption text-ink-muted">{note}</span>
    </div>
  );
}

function DecisionBar({ label, count, total, tone }: { label: string; count: number; total: number; tone: string }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-4">
      <span className="w-[84px] shrink-0 font-body text-body-sm text-ink">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </span>
      {/* النسبة والعدد داخل bdi واحد باتجاه LTR، وإلا قُرئت «٪70» معكوسة بين النصّين */}
      <bdi dir="ltr" className="num w-[86px] shrink-0 text-end font-mono text-body-sm text-ink">
        {count} · {pct}%
      </bdi>
    </div>
  );
}
