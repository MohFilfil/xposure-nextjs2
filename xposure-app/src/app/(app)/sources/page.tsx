"use client";

import { useEffect, useRef, useState } from "react";
import { CircleDashed, CirclePause, CircleSlash, Plus, Radar, ScanSearch } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button, ButtonNote } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/FormControls";
import { AGENT_STEPS, AgentActivity } from "@/components/ui/AgentActivity";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/components/SessionProvider";
import { LAST_RUN_STAMPS, SOURCES } from "@/lib/data";
import type { Source, SourceState } from "@/lib/types";
import { cx, stamp } from "@/lib/utils";

/**
 * المصادر التنظيمية كشاشة قائمة بذاتها لا تبويباً في الإعدادات: هذه هي الحدود
 * التي يرى منها الوكيل العالم. من يسأل «هل فاتنا شيء؟» يسأل عن هذه الصفحة،
 * والجواب فيها رقمان: متى فُحص كل مصدر، وبأي تكرار يُفحص.
 *
 * ولأن الوكيل لا يُضيف مصدراً من تلقائه، زر الإضافة هنا يُنشئ طلباً معلّقاً
 * باسم صاحب الجلسة — لا مصدراً مفعّلاً.
 */

const STATE_UI: Record<SourceState, { label: string; icon: typeof Radar; tone: string; note: string }> = {
  active: { label: "مفعّل", icon: Radar, tone: "text-success", note: "يُفحص بالجدول المعتمد" },
  paused: { label: "موقوف مؤقتاً", icon: CirclePause, tone: "text-warning", note: "لا يُفحص حتى يُعاد تفعيله" },
  pending: { label: "بانتظار موافقة المختص", icon: CircleDashed, tone: "text-warning", note: "طلب إضافة لم يُعتمد بعد" },
  soon: { label: "مُعدّ ولم يُفعّل", icon: CircleSlash, tone: "text-ink-subtle", note: "جاهز في النظام بانتظار التفعيل" }
};

const FREQUENCIES = [
  { value: "daily", label: "يومياً · 05:00" },
  { value: "weekly", label: "أسبوعياً · الأحد 05:00" },
  { value: "monthly", label: "شهرياً · الأول من كل شهر" }
];

