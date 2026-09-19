# Xposure — واجهة رصد التغيرات التنظيمية وإدارة الامتثال

Next.js 14 + TypeScript + Tailwind، عربي أولاً (`dir="rtl"`)، سمة داكنة افتراضية وفاتحة كاملة القيم.
كل قيم التصميم مولَّدة من `design-system/tokens.json` — لا يوجد hex أو مقاس مكتوب يدوياً في أي ملف.

## التشغيل

```bash
npm install
npm run dev      # يشغّل npm run tokens أولاً تلقائياً
```

ثم افتح `http://localhost:3000` (يحوّل إلى `/dashboard`).

الخطوط تُجلب من Google Fonts عبر `next/font` وقت البناء، فيلزم اتصال بالإنترنت في أول `dev` أو `build`.

## البنية

```
design-system/              نظام التصميم كما هو (tokens.json، README، 13 مكوّناً، أصول الشعار)
scripts/build-tokens.mjs    يقرأ tokens.json ويولّد src/app/tokens.css — لا تعدّل المخرَج يدوياً
public/logos/               ملفا SVG المتجهان للشعار والعدسة
src/
  app/
    layout.tsx              html lang=ar dir=rtl + الخطوط + مزوّدات السمة والقرارات والتنبيهات
    globals.css             يستورد tokens.css ثم Tailwind
    (app)/                  الصفحات داخل هيكل التطبيق (شريط جانبي + شريط علوي)
      dashboard/ changes/ changes/[id]/ tasks/ audit/ settings/
  components/
    ui/                     مكتبة المكوّنات: Button, StatusBadge, PriorityBadge, Card, StatCard,
                            DiffText, DataTable, ConfidenceBar, FormControls, Modal, Toast,
                            Logo, BrandMotif, Chip
    layout/                 Sidebar, Navbar, AppShell, Page
    ThemeProvider.tsx       الداكن/الفاتح عبر data-theme + localStorage
    DecisionsProvider.tsx   حالة الاعتماد والرفض والمهام المُنشأة (في الذاكرة — بديل مؤقت للـAPI)
  lib/
    types.ts vocab.ts utils.ts data.ts
```

## القواعد المطبَّقة في الكود

| القاعدة | أين |
|---|---|
| نص كل زر مصمت `ink` والخلفية ممزوجة 55/45 مع `surface` | `ui/Button.tsx` |
| الشارات تستخدم أزواج `on-x` لا قاعدة الأزرار | `ui/StatusBadge.tsx`، `ui/PriorityBadge.tsx` |
| زر `primary` واحد كحد أقصى في كل شاشة | كل صفحة — راجع تعليقات الصفحات |
| `brand` على العناصر التفاعلية فقط | الأزرار، الروابط، العنصر النشط في التنقل، `accent-color` في `FormControls` |
| الشعار أحادي اللون عبر CSS mask بلون `ink` | `ui/Logo.tsx` |
| `BrandMotif` بلون `ink-muted` وفي 3 سياقات فقط | `ui/BrandMotif.tsx` — التحميل (لوحة التحكم)، الحالة الفارغة |
| عتبة 70% في `ConfidenceBar` مع نص «حُوّل للمراجعة اليدوية» | `ui/ConfidenceBar.tsx` |
| `DiffText` لا يعتمد على اللون وحده: رمز + تزيين + لون | `ui/DiffText.tsx` |
| العمود الأيمن «الجديد» والأيسر «السابق» ثابتاً | `ui/DiffText.tsx` |
| «سبب الرفض» إلزامي قبل تفعيل زر الرفض | `changes/[id]/page.tsx` + `ui/Modal.tsx` |
| حالة `disabled` لا تُخفى — نص يشرح السبب | `ui/Button.tsx` (`ButtonNote`) |
| لون الموعد مقروناً بنص دائماً | `lib/utils.ts` (`dueState`) + `tasks/page.tsx` |
| ترتيب الطبقات: sticky < dropdown < overlay < modal < toast | `tailwind.config.ts` (`zIndex`) |
| الأرقام غربية (0-9) | `globals.css` (`font-variant-numeric`) + لا أرقام هندية في المصدر |
| خصائص منطقية لا يمين/يسار | `border-s-*`، `ms-*`، `insetInlineStart` في كل الملفات |
| حلقة تركيز ظاهرة على كل عنصر تفاعلي | `globals.css` + `focus-visible` في `Button` و`DataTable` |

## البيانات

`src/lib/data.ts` بيانات عرض توضيحي لشركة افتراضية. **نصوص البنود صياغات توضيحية وليست اقتباسات
حرفية من وثائق الهيئة الوطنية للأمن السيبراني** — تُستبدل قبل أي عرض رسمي.

نقاط الاستبدال عند الربط بالخلفية (FastAPI):

1. `CHANGES` → `GET /changes` من مخرجات محرك المقارنة.
2. `DecisionsProvider.approve/reject` → `POST /changes/{id}/decision` مع كتابة في سجل التدقيق.
3. `TASKS` → قراءة من نظام المهام (Odoo/GRC) بعد الاعتماد.
4. `AUDIT` → `GET /audit`.
5. `TODAY` في `lib/utils.ts` → `new Date()`.

## ملاحظتان

- **مصفوفة الأولوية** مبنية كشبكة CSS 2×2 وليست رسماً بيانياً؛ `recharts` غير مثبّتة لأنها لا تخدم
  مصفوفة 2×2 بشكل أفضل من الشبكة. أضفها لو احتجت رسوماً زمنية أو توزيعات لاحقاً.
- **`design-system/components/DiffText/preview.html`** يضع «السابق» يميناً، بينما `README.md` لنفس
  المكوّن ينص على أن اليمين للجديد. الكود يتبع الـREADME. لو أردت ترتيب المعاينة، اعكس ترتيب
  `<Column>` في `ui/DiffText.tsx`.
