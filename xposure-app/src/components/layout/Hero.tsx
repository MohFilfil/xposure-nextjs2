import { cx } from "@/lib/utils";

/**
 * صدارة الشاشة. هذا هو الفرق بين لوحة تحكّم ولوحة أرقام: الشاشة لا تُفتتح بعنوان
 * الصفحة («لوحة التحكم») — فالمستخدم يعرف أين هو — بل بجواب سؤاله الفعلي:
 * ما الذي يحتاج قراري الآن، وكم بقي من الوقت؟
 *
 * لذلك العنوان هنا جملة خبرية مبنية من البيانات نفسها، لا تسمية ثابتة. والرقم
 * الذي تدور حوله الجملة يُكتب بأكبر حجم في النظام — لأنه المعلومة، وما حوله شرح لها.
 *
 * الهالة خلفه هي مصدر الضوء الوحيد في الصفحة ولا تتكرر في قسم ثانٍ؛ تكرارها
 * يُلغي كونها صدارة.
 */
export function Hero({
  eyebrow,
  headline,
  lede,
  actions,
  aside,
  facts
}: {
  eyebrow?: React.ReactNode;
  headline: React.ReactNode;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  /** شريط الحقائق السفلي: أرقام مساندة تُقرأ بعد الجملة لا قبلها. */
  facts?: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <section className="relative -mx-4 -mt-5 overflow-hidden px-4 pb-10 pt-8 md:-mx-6 md:px-6 xl:-mx-12 xl:-mt-8 xl:px-12 xl:pb-12 xl:pt-12">
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-hero" />
      {/* خيط يغلق الصدارة من الأسفل ويفصلها عمّا بعدها بلا حدّ صلب */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: "var(--edge-top)" }}
      />

      {/**
        * الفجوة بين الجملة واللوح الجانبي كانت 64px فوق عمود نصّ محدود بـ 62ch،
        * فتترك في منتصف الصدارة فراغاً بعرض بطاقة كاملة على شاشة 1366. العمود
        * صار ينمو حتى 70ch والفجوة 40px: الجملة تملأ مكانها، واللوح يبقى ملتصقاً
        * بحافة النهاية — بلا فراغ بينهما يُقرأ كخطأ تخطيط.
        */}
      <div className="relative flex flex-col items-start gap-10 xl:flex-row xl:items-center xl:justify-between xl:gap-10">
        <div className="min-w-0 max-w-[70ch] flex-1 animate-fade-up">
          {eyebrow && <div className="mb-5 flex flex-wrap items-center gap-2">{eyebrow}</div>}

          <h1 className="font-display text-display-lg text-ink md:text-display-xl">{headline}</h1>

          {lede && <p className="mt-5 font-body text-body-lg text-ink-muted">{lede}</p>}

          {actions && <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">{actions}</div>}
        </div>

        {aside && <div className="shrink-0 animate-fade-up [animation-delay:120ms]">{aside}</div>}
      </div>

      {facts && facts.length > 0 && (
        <dl className="relative mt-10 flex flex-wrap items-start gap-x-10 gap-y-5 border-t border-hairline pt-6 xl:mt-12">
          {facts.map((f, i) => (
            <div key={f.label} className={cx("animate-fade-up")} style={{ animationDelay: `${160 + i * 60}ms` }}>
              <dt className="font-body text-caption text-ink-subtle">{f.label}</dt>
              <dd className="mt-1 font-mono text-metric-sm text-ink num">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/**
 * الرقم داخل جملة الصدارة. يُكتب بخط Plex Mono لأن أرقامه جدولية ومحايدة —
 * الرقم هنا قياس لا كلمة، ويجب أن يُقرأ كقراءة عدّاد لا كجزء من النص.
 */
export function HeroFigure({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "danger" | "success" }) {
  return (
    <span
      className={cx(
        "num font-mono text-metric-xl align-baseline",
        tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-brand"
      )}
    >
      {children}
    </span>
  );
}