export default function SourcesPage() {
  const toast = useToast();
  const { can, account } = useSession();

  /* الطلبات المُنشأة في الجلسة تُضاف إلى القائمة المعروضة بحالة «معلّق» */
  const [added, setAdded] = useState<Source[]>([]);
  const [asking, setAsking] = useState(false);
  const [name, setName] = useState("");
  const [docs, setDocs] = useState("");
  const [frequency, setFrequency] = useState("weekly");

  /** الفحص الحيّ: active يتقدّم مرحلة كل ثانية ثم يقف عند المرحلة الخامسة. */
  const [running, setRunning] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function runScan() {
    if (running !== null) return;
    setRunning(0);
    timers.current = AGENT_STEPS.slice(1).map((_, i) =>
      setTimeout(() => setRunning(i + 1), (i + 1) * 900)
    );
    timers.current.push(
      setTimeout(() => {
        toast("info", "اكتمل الفحص. الوكيل متوقّف عند المرحلة الخامسة بانتظار قرارك — لا يعتمد بنداً من تلقائه.");
      }, AGENT_STEPS.length * 900)
    );
  }

  const list = [...SOURCES, ...added];
  const active = list.filter((s) => s.state === "active").length;
  const pending = list.filter((s) => s.state === "pending").length;
  const nameWritten = name.trim().length > 0;

  function submitRequest() {
    const chosen = FREQUENCIES.find((f) => f.value === frequency)?.label ?? "";
    setAdded((prev) => [
      ...prev,
      {
        id: `SRC-REQ-${prev.length + 1}`,
        name: name.trim(),
        short: "—",
        docs: docs.trim() || "لم تُحدَّد الوثائق بعد",
        state: "pending",
        lastScan: null,
        frequency: `مقترح: ${chosen}`,
        lastResult: "طلب إضافة بانتظار موافقة المختص — لا يُفحص قبلها.",
        requested: { by: account?.name ?? "—", at: stamp() }
      }
    ]);
    setAsking(false);
    setName("");
    setDocs("");
    toast("success", "سُجِّل طلب إضافة المصدر باسمك في سجل التدقيق. لن يُفحص قبل موافقة المختص.");
  }

  return (
    <Page>
      <PageHead
        title="المصادر التنظيمية"
        eyebrow={
          <>
            <Eyebrow tone="live">{active} مصدر مفعّل من {list.length}</Eyebrow>
            {pending > 0 && <Eyebrow>{pending} طلب بانتظار موافقة المختص</Eyebrow>}
          </>
        }
        lede="الجهات التي يراقبها الوكيل، وبأي تكرار، ومتى فُحص كل منها آخر مرة. إضافة مصدر جديد طلبٌ يحتاج موافقة المختص ولا يبدأ الفحص قبلها."
        action={
          <div className="flex flex-wrap items-center gap-3">
            {can("scan") && (
              <Button variant="secondary" onClick={runScan} loading={running !== null && running < AGENT_STEPS.length - 1}>
                {running === null && <ScanSearch size={20} strokeWidth={2} aria-hidden />}
                افحص الآن
              </Button>
            )}
            {can("addSource") && (
              <Button variant="primary" onClick={() => setAsking(true)}>
                <Plus size={20} strokeWidth={2} aria-hidden />
                إضافة مصدر
              </Button>
            )}
          </div>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex min-w-0 flex-col gap-4">
          {list.map((source, i) => (
            <Reveal key={source.id} index={i}>
              <SourceRow source={source} canManage={can("manageAgent")} onToggle={(s) => toast("info", s)} />
            </Reveal>
          ))}
        </section>

        <div className="flex flex-col gap-6">
          <Reveal index={0}>
            <Card glow={running !== null}>
              <CardHead
                title="نشاط الوكيل"
                sub={running !== null ? "فحص جارٍ الآن" : "آخر دورة كاملة — رصد ECC-2:2024"}
                aside={
                  running !== null ? (
                    <Chip>جارٍ</Chip>
                  ) : (
                    <span className="num font-mono text-caption text-ink-subtle" dir="ltr">
                      2026-09-17
                    </span>
                  )
                }
              />
              <AgentActivity
                active={running ?? AGENT_STEPS.length - 1}
                stamps={running === null ? LAST_RUN_STAMPS : undefined}
                note={
                  running !== null
                    ? "المراحل تُكتب في سجل التدقيق مرحلةً مرحلة مع اسم النموذج وإصداره."
                    : "الوكيل يقف عند المرحلة الخامسة دائماً. لا اعتماد تلقائي ولا إغلاق بند بلا قرار بشري."
                }
              />
            </Card>
          </Reveal>

          <Reveal index={1}>
            <Card>
              <CardHead title="صلاحية الوكيل على المصادر" />
              <ul className="flex flex-col gap-3">
                <PermRow label="قراءة صفحات الجهة وحفظ الملف الخام" value="مسموح" tone="success" />
                <PermRow label="المقارنة والتحليل داخل الشبكة" value="مسموح" tone="success" />
                <PermRow label="إضافة مصدر أو تفعيله" value="بموافقة المختص" tone="warning" />
                <PermRow label="تعديل أي ملف أو سياسة في المنشأة" value="ممنوع" tone="danger" />
              </ul>
              <CardFoot>لا يخرج نص واحد من الشبكة؛ الجلب قراءة فقط من مصادر منشورة علناً.</CardFoot>
            </Card>
          </Reveal>
        </div>
      </div>

      {asking && (
        <Modal
          title="طلب إضافة مصدر تنظيمي"
          warning="الإضافة ليست فورية: يُسجَّل الطلب باسمك وينتظر موافقة المختص، ولا يبدأ الفحص قبلها."
          onClose={() => setAsking(false)}
          actions={
            <>
              <Button variant="primary" disabled={!nameWritten} onClick={submitRequest}>
                إرسال الطلب للموافقة
              </Button>
              <Button variant="ghost" onClick={() => setAsking(false)}>
                إلغاء
              </Button>
              <ButtonNote>
                {nameWritten ? "يُسجَّل الطلب باسمك ووقته." : "زر الإرسال معطّل حتى تكتب اسم الجهة."}
              </ButtonNote>
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <Input
              label="اسم الجهة (إلزامي)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: الهيئة العامة للأمن الصناعي"
            />
            <Input
              label="الوثائق المطلوب متابعتها"
              value={docs}
              onChange={(e) => setDocs(e.target.value)}
              placeholder="مثال: اللائحة الفنية للمنشآت عالية الخطورة"
            />
            <Select
              label="تكرار الفحص المقترح"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              options={FREQUENCIES}
            />
          </div>
        </Modal>
      )}
    </Page>
  );
}

/**
 * صفّ المصدر. الحالة تُعرض بأيقونة ونص لا بشارة ملوّنة مصمتة: اللون المصمت في
 * هذا المنتج لغة الأولوية، والمصدر لا أولوية له.
 */
function SourceRow({
  source,
  canManage,
  onToggle
}: {
  source: Source;
  canManage: boolean;
  onToggle: (message: string) => void;
}) {
  const ui = STATE_UI[source.state];
  const Icon = ui.icon;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-h3 text-ink">{source.name}</h2>
            {/* الاختصار اللاتيني معزول باتجاهه، وإلا التصق بعلامات الترقيم العربية حوله */}
            <bdi dir="ltr" className="num rounded-sm bg-surface-overlay px-1.5 py-0.5 font-mono text-caption text-ink-muted">
              {source.short}
            </bdi>
          </div>
          <p className="font-body text-body-sm text-ink-muted">{source.docs}</p>
        </div>

        <span className={cx("flex shrink-0 items-center gap-2 font-body text-body-sm font-semibold", ui.tone)}>
          <Icon size={18} strokeWidth={2} aria-hidden />
          {ui.label}
        </span>
      </div>

      <dl className="grid gap-x-6 gap-y-3 border-t border-hairline pt-4 sm:grid-cols-3">
        <Field label="آخر فحص">
          {source.lastScan ? (
            <bdi dir="ltr" className="num font-mono">
              {source.lastScan}
            </bdi>
          ) : (
            <span className="text-ink-muted">لم يُفحص بعد</span>
          )}
        </Field>
        <Field label="تكرار الفحص">{source.frequency}</Field>
        <Field label="الإصدار المتابَع">
          {source.versions ? (
            /* الإصداران داخل bdi واحد باتجاه LTR: ترتيبهما معلومة، وقلبه يعكس معنى الانتقال */
            <bdi dir="ltr" className="num whitespace-nowrap font-mono">
              {source.versions.from} → {source.versions.to}
            </bdi>
          ) : (
            <span className="text-ink-muted">—</span>
          )}
        </Field>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
        <p className="max-w-[70ch] font-body text-caption text-ink-muted">
          {source.lastResult}
          {source.requested && (
            <>
              {" "}
              طلبها {source.requested.by} في{" "}
              <bdi dir="ltr" className="num font-mono">
                {source.requested.at}
              </bdi>
              .
            </>
          )}
        </p>

        <div className="flex items-center gap-3">
          {typeof source.changes === "number" && (
            <span className="font-body text-caption text-ink-muted">
              <span className="num font-mono font-semibold text-ink">{source.changes}</span> تغييراً جوهرياً منه
            </span>
          )}
          {canManage && source.state !== "pending" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                onToggle(
                  source.state === "active"
                    ? `أُوقف فحص ${source.short} مؤقتاً — يُسجَّل الإيقاف في سجل التدقيق باسمك.`
                    : `طُلب تفعيل فحص ${source.short}. يبدأ مع أول دورة مجدولة.`
                )
              }
            >
              {source.state === "active" ? "إيقاف مؤقت" : "تفعيل"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-body text-caption text-ink-subtle">{label}</dt>
      <dd className="font-body text-body-sm text-ink">{children}</dd>
    </div>
  );
}

function PermRow({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "danger" }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-hairline pb-3 font-body text-body-sm last:border-b-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span
        className={cx(
          "shrink-0 font-semibold",
          tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-danger"
        )}
      >
        {value}
      </span>
    </li>
  );
}
