"use client";

import { useState } from "react";
import { Moon, Plus, Sun } from "lucide-react";
import { Page, PageHead } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card, CardFoot, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input, Radio } from "@/components/ui/FormControls";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ui/Toast";
import { SOURCES } from "@/lib/data";
import { cx } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "الملف الشخصي" },
  { id: "prefs", label: "التفضيلات" },
  { id: "sources", label: "المصادر التنظيمية" }
];

const LEVELS = [
  { n: 0, title: "المستوى 0 — مستقل", detail: "يعمل الوكيل بملفات مرفوعة دون أي ربط تقني." },
  { n: 1, title: "المستوى 1 — قراءة موصلات", detail: "قراءة فقط لسجلات المنتجات والضوابط بحساب خدمة محدود." },
  { n: 2, title: "المستوى 2 — تنفيذ بموافقة", detail: "إنشاء المهام وتحديث حالاتها بعد اعتماد المختص." }
];

export default function SettingsPage() {
  const [tab, setTab] = useState("prefs");
  const [level, setLevel] = useState(1);
  const { theme, toggle } = useTheme();
  const toast = useToast();

  return (
    <Page>
      <PageHead title="الإعدادات" lede="إعدادات المستخدم ومستوى الصلاحيات الممنوحة للوكيل داخل المنشأة." />

      <div role="tablist" className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "-mb-px border-b-[3px] px-4 py-3 font-body text-body transition-colors duration-150",
              tab === t.id ? "border-b-brand font-semibold text-brand" : "border-b-transparent text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <Card className="max-w-[640px]">
          <CardHead title="بيانات المستخدم" />
          <div className="flex flex-col gap-5">
            <Input label="الاسم" defaultValue="محمد الفلفل" readOnly />
            <Input label="الدور" defaultValue="مسؤول الامتثال — صلاحية مراجعة واعتماد" readOnly />
            <Input label="البريد الداخلي" defaultValue="m.alfilfil@internal.local" readOnly />
          </div>
          <CardFoot>الأدوار ثابتة في النسخة الأولى وتُدار من مسؤول النظام.</CardFoot>
        </Card>
      )}

      {tab === "prefs" && (
        <div className="flex max-w-[640px] flex-col gap-6">
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

          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={() => toast("success", "حُفظت التفضيلات.")}>
              حفظ التفضيلات
            </Button>
            <span className="font-body text-body-sm text-ink-muted">تُطبَّق فوراً على هذا المستخدم فقط.</span>
          </div>
        </div>
      )}

      {tab === "sources" && (
        <Card className="max-w-[760px]">
          <CardHead
            title="المصادر المتابَعة"
            aside={
              <Button variant="secondary" size="sm" onClick={() => toast("info", "إضافة مصدر جديد تحتاج موافقة المختص.")}>
                <Plus size={20} strokeWidth={2} aria-hidden />
                إضافة مصدر
              </Button>
            }
          />
          <ul>
            {SOURCES.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-b-0">
                <span className="flex flex-col gap-1">
                  <span className="font-body text-body font-semibold text-ink">{s.name}</span>
                  <span className="font-body text-body-sm text-ink-muted">{s.detail}</span>
                </span>
                {s.state === "active" ? <StatusBadge status="approved" /> : <Chip>قريباً</Chip>}
              </li>
            ))}
          </ul>
          <CardFoot>إضافة مصدر جديد تحتاج موافقة المختص، ولا تتطلب تعديلاً في الكود الأساسي.</CardFoot>
        </Card>
      )}
    </Page>
  );
}
