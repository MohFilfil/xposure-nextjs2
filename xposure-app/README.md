# Xposure — واجهة رصد التغيرات التنظيمية وإدارة الامتثال

Next.js 14 + TypeScript + Tailwind، عربي أولاً (`dir="rtl"`) مع إنجليزية كاملة (`dir="ltr"`)،
سمة داكنة افتراضية وفاتحة كاملة القيم، وخمسة أدوار في تطبيق واحد.
كل قيم التصميم مولَّدة من `design-system/tokens.json` — لا يوجد hex أو مقاس مكتوب يدوياً في أي ملف.

## التشغيل

```bash
npm install
npm run dev      # يشغّل npm run tokens أولاً تلقائياً
npm run build && npm run smoke   # بناء ثم اختبار دخان لكل المسارات (بلا تبعيات)
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
    layout.tsx              الخطوط + مزوّدات السمة واللغة والجلسة والقرارات والتنبيهات
    globals.css             يستورد tokens.css ثم Tailwind
    page.tsx + site.css     الصفحة التعريفية العامة (لوحة ألوان خاصة بها، لا تتبع مبدّل السمة)
    login/                  شاشة الدخول: خمسة حسابات عرض، حساب لكل دور، بلا مصادقة
    (app)/                  الصفحات داخل هيكل التطبيق (شريط جانبي + شريط علوي)
      dashboard/ changes/ changes/[id]/ tasks/ sources/ audit/
      integrations/ deployment/ help/ settings/
  components/
    ui/                     مكتبة المكوّنات: Button, StatusBadge, PriorityBadge, Card, StatCard,
                            DiffText, DataTable, ConfidenceBar, FormControls, Modal, Toast,
                            Logo, BrandMotif, Chip, AgentActivity, Bidi
    layout/                 Sidebar, Navbar, AppShell, Page, Hero
    dashboards/             شاشة بداية لكل دور: Compliance, Exec, Owner, Auditor, Admin
    ThemeProvider.tsx       الداكن/الفاتح عبر data-theme + localStorage
    I18nProvider.tsx        العربية/الإنجليزية + ضبط lang و dir على جذر المستند
    SessionProvider.tsx     جلسة العرض (الدور) في localStorage — بلا مصادقة
    RequireSession.tsx      حارس: بلا جلسة ← /login، ومسار لا يملكه الدور ← صفحة بدايته
    DecisionsProvider.tsx   حالة الاعتماد والرفض والمهام المُنشأة (في الذاكرة — بديل مؤقت للـAPI)
  lib/
    roles.ts                الأدوار الخمسة: صلاحياتها، تنقّلها، وحساب العرض لكل دور
    i18n/ar.ts i18n/en.ts   المعجم — العربية هي المرجع والإنجليزية مطبوعة على نوعها
    content.ts              يدمج data.en.ts فوق data.ts بحسب لغة الواجهة
    types.ts vocab.ts utils.ts data.ts data.en.ts
```

## الأدوار

| الدور | صفحة البداية | ما يملكه |
|---|---|---|
| القيادة التنفيذية (CISO) | لوحة تنفيذية | اطّلاع + تصدير، بلا قرار |
| مسؤول الامتثال | طابور المراجعة | **الاعتماد والرفض** والفحص وطلب مصدر |
| مالك عملية / منتج | مهامه وحدها | اطّلاع على ما يخصّ مهامه |
| مدقّق | السجل والأدلة | قراءة فقط — لا زر قرار في أي شاشة |
| مسؤول تقني | صحة المصادر والنموذج | تشغيل الوكيل وربطه، بلا محتوى البنود |

الصلاحيات أفعال لا شاشات (`lib/roles.ts`): الشاشة قد تُعرض لثلاثة أدوار ويختلف ما يملكه كل دور فيها.

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
| الحالة محايدة اللون (نقطة/حلقة/صح/إكس + نص) واللون الدلالي للأولوية وحدها | `ui/StatusBadge.tsx` مقابل `ui/PriorityBadge.tsx` |
| كل معرّف وتاريخ ونسبة وكسر معزول باتجاهه | `ui/Bidi.tsx` (`Num`, `Code`, `DocArrow`) |
| لا نص مكتوب داخل مكوّن — كل ما يُعرض من المعجم | `lib/i18n/ar.ts` و `en.ts` |
| الوكيل يقف عند المرحلة الخامسة في كل مكان يُعرض فيه | `ui/AgentActivity.tsx` |
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
6. `SOURCES` و `AGENT_STATUS` → نقطة صحة في FastAPI بدل ثوابت.
7. `SessionProvider` → قراءة الدور من رمز الجلسة (JWT) الصادر من FastAPI؛ أسماء
   الصلاحيات في `lib/roles.ts` تبقى كما هي فلا تتغيّر الواجهة.

## الاختبار

| الأمر | ما يفعله |
|---|---|
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | بناء الإنتاج (يولّد الـtokens أولاً) |
| `npm run smoke` | يشغّل `next start` ويطلب كل مسار ويتحقّق من رمز 200 وعلامات التصيير |

التدفق الأساسي (فحص ← قائمة ← بند حرج ← اعتماد ← مهمة في Odoo) يُختبر في متصفح
حقيقي باللغتين قبل كل التزام.

## ملاحظتان

- **مصفوفة الأولوية** مبنية كشبكة CSS 2×2 وليست رسماً بيانياً؛ `recharts` غير مثبّتة لأنها لا تخدم
  مصفوفة 2×2 بشكل أفضل من الشبكة. أضفها لو احتجت رسوماً زمنية أو توزيعات لاحقاً.
- **`design-system/components/DiffText/preview.html`** يضع «السابق» يميناً، بينما `README.md` لنفس
  المكوّن ينص على أن اليمين للجديد. الكود يتبع الـREADME. لو أردت ترتيب المعاينة، اعكس ترتيب
  `<Column>` في `ui/DiffText.tsx`.
