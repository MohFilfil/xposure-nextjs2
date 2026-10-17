"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Moon, RotateCcw, Sun } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input, Radio } from "@/components/ui/FormControls";
import { Reveal } from "@/components/motion/Reveal";
import { useTheme } from "@/components/ThemeProvider";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { ROLES } from "@/lib/roles";
import { useToast } from "@/components/ui/Toast";
import { cx } from "@/lib/utils";

/** الإعدادات لا تحمل إلا ما يخصّ المستخدم: المصادر التنظيمية شاشة عمل قائمة بذاتها. */
const TABS = [
  { id: "profile", label: "الملف الشخصي" },
  { id: "prefs", label: "التفضيلات" }
];

const LEVELS = [
  { n: 0, title: "المستوى 0 — مستقل", detail: "يعمل الوكيل بملفات مرفوعة دون أي ربط تقني." },
  { n: 1, title: "المستوى 1 — قراءة موصلات", detail: "قراءة فقط لسجلات المنتجات والضوابط بحساب خدمة محدود." },
  { n: 2, title: "المستوى 2 — تنفيذ بموافقة", detail: "إنشاء المهام وتحديث حالاتها بعد اعتماد المختص." }
];

export default function SettingsPage() {
  const [tab, setTab] = useState("prefs");
  const [level, setLevel] = useState(1);
  const [saving, setSaving] = useState(false);
  const { theme, toggle } = useTheme();
  const { progress, reset: resetDecisions } = useDecisions();
  const { role, account, can } = useSession();
  const toast = useToast();

  return (
    <Page>
      <PageHead
        title="الإعدادات"
        eyebrow={<Eyebrow>{role ? ROLES[role].label : ""}</Eyebrow>}
        lede="إعدادات المستخدم وتفضيلات العرض. ما تغيّره هنا يخصّ حسابك وحده."
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "profile" && (
        <Reveal>
          <Card className="max-w-[640px]">
            <CardHead title="بيانات المستخدم" />
            <div className="flex flex-col gap-5">
              {/* القيم تأتي من الجلسة، و key يعيد بناء الحقول عند تبديل الدور فلا تبقى قيمة الدور السابق */}
              <Input key={`name-${role}`} label="الاسم" defaultValue={account?.name ?? ""} readOnly />
              <Input key={`role-${role}`} label="الدور" defaultValue={role ? ROLES[role].label : ""} readOnly />
              <Input key={`mail-${role}`} label="البريد الداخلي" defaultValue={account?.email ?? ""} readOnly />
            </div>
            <CardFoot>
              {role ? ROLES[role].scope : ""} الأدوار يديرها مسؤول النظام؛ والتبديل من الشريط العلوي أداة عرض توضيحي وحدها.
            </CardFoot>
          </Card>
        </Reveal>
      )}

      {tab === "prefs" && (
        <div className="flex max-w-[640px] flex-col gap-6">
          <Reveal index={0}>
            <Card>
              <CardHead title="السمة واللغة" />
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-body text-body-sm text-ink-muted">سمة الواجهة</span>
                  <Button variant="secondary" size="sm" onClick={toggle}>
                    {theme === "dark" ? <Sun size={20} strokeWidth={2} aria-hidden /> : <Moon size={20} strokeWidth={2} aria-hidden />}
                    {theme === "dark" ? "التحويل إلى الفاتح" : "التحويل إلى الداكن"}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-body text-body-sm text-ink-muted">لغة الواجهة</span>
                  <span className="flex gap-2">
                    <Chip>العربية — مفعّلة</Chip>
                    <Chip muted>English — قريباً</Chip>
                  </span>
                </div>
              </div>
            </Card>
          </Reveal>

          {can("manageAgent") && (
            <Reveal index={1}>
              <Card>
                <CardHead title="مستوى التبني" />
                <div className="flex flex-col gap-3">
                  {LEVELS.map((l) => (
                    <Radio
                      key={l.n}
                      name="adoption"
                      checked={level === l.n}
                      onChange={() => setLevel(l.n)}
                      label={
                        <span>
                          <span className="block font-body text-body font-bold text-ink">{l.title}</span>
                          <span className="block font-body text-body-sm text-ink-muted">{l.detail}</span>
                        </span>
                      }
                    />
                  ))}
                </div>
                <CardFoot>رفع المستوى يحتاج موافقة مسؤول الأمن السيبراني ويُسجَّل في سجل التدقيق.</CardFoot>
              </Card>
            </Reveal>
          )}

          {can("resetDemo") && (
            <Reveal index={2}>
              <Card>
                <CardHead
                  title="بيانات العرض التوضيحي"
                  sub="القرارات محفوظة في هذا المتصفح وحده"
                />
                {/**
                 * القرارات تُحفظ محلياً حتى لا تتبخّر عند تحديث الصفحة. وما دام العرض
                 * يتراكم، يلزم طريق واضح لإعادته إلى نقطة الصفر — وإلا صار من جرّب
                 * الأداة مرة عاجزاً عن عرضها من البداية مرة أخرى.
                 */}
                <p className="font-body text-body-sm text-ink-muted">
                  بُتَّ في <span className="num font-mono text-ink">{progress.decided}</span> من{" "}
                  <span className="num font-mono text-ink">{progress.total}</span> تغييراً. عند الربط الفعلي تُكتب هذه
                  القرارات في قاعدة البيانات وسجل التدقيق، ولا تُمحى أبداً.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      resetDecisions();
                      toast("info", "أُعيدت بيانات العرض إلى حالتها الأولى.");
                    }}
                  >
                    <RotateCcw size={18} strokeWidth={2} aria-hidden />
                    إعادة ضبط بيانات العرض
                  </Button>
                  <span className="font-body text-body-sm text-ink-subtle">
                    يمحو القرارات والمهام المُنشأة من هذا المتصفح فقط.
                  </span>
                </div>
              </Card>
            </Reveal>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              loading={saving}
              onClick={() => {
                setSaving(true);
                setTimeout(() => {
                  setSaving(false);
                  toast("success", "حُفظت التفضيلات.");
                }, 700);
              }}
            >
              حفظ التفضيلات
            </Button>
            <span className="font-body text-body-sm text-ink-muted">تُطبَّق فوراً على هذا المستخدم فقط.</span>
          </div>
        </div>
      )}

    </Page>
  );
}

/**
 * التبويبات: الخط السفلي ينزلق من التبويب السابق إلى الجديد بدل أن يقفز.
 * الانزلاق يربط الحالتين فيبقى المستخدم عارفاً من أين جاء — وهو أوضح من
 * تلوين مفاجئ حين تتشابه عناوين التبويبات.
 */
function Tabs({
  tabs,
  value,
  onChange
}: {
  tabs: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>(`[data-tab="${value}"]`);
    if (active) setBar({ left: active.offsetLeft, width: active.offsetWidth });
  }, [value]);

  return (
    <div ref={listRef} role="tablist" className="relative flex gap-2 border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          data-tab={t.id}
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            "px-4 py-3 font-body text-body transition-colors duration-2 ease-out",
            value === t.id ? "font-semibold text-brand" : "text-ink-muted hover:text-ink"
          )}
        >
          {t.label}
        </button>
      ))}
      {bar && (
        <span
          aria-hidden
          className="absolute -bottom-px h-[3px] rounded-full bg-gradient-brand"
          style={{
            left: bar.left,
            width: bar.width,
            transition: "left var(--dur-3) var(--ease-in-out), width var(--dur-3) var(--ease-in-out)"
          }}
        />
      )}
    </div>
  );
}
