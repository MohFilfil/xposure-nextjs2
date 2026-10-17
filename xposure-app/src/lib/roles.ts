/**
 * الأدوار الخمسة وصلاحياتها. تطبيق واحد لا خمسة تطبيقات: الفرق بين الأدوار هو
 * ما يُعرض وما يُسمح به، لا شيفرة منفصلة لكل دور.
 *
 * هذه حسابات عرض توضيحي بلا مصادقة حقيقية — الجلسة تُحفظ في localStorage وحدها.
 * عند الربط الفعلي يُستبدل هذا الملف بقراءة الدور من رمز الجلسة (JWT) الصادر من
 * FastAPI، وتبقى أسماء الصلاحيات كما هي فلا تتغيّر الواجهة.
 */

export type Role = "exec" | "compliance" | "owner" | "auditor" | "admin";

export const ROLE_ORDER: Role[] = ["exec", "compliance", "owner", "auditor", "admin"];

/**
 * الصلاحيات أفعال لا شاشات: الشاشة قد تُعرض لثلاثة أدوار ويختلف ما يملكه كل دور
 * فيها. «لا زر اعتماد للمدقّق» قاعدة صلاحية، لا قاعدة تنقّل.
 */
export type Permission =
  /** اعتماد توصية ورفضها — القرار الذي يُنشئ مهمة ويُكتب في سجل التدقيق. */
  | "decide"
  /** طلب تحليل إضافي من الوكيل على بند بعينه. */
  | "requestAnalysis"
  /** تشغيل فحص للمصادر يدوياً. */
  | "scan"
  /** طلب إضافة مصدر تنظيمي جديد (يبقى معلّقاً حتى موافقة المختص). */
  | "addSource"
  /** تصدير السجلات والتقارير. */
  | "export"
  /** تعديل مستوى تبنّي الوكيل وإعدادات النظام التقنية. */
  | "manageAgent"
  /** إعادة ضبط بيانات العرض التوضيحي. */
  | "resetDemo";

interface RoleSpec {
  /** اسم الدور كما يُعرض في الواجهة. */
  label: string;
  /** جملة واحدة: ما الذي يملكه هذا الدور في النظام. */
  scope: string;
  /** حساب العرض التوضيحي الجاهز لهذا الدور. */
  account: { name: string; title: string; email: string };
  permissions: Permission[];
  /** مسارات هذا الدور بالترتيب الذي تظهر به في شريط التنقل. */
  nav: string[];
}

/**
 * مسار البداية لكل دور هو أول عنصر في تنقّله. لا دور بلا صفحة بداية، ولا دور
 * تبدأ صفحته بشاشة لا يملك فيها شيئاً.
 */
export const ROLES: Record<Role, RoleSpec> = {
  exec: {
    label: "القيادة التنفيذية (CISO)",
    scope: "يرى الصورة الكاملة: درجة الامتثال، القضايا الحرجة، ومواعيد السريان القادمة. لا يبتّ في البنود بنفسه.",
    account: { name: "سلطان المطيري", title: "الرئيس التنفيذي لأمن المعلومات", email: "s.almutairi@internal.local" },
    permissions: ["export"],
    nav: ["/dashboard", "/changes", "/tasks", "/audit", "/deployment", "/help", "/settings"]
  },
  compliance: {
    label: "مسؤول الامتثال",
    scope: "يراجع كل تغيير ويبتّ فيه: اعتماد التوصية فتُنشأ مهمة، أو رفضها بسبب مكتوب. هذا الدور صاحب القرار.",
    account: { name: "محمد الفلفل", title: "مسؤول الامتثال — صلاحية مراجعة واعتماد", email: "m.alfilfil@internal.local" },
    permissions: ["decide", "requestAnalysis", "scan", "addSource", "export", "resetDemo"],
    nav: ["/dashboard", "/changes", "/tasks", "/sources", "/audit", "/integrations", "/help", "/settings"]
  },
  owner: {
    label: "مالك عملية / منتج",
    scope: "يرى مهامه هو والعمليات والمنتجات المتأثرة بها فقط — لا طابور المراجعة كاملاً.",
    account: { name: "فهد العتيبي", title: "مدير أمن المعلومات — مالك عمليات", email: "f.alotaibi@internal.local" },
    permissions: [],
    nav: ["/dashboard", "/tasks", "/changes", "/help", "/settings"]
  },
  auditor: {
    label: "مدقّق — اطّلاع فقط",
    scope: "يقرأ ولا يكتب: سجل التدقيق والأدلة وقرارات المراجعين. لا يملك زر اعتماد ولا رفض في أي شاشة.",
    account: { name: "عبدالله الشمري", title: "مدقّق داخلي", email: "a.alshamri@internal.local" },
    permissions: ["export"],
    nav: ["/dashboard", "/changes", "/tasks", "/sources", "/audit", "/help", "/settings"]
  },
  admin: {
    label: "مسؤول تقني",
    scope: "يشغّل الوكيل ويراقبه: صحة المصادر، حالة النماذج، مستوى التبنّي والربط التقني. لا يبتّ في محتوى البنود.",
    account: { name: "ياسر الزهراني", title: "مسؤول الأنظمة التقنية", email: "y.alzahrani@internal.local" },
    permissions: ["scan", "addSource", "manageAgent", "export", "resetDemo"],
    nav: ["/dashboard", "/sources", "/audit", "/integrations", "/deployment", "/help", "/settings"]
  }
};

export function roleLabel(role: Role) {
  return ROLES[role].label;
}

export function accountOf(role: Role) {
  return ROLES[role].account;
}

/** الحرف الواحد في الصورة الرمزية — أول حرف من الاسم الأول. */
export function initialOf(role: Role) {
  return ROLES[role].account.name.trim()[0];
}

export function can(role: Role, permission: Permission) {
  return ROLES[role].permissions.includes(permission);
}

export function navFor(role: Role) {
  return ROLES[role].nav;
}

export function homeFor(role: Role) {
  return ROLES[role].nav[0];
}

/**
 * هل يملك الدور هذا المسار؟ المسارات الفرعية تتبع جذرها: من يملك «/changes»
 * يملك «/changes/CH-2401». المسار غير المملوك يُعاد توجيهه إلى صفحة بداية الدور
 * بدل عرض صفحة فارغة أو خطأ.
 */
export function allowsPath(role: Role, pathname: string) {
  return navFor(role).some((href) => pathname === href || pathname.startsWith(`${href}/`));
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLE_ORDER as string[]).includes(value);
}
