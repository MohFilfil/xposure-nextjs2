import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { Sparkline } from "@/components/ui/Sparkline";
import { cx } from "@/lib/utils";

/**
 * شريط المؤشرات: لوح واحد مقسّم بخيوط داخلية، لا أربعة صناديق عائمة.
 * أربعة صناديق منفصلة تتنافس على الانتباه وتضاعف الحدود على الشاشة؛ ولوح واحد
 * مقسّم يقول «هذه قراءة واحدة من أربع خانات» — وهو المعنى الصحيح.
 * أربع خانات كحدّ أقصى؛ أي مؤشر خامس ينتقل لصفحة تحليلات.
 */
export function MetricBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel overflow-hidden">
      {/**
       * الفواصل فجوة 1px يظهر خلفها لون الخيط، لا حدود على الخانات: في شبكة تتحوّل
       * من أربعة أعمدة إلى عمودين إلى عمود، تضع قواعد الحدود خطوطاً في أماكن خاطئة
       * عند التفاف الصف — أما الفجوة فتصيب دائماً لأن الشبكة هي من يرسمها.
       */}
      <div className="grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  );
}

/**
 * خانة مؤشر داخل الشريط. الترتيب مقصود: التسمية صغيرة أولاً، ثم الرقم بأكبر
 * حجم في الخانة، ثم فرقُه عن آخر فحص، ثم سطر السياق. العين تلتقط الرقم أولاً
 * لأنه أكبر شيء، ثم تصعد للتسمية لتعرف ماذا يقيس — وهذا أسرع من العكس.
 *
 * الرقم يُكتب بـ Plex Mono: خاناته متساوية العرض فلا يرقص عرضه أثناء العدّ،
 * ولا تتزحزح الخانة كلها معه.
 */
export function StatCard({
  label,
  value,
  context,
  icon: Icon,
  tone,
  alert,
  trend,
  points
}: {
  label: string;
  value: string | number;
  context: string;
  icon: LucideIcon;
  tone?: "danger" | "success";
  alert?: boolean;
  /** فرق القيمة عن آخر فحص. الإشارة تُرسم أيقونةً ونصاً معاً، لا لوناً وحده. */
  trend?: { delta: string; direction: "up" | "down" | "flat"; good: boolean };
  /** نقاط الاتجاه من الأقدم للأحدث — تُرسم من اليمين لليسار في واجهة RTL. */
  points?: number[];
}) {
  const accent = tone === "danger" ? "var(--danger)" : tone === "success" ? "var(--success)" : "var(--brand)";
  const TrendIcon = trend?.direction === "up" ? ArrowUpRight : trend?.direction === "down" ? ArrowDownRight : Minus;

  return (
    <div className="group relative flex min-h-[176px] flex-col gap-4 bg-gradient-panel p-6">
      {/* خيط الحالة على حافة البداية — للخانة التي تمثل تحذيراً فعلياً فقط */}
      {alert && (
        <span
          aria-hidden
          className="absolute inset-y-6 start-0 w-[2px] rounded-full"
          style={{ background: "var(--danger)" }}
        />
      )}

      <div className="flex items-center gap-2">
        <Icon size={15} strokeWidth={2} aria-hidden className="shrink-0 text-ink-subtle" />
        <span className="font-body text-caption text-ink-muted">{label}</span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div
          className={cx(
            "num font-mono text-metric-sm",
            tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-ink"
          )}
        >
          {/**
           * القيم النصية تُعزل باتجاه LTR: نص مثل «2 / 9» داخل فقرة عربية ينقلب
           * إلى «9 / 2» بقواعد الاتجاه الثنائي، فينقلب معه المعنى.
           */}
          {typeof value === "number" ? (
            <CountUp value={value} />
          ) : (
            <span dir="ltr" className="inline-block">
              {value}
            </span>
          )}
        </div>
        {points && (
          <span className="opacity-70 transition-opacity duration-2 ease-out group-hover:opacity-100">
            <Sparkline points={points} color={accent} width={88} height={28} />
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {/**
         * خانة الاتجاه محجوزة حتى في غياب الاتجاه: بدونها تهبط أسطر السياق في
         * الخانات التي بلا اتجاه وترتفع في غيرها، فيصير أسفل الشريط مسنّناً.
         */}
        <div className="h-[22px]">
          {trend && (
            <span
              className={cx(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-body text-caption",
                trend.direction === "flat"
                  ? "bg-surface-overlay text-ink-muted"
                  : trend.good
                    ? "bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-success"
                    : "bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-danger"
              )}
            >
              <TrendIcon size={13} strokeWidth={2.5} aria-hidden />
              {trend.delta}
            </span>
          )}
        </div>
        {/* ارتفاع سطرين محجوز: سياق من سطر واحد وآخر من سطرين يكسران استواء الشريط */}
        <p className="min-h-[42px] font-body text-body-sm text-ink-muted">{context}</p>
      </div>
    </div>
  );
}
