"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Moon, RotateCcw, Sun } from "lucide-react";
import { Eyebrow, Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { Num } from "@/components/ui/Bidi";
import { Input, Radio } from "@/components/ui/FormControls";
import { Reveal } from "@/components/motion/Reveal";
import { useTheme } from "@/components/ThemeProvider";
import { useDecisions } from "@/components/DecisionsProvider";
import { useSession } from "@/components/SessionProvider";
import { useI18n, useT } from "@/components/I18nProvider";
import { useRoleCopy } from "@/lib/content";
import { useToast } from "@/components/ui/Toast";
import { cx } from "@/lib/utils";

/** الإعدادات لا تحمل إلا ما يخصّ المستخدم: المصادر التنظيمية شاشة عمل قائمة بذاتها. */
export default function SettingsPage() {
  const [tab, setTab] = useState("prefs");
  const [level, setLevel] = useState(1);
  const [saving, setSaving] = useState(false);
  const { theme, toggle } = useTheme();
  const { progress, reset: resetDecisions } = useDecisions();
  const { role, account, can } = useSession();
  const t = useT();
  const { lang, setLang } = useI18n();
  const roleCopy = useRoleCopy();
  const toast = useToast();

  return (
    <Page>
      <PageHead
        title={t.settings.title}
        eyebrow={<Eyebrow>{role ? roleCopy.label(role) : ""}</Eyebrow>}
        lede={t.settings.lede}
      />

      <Tabs
        tabs={[
          { id: "profile", label: t.settings.tabProfile },
          { id: "prefs", label: t.settings.tabPrefs }
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "profile" && (
        <Reveal>
          <Card className="max-w-[640px]">
            <CardHead title={t.settings.userData} />
            <div className="flex flex-col gap-5">
              {/* القيم تأتي من الجلسة، و key يعيد بناء الحقول عند تبديل الدور فلا تبقى قيمة الدور السابق */}
              <Input key={`name-${role}-${lang}`} label={t.settings.name} defaultValue={role ? roleCopy.name(role) : ""} readOnly />
              <Input key={`role-${role}-${lang}`} label={t.settings.role} defaultValue={role ? roleCopy.label(role) : ""} readOnly />
              <Input key={`mail-${role}`} label={t.settings.email} defaultValue={account?.email ?? ""} readOnly />
            </div>
            <CardFoot>
              {role ? roleCopy.scope(role) : ""} {t.settings.profileFoot}
            </CardFoot>
          </Card>
        </Reveal>
      )}

      {tab === "prefs" && (
        <div className="flex max-w-[640px] flex-col gap-6">
          <Reveal index={0}>
            <Card>
              <CardHead title={t.settings.themeAndLang} />
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-body text-body-sm text-ink-muted">{t.settings.uiTheme}</span>
                  <Button variant="secondary" size="sm" onClick={toggle}>
                    {theme === "dark" ? <Sun size={20} strokeWidth={2} aria-hidden /> : <Moon size={20} strokeWidth={2} aria-hidden />}
                    {theme === "dark" ? t.settings.toLight : t.settings.toDark}
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="font-body text-body-sm text-ink-muted">{t.settings.uiLang}</span>
                  {/**
                   * خياران ظاهران لا قائمة منسدلة، وكل اسم مكتوب بلغته هو — من يبحث عن
                   * الإنجليزية يبحث عن كلمة English لا عن ترجمتها.
                   */}
                  <span role="group" aria-label={t.settings.uiLang} className="flex gap-2">
                    <LangButton active={lang === "ar"} onClick={() => setLang("ar")} label="العربية" />
                    <LangButton active={lang === "en"} onClick={() => setLang("en")} label="English" />
                  </span>
                </div>
                <p className="font-body text-caption text-ink-muted">{t.settings.langNote}</p>
              </div>
            </Card>
          </Reveal>

          {can("manageAgent") && (
            <Reveal index={1}>
              <Card>
                <CardHead title={t.settings.adoptionLevel} />
                <div className="flex flex-col gap-3">
                  {[
                    { n: 0, title: t.settings.level0, detail: t.settings.level0Detail },
                    { n: 1, title: t.settings.level1, detail: t.settings.level1Detail },
                    { n: 2, title: t.settings.level2, detail: t.settings.level2Detail }
                  ].map((l) => (
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
                <CardFoot>{t.settings.adoptionFoot}</CardFoot>
              </Card>
            </Reveal>
          )}

          {can("resetDemo") && (
            <Reveal index={2}>
              <Card>
                <CardHead
                  title={t.settings.demoData}
                  sub={t.settings.demoDataSub}
                />
                {/**
                 * القرارات تُحفظ محلياً حتى لا تتبخّر عند تحديث الصفحة. وما دام العرض
                 * يتراكم، يلزم طريق واضح لإعادته إلى نقطة الصفر — وإلا صار من جرّب
                 * الأداة مرة عاجزاً عن عرضها من البداية مرة أخرى.
                 */}
                <p className="font-body text-body-sm text-ink-muted">
                  {t.settings.demoDataBody1} <Num className="num font-mono text-ink">{progress.decided}</Num>{" "}
                  {t.settings.demoDataBody2} <Num className="num font-mono text-ink">{progress.total}</Num>{" "}
                  {t.settings.demoDataBody3}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      resetDecisions();
                      toast("info", t.settings.resetDone);
                    }}
                  >
                    <RotateCcw size={18} strokeWidth={2} aria-hidden />
                    {t.settings.resetDemo}
                  </Button>
                  <span className="font-body text-body-sm text-ink-muted">{t.settings.resetNote}</span>
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
                  toast("success", t.settings.saved);
                }, 700);
              }}
            >
              {t.settings.savePrefs}
            </Button>
            <span className="font-body text-body-sm text-ink-muted">{t.settings.saveNote}</span>
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

/** خيار لغة: زر لكل لغة، والمفعّل يحمل حدّ brand — لا قائمة منسدلة لخيارين. */
function LangButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "rounded-md border px-3 py-1.5 font-body text-body-sm transition-colors duration-2",
        active
          ? "border-brand bg-[color-mix(in_srgb,var(--brand)_18%,transparent)] font-semibold text-ink"
          : "border-border bg-surface text-ink-muted hover:border-brand hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}
