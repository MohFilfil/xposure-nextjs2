"use client";

import { useEffect, useRef, useState } from "react";
import "./site.css";
import { CHANGES } from "@/lib/data";

/**
 * الصفحة التعريفية العامة لـ Xposure.
 *
 * الفكرة: فتحة العدسة التي يعنيها اسم المنتج (Xposure — التعرّض) تصير الفتحةَ
 * التي يُرى من خلالها نصّ البند المتغيّر. الشكل نفسه يعود قناعاً لكل صورة،
 * وشكلاً لزر الإجراء، ونقطةً أمام عناصر القوائم، وعلامةً على الخط الزمني.
 *
 * الشيء الحيّ: المقارنة. يختار الزائر بنداً فتنفتح الفتحة على نصّه قبل وبعد،
 * ببيانات المنتج الحقيقية (lib/data.ts) لا بنصّ معروض.
 */

const PICK = CHANGES.slice(0, 5);
const DEMO_MAIL =
  "mailto:demo@xposure.local?subject=" +
  encodeURIComponent("طلب عرض توضيحي — Xposure") +
  "&body=" +
  encodeURIComponent("المنشأة:\nالضوابط التي نلتزم بها:\nعدد البنود المتابَعة:\n\nيُفضّل التواصل عبر:");

/** نقاط الألم كما تُسمع من مسؤول امتثال في منشأة صناعية — سؤال وجوابه اليوم. */
const PAINS = [
  {
    q: "متى صدر الإصدار الجديد؟",
    a: "يُنشَر على موقع الجهة بلا إشعار يصلك، ويُكتشَف غالباً من سؤال مدقّق أو من زميل في منشأة أخرى."
  },
  {
    q: "ما الذي تغيّر فعلاً؟",
    a: "مقارنة وثيقتين بمئات الصفحات سطراً سطراً، ومعظم الفروق ترقيم وتنسيق يستهلك الوقت ولا يغيّر التزاماً واحداً."
  },
  {
    q: "من يتأثّر به عندنا؟",
    a: "الربط بين بند تنظيمي ومنتج وعملية وضابط داخلي مخزّن في رؤوس أشخاص وجداول متفرّقة، ويغيب بغيابهم."
  },
  {
    q: "من قرّر، وعلى أي نص؟",
    a: "القرار يُتّخَذ في اجتماع أو رسالة، فلا يبقى منه أثر يقول متى كان، وعلى أي نصّ بُنيَ، وما الدليل الذي سيُعرَض لاحقاً."
  },
  {
    q: "متى يسري؟",
    a: "مواعيد السريان متكدّسة في تواريخ قليلة، ولا تُرى كموجة عمل واحدة إلا قبل أسابيع من استحقاقها."
  }
];

/**
 * الأدوار الخمسة كما تُعرَض لزائر لا يعرف المنتج: اسمه، ثم السؤال الذي
 * تفتح شاشته لأجله، ثم ما يراه فعلاً. تطابق lib/roles.ts في التطبيق.
 */
const ROLES_ON_SITE = [
  {
    name: "مسؤول الامتثال",
    question: "«ما الذي ينتظر قراري اليوم؟»",
    sees: "طابور المراجعة كاملاً: النص قبل وبعد، الأصول المتأثرة، والتوصية. صلاحية الاعتماد والرفض عنده وحده."
  },
  {
    name: "القيادة التنفيذية",
    question: "«أين نقف، وما الذي قد يُحرجنا؟»",
    sees: "درجة الامتثال، البنود الحرجة المفتوحة، ومواعيد السريان القادمة — بلا طابور يومي ولا أزرار قرار."
  },
  {
    name: "مالك العملية أو المنتج",
    question: "«ما المطلوب منّي أنا؟»",
    sees: "مهامه وحدها مرتّبة بالأقرب استحقاقاً، والمنتجات والعمليات التي ستتأثر بتنفيذها."
  },
  {
    name: "المدقّق",
    question: "«من قرّر، ومتى، وبأي دليل؟»",
    sees: "السجل كاملاً والأدلة المرفقة، بلا صلاحية تعديل واحدة — ولا زرّ اعتماد في أي شاشة."
  },
  {
    name: "المسؤول التقني",
    question: "«هل الوكيل يعمل كما يجب؟»",
    sees: "صحة كل مصدر، زمن الدورة، والنموذج العامل بإصداره ونسخة تعليماته — بلا وصول إلى محتوى البنود."
  }
];

/** فتحة العدسة: حلقة مصمتة بفجوة سداسية، تقطعها ست شفرات. الشكل الوحيد في الصفحة. */
function Iris({ className, title }: { className?: string; title?: string }) {
  const R = 100;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 * Math.PI) / 180;
    return [100 + 46 * Math.cos(a), 100 + 46 * Math.sin(a)];
  });
  const hexPath = hex.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ") + " Z";
  const blades = hex.map(([x, y], i) => {
    const a = ((i * 60 + 34) * Math.PI) / 180;
    return [x, y, 100 + R * Math.cos(a), 100 + R * Math.sin(a)];
  });

  return (
    <svg viewBox="0 0 200 200" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path
        d={`M100,0 A100,100 0 1,1 99.99,0 Z ${hexPath}`}
        fill="currentColor"
        fillRule="evenodd"
      />
      {blades.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--s-ground)" strokeWidth="2.6" />
      ))}
    </svg>
  );
}

/** نقطة القائمة بشكل الفتحة نفسها، بمقاس النص. */
function IrisBullet() {
  return (
    <span
      aria-hidden
      className="s-iris-mask"
      style={{ width: 11, height: 11, background: "var(--s-accent)", flexShrink: 0, marginTop: 8 }}
    />
  );
}

export default function SitePage() {
  const root = useRef<HTMLDivElement>(null);
  const [clause, setClause] = useState(0);

  /**
   * الحركة تُركَّب بعد التحميل: الصفحة مكتوبة كاملة في HTML، وإن لم يعمل السكربت
   * ظهر كل شيء في مكانه. الفئة s-ready هي ما يفتح باب الانتقالات.
   */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.classList.add("s-ready");

    const targets = Array.from(el.querySelectorAll<HTMLElement>(".s-rise, .s-shutter"));
    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((t) => t.setAttribute("data-shown", "true"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-shown", "true");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    targets.forEach((t) => io.observe(t));
    /* شبكة أمان: لا يبقى محتوى مخفياً إن تعثّر المراقب */
    const failsafe = setTimeout(() => targets.forEach((t) => t.setAttribute("data-shown", "true")), 1600);
    return () => {
      io.disconnect();
      clearTimeout(failsafe);
    };
  }, []);

  const c = PICK[clause];
  const waves = Array.from(new Set(CHANGES.map((x) => x.effective))).sort();

  return (
    <div className="site" ref={root}>
      {/* ---------- شريط التنقل ---------- */}
      <div className="s-wrap">
        <nav className="s-nav">
          <a href="#top" style={{ fontSize: 27, fontWeight: 700, textDecoration: "none", letterSpacing: "-0.02em" }}>
            Xposure
          </a>
          <div className="s-nav-links">
            <a href="#problem" className="s-nav-hide">
              المشكلة
            </a>
            <a href="#compare">المقارنة</a>
            <a href="#how" className="s-nav-hide">
              كيف يعمل
            </a>
            <a href="#roles" className="s-nav-hide">
              الأدوار
            </a>
            <a href="#isolation" className="s-nav-hide">
              نموذج الثقة
            </a>
            <a href="/login" style={{ fontWeight: 700 }}>
              ادخل العرض
            </a>
          </div>
        </nav>
      </div>

      {/* ---------- الصدارة ---------- */}
      <header className="s-wrap s-hero" id="top">
        <Iris className="s-hero-iris" />
        <div className="s-hero-text">
          <h1 className="s-display s-rise">
            نرصد تغيّر الضوابط
            <br />
            قبل المدقّق.
          </h1>
          <p className="s-lede s-rise" style={{ marginBlockStart: 28, ["--d" as string]: "90ms" }}>
            وكيل يعمل داخل شبكتك، يقارن كل إصدار جديد من ضوابط الهيئة الوطنية للأمن السيبراني بالإصدار الذي تلتزم به،
            ويضع الفرق أمامك بنصّه الحرفي.
          </p>
          <div
            className="s-rise"
            style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBlockStart: 40, ["--d" as string]: "180ms" }}
          >
            <a className="s-btn s-cut" href="/login">
              ادخل العرض التوضيحي
            </a>
            <a className="s-btn-quiet s-cut" href="#compare">
              شاهد المقارنة
            </a>
          </div>
        </div>
      </header>

      {/* ---------- المشكلة ---------- */}
      {/**
       * خمسة أسئلة يعرفها من يعمل في الامتثال، وجوابُ كل سؤال هو الألم نفسه.
       * صفوف عريضة لا بطاقات: السؤال على حافة البداية والجواب يقابله.
       */}
      <section className="s-section" id="problem" style={{ background: "var(--s-field)" }}>
        <div className="s-wrap">
          <h2 className="s-h2 s-rise">الإصدار يُنشَر. وأنت تعرف متأخراً.</h2>
          <p className="s-lede s-rise" style={{ marginBlockStart: 22, maxWidth: "54ch", ["--d" as string]: "80ms" }}>
            لا أحد يتجاهل الامتثال عمداً. لكنّ متابعة وثيقة تتغيّر كل بضع سنوات عملٌ يدوي لا ينتهي،
            وهذا ثمنه اليوم.
          </p>

          <div style={{ marginBlockStart: 56, display: "grid", gap: 10 }}>
            {PAINS.map((x, i) => (
              <div
                key={x.q}
                className="s-rise"
                style={{
                  background: "var(--s-ground)",
                  padding: "clamp(22px, 2.6vw, 34px)",
                  display: "grid",
                  gap: "clamp(10px, 2vw, 44px)",
                  gridTemplateColumns: "minmax(190px, 0.42fr) 1fr",
                  alignItems: "start",
                  ["--d" as string]: `${i * 70}ms`
                }}
              >
                <h3 className="s-h3" style={{ margin: 0 }}>
                  {x.q}
                </h3>
                <p className="s-body" style={{ margin: 0 }}>
                  {x.a}
                </p>
              </div>
            ))}
          </div>

          <p className="s-note s-rise" style={{ marginBlockStart: 28, maxWidth: "64ch" }}>
            والنتيجة واحدة دائماً: يُكتشَف الفرق متأخراً، فيصير عمل أشهر مطلوباً في أسابيع.
          </p>
        </div>
      </section>

      {/* ---------- الشيء الحيّ: المقارنة ---------- */}
      <section className="s-section" id="compare" style={{ background: "var(--s-field)" }}>
        <div className="s-wrap">
          <h2 className="s-h2 s-rise">اختر بنداً. هذا ما تغيّر فيه.</h2>
          <p className="s-body s-rise" style={{ marginBlockStart: 20, ["--d" as string]: "80ms" }}>
            خمسة من اثني عشر بنداً تغيّرت بين <span dir="ltr">ECC‑1:2018</span> و<span dir="ltr">ECC‑2:2024</span>. النص
            أدناه هو نص الهيئة نفسه، لا تلخيصاً له.
          </p>

          <div
            className="s-rise"
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBlockStart: 34, ["--d" as string]: "140ms" }}
          >
            {PICK.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setClause(i)}
                aria-pressed={i === clause}
                className="s-cut"
                style={{
                  padding: "14px 20px",
                  fontSize: 17,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  border: 0,
                  background: i === clause ? "var(--s-accent)" : "var(--s-field-2)",
                  color: i === clause ? "var(--s-on-accent)" : "var(--s-ink)",
                  transition: "background-color 160ms ease, transform 160ms cubic-bezier(.22,1,.36,1)"
                }}
              >
                البند <span className="s-fig">{p.clause}</span>
              </button>
            ))}
          </div>

          <div
            style={{
              marginBlockStart: 40,
              display: "grid",
              gap: 8,
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))"
            }}
          >
            {/* شظية من واجهة المنتج نفسها: النص الجديد ثم السابق، كما تُعرض في التطبيق */}
            <div className="s-ui" data-ui style={{ padding: "clamp(26px, 2.6vw, 40px)" }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--s-accent-text)" }}>
                الإصدار الجديد · <span className="s-fig">{c.docTo}</span>
              </p>
              <p style={{ margin: "20px 0 0", fontSize: "var(--s-diff)", lineHeight: 1.85 }}>
                {c.current.map((seg, i) =>
                  seg.kind === "add" ? (
                    <span key={i} className="s-diff-add">
                      {seg.text}
                    </span>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </p>
            </div>

            <div className="s-ui" data-ui style={{ padding: "clamp(26px, 2.6vw, 40px)" }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--s-ink-dim)" }}>
                الإصدار السابق · <span className="s-fig">{c.docFrom}</span>
              </p>
              <p style={{ margin: "20px 0 0", fontSize: "var(--s-diff)", lineHeight: 1.85 }}>
                {c.previous.length === 0 ? (
                  <span style={{ color: "var(--s-ink-dim)" }}>لا يوجد بند مقابل — هذا متطلب مستحدث بالكامل.</span>
                ) : (
                  c.previous.map((seg, i) =>
                    seg.kind === "del" ? (
                      <span key={i} className="s-diff-del">
                        {seg.text}
                      </span>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    )
                  )
                )}
              </p>
            </div>
          </div>

          <p className="s-note" style={{ marginBlockStart: 22 }}>
            {c.title} · تاريخ السريان <span className="s-fig">{c.effective}</span> · تحقّق الكود من وجود النص حرفياً
            في <span dir="ltr">{c.docTo}</span> صفحة <span className="s-fig">{c.page}</span>.
          </p>
        </div>
      </section>

      {/* ---------- الأرقام ---------- */}
      <section className="s-section">
        <div className="s-wrap">
          <h2 className="s-h2 s-rise">سبعة وأربعون فرقاً. اثنا عشر منها يعنيك.</h2>
          <div
            style={{
              marginBlockStart: 56,
              display: "grid",
              gap: 48,
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
            }}
          >
            {[
              { n: "47", t: "فرقاً نصّياً بين الإصدارين، رصدها محرك المقارنة." },
              { n: "35", t: "فرقاً شكلياً استبعده الكود قبل أن يصل النص إلى النموذج." },
              { n: "12", t: "تغييراً جوهرياً يحتاج قرار مختصّ باسمه." }
            ].map((s, i) => (
              <div key={s.n} className="s-rise" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <p
                  className="s-fig"
                  style={{
                    margin: 0,
                    fontSize: "clamp(72px, 10.5vw, 158px)",
                    lineHeight: 0.9,
                    fontWeight: 500,
                    color: i === 2 ? "var(--s-accent-text)" : "var(--s-ink)"
                  }}
                >
                  {s.n}
                </p>
                <p className="s-body" style={{ marginBlockStart: 14, maxWidth: "24ch" }}>
                  {s.t}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- لوحة البنود ---------- */}
      <section className="s-section" style={{ paddingBlockStart: 0 }}>
        <div className="s-wrap">
          <div className="s-tiles s-rise">
            <div className="s-tile s-tile-head">
              <h2 className="s-h2" style={{ fontSize: "clamp(27px, 3.2vw, 54px)", lineHeight: 1.08 }}>
                اثنا عشر بنداً
                <br />
                تغيّر جوهرياً
              </h2>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                بين <span dir="ltr">ECC‑1:2018</span> و<span dir="ltr">ECC‑2:2024</span>
              </p>
            </div>
            {/**
             * فقرة واحدة في كل مربّع: المخطط يضع الاسم كبيراً أعلى اليمين حين لا
             * توجد شعارات. ووجود سطر صغير ثانٍ يجعل نهاية مربّعٍ تسبق عنوان الذي
             * يليه، فتُقرأ كأنها تسمية فوقية (eyebrow) — وهي ممنوعة.
             */}
            {CHANGES.slice(0, 9).map((x) => (
              <div key={x.id} className="s-tile">
                <p className="s-tile-title">{x.title}</p>
              </div>
            ))}
            <a className="s-tile" href="/login" style={{ background: "var(--s-field-2)" }}>
              <p className="s-tile-title">
                <span className="s-fig">+3</span> أخرى. افتح القائمة كاملة ←
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* ---------- الشريط: المواعيد متكدّسة ---------- */}
      <section className="s-section s-field-accent">
        <div className="s-wrap">
          <h2 className="s-h2 s-rise">مواعيدك ليست موزّعة. إنها متكدّسة.</h2>
          <p className="s-body s-rise" style={{ marginBlockStart: 20, ["--d" as string]: "80ms" }}>
            اثنا عشر بنداً تستحق في ثلاثة تواريخ فقط. سبعة منها في اليوم نفسه، وتلك موجة عمل واحدة لا سبعة مواعيد.
          </p>
          <div
            className="s-rise"
            style={{
              marginBlockStart: 56,
              display: "grid",
              gap: 32,
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              ["--d" as string]: "160ms"
            }}
          >
            {waves.map((d) => {
              const n = CHANGES.filter((x) => x.effective === d).length;
              return (
                <div key={d} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <span
                    className="s-iris-mask"
                    aria-hidden
                    style={{
                      width: 26 + n * 7,
                      height: 26 + n * 7,
                      background: "var(--s-on-accent)",
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <p className="s-fig" style={{ margin: 0, fontSize: 27, fontWeight: 700 }} dir="ltr">
                      {d}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 17, fontWeight: 700 }}>
                      {n === 1 ? "بند واحد يستحق" : n === 2 ? "بندان يستحقّان" : `${n} بنود تستحق`} في هذا اليوم
                    </p>
                    {/* أسماء البنود نفسها: الشريط يحمل معلومة لا علامة */}
                    <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0, display: "grid", gap: 7 }}>
                      {CHANGES.filter((x) => x.effective === d)
                        .slice(0, 4)
                        .map((x) => (
                          <li key={x.id} style={{ fontSize: 15, lineHeight: 1.45, fontWeight: 500 }}>
                            {x.title}
                          </li>
                        ))}
                      {n > 4 && (
                        <li style={{ fontSize: 15, fontWeight: 700 }}>
                          <span className="s-fig">+{n - 4}</span> أخرى
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- كيف يعمل ---------- */}
      <section className="s-section" id="how">
        <div className="s-wrap">
          <h2 className="s-h2 s-rise">خمس مراحل. آخرتُها توقّف.</h2>
          <p className="s-body s-rise" style={{ marginBlockStart: 20, maxWidth: "58ch", ["--d" as string]: "80ms" }}>
            الوكيل يمرّ بالمراحل نفسها في كل دورة، ويقف عند الخامسة دائماً: لا يعتمد بنداً، ولا يعتبر متطلباً
            مستوفى، ولا يعدّل ملفاً واحداً في المنشأة.
          </p>

          {/**
           * ثلاثة صفوف عريضة لا ثلاث بطاقات متطابقة: صفّ البطاقات هو الشكل الذي
           * تصل إليه كل صفحة بلا قرار. هنا الاسم كبير على حافة البداية، والشرح
           * يقابله، والصورة تخصّ الخطوة الأولى وحدها.
           */}
          <div style={{ marginBlockStart: 56, display: "grid", gap: 10 }}>
            <div
              className="s-rise"
              style={{
                background: "var(--s-field)",
                display: "grid",
                gap: "clamp(24px, 4vw, 64px)",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                alignItems: "center"
              }}
            >
              <div style={{ padding: "clamp(28px, 3.4vw, 52px)" }}>
                <p className="s-note" style={{ margin: "0 0 10px" }}>
                  المرحلة <span className="s-fig">1</span> من <span className="s-fig">5</span>
                </p>
                <h3 className="s-h3">الجلب</h3>
                <p className="s-body" style={{ marginBlockStart: 14 }}>
                  يفحص صفحات الجهات كل صباح عند الخامسة، ويحفظ الملف الخام كما نُشر مع بصمته. لا إصدار جديد يمرّ دون أن
                  يُسجَّل وقت رصده.
                </p>
              </div>
              <img
                src="/site/skyline.jpg"
                width={1920}
                height={1080}
                alt="أفق مدينة الرياض قبيل الفجر."
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "clamp(220px, 26vw, 330px)", objectFit: "cover", display: "block" }}
              />
            </div>

            {[
              {
                h: "المقارنة",
                b: "يستبعد الكود الفروق الشكلية، ترقيماً وتنسيقاً ومسافات، قبل أن يصل النص إلى النموذج، فلا يُستهلك حكم بشري على فاصلة."
              },
              {
                h: "تحليل الأثر",
                b: "كل فرق جوهري يُربط بما يمسّه فعلاً: المنتجات، وخطوط العمليات، والضوابط الداخلية المقابلة له — فالقرار لا يُتّخَذ على نصّ مجرّد."
              },
              {
                h: "فحص الاستشهاد",
                b: "يتحقّق الكود — لا النموذج — من وجود كل نص مقتبس حرفياً في الملف الخام المحفوظ. ما لم يُنشَر لا يُعرَض."
              },
              {
                h: "ثم تقرّر أنت",
                b: "يتوقّف الوكيل هنا وينتظر. الاعتماد يُنشئ مهمة باسم مالكها وموعدها، والرفض يحتاج سبباً مكتوباً — وكلاهما يُكتب باسمك في سجل لا يقبل التعديل."
              }
            ].map((x, i) => (
              <div
                key={x.h}
                className="s-rise"
                style={{
                  /* الصفّ الأخير بحقل اللكنة: يكسر تكرار الصفّين، ويُبرز أهمّ دعاوى الصفحة */
                  background: i === 3 ? "var(--s-accent)" : "var(--s-field)",
                  color: i === 3 ? "var(--s-on-accent)" : undefined,
                  padding: "clamp(28px, 3.4vw, 52px)",
                  display: "grid",
                  gap: "clamp(16px, 3vw, 56px)",
                  gridTemplateColumns: i === 3 ? "1fr" : "minmax(150px, 0.4fr) 1fr",
                  alignItems: "start",
                  ["--d" as string]: `${(i + 1) * 90}ms`
                }}
              >
                <div>
                  <p className="s-note" style={{ margin: "0 0 10px", color: i === 3 ? "var(--s-on-accent)" : undefined }}>
                    المرحلة <span className="s-fig">{i + 2}</span> من <span className="s-fig">5</span>
                  </p>
                  <h3 className={i === 3 ? "s-h2" : "s-h3"}>{x.h}</h3>
                </div>
                <p
                  className={i === 3 ? undefined : "s-body"}
                  style={i === 3 ? { fontSize: 21, maxWidth: "46ch", lineHeight: 1.55, margin: 0 } : undefined}
                >
                  {x.b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- الأدوار ---------- */}
      {/**
       * تطبيق واحد لخمسة أدوار: كل دور يُعرَف بسؤاله الأول لا بمسمّاه الوظيفي،
       * لأن المسمّى يختلف بين منشأة وأخرى، والسؤال واحد.
       */}
      <section className="s-section" id="roles">
        <div className="s-wrap">
          <h2 className="s-h2 s-rise">خمسة أدوار. شاشة لكل سؤال.</h2>
          <p className="s-body s-rise" style={{ marginBlockStart: 20, maxWidth: "58ch", ["--d" as string]: "80ms" }}>
            لا خمسة أنظمة ولا خمس نسخ: تطبيق واحد يعرض لكل دور ما يخصّه، ويمنع عنه ما لا يملكه.
            صلاحية الاعتماد عند دور واحد — وهذا ما يجعل لسجل التدقيق معنى.
          </p>

          <div
            style={{
              marginBlockStart: 56,
              display: "grid",
              gap: 10,
              /* خمسة أعمدة على العريض: بطاقة وحيدة في صفّ ثانٍ تترك مساحة ميتة بعرض أربع بطاقات */
              gridTemplateColumns: "repeat(auto-fit, minmax(214px, 1fr))"
            }}
          >
            {ROLES_ON_SITE.map((r, i) => (
              <div
                key={r.name}
                className="s-rise"
                style={{
                  background: i === 0 ? "var(--s-accent)" : "var(--s-field)",
                  color: i === 0 ? "var(--s-on-accent)" : undefined,
                  padding: "clamp(24px, 2.6vw, 36px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  minHeight: 232,
                  ["--d" as string]: `${i * 70}ms`
                }}
              >
                <h3 className="s-h3" style={{ margin: 0 }}>
                  {r.name}
                </h3>
                <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, fontWeight: 600 }}>{r.question}</p>
                <p className={i === 0 ? undefined : "s-body"} style={{ margin: "auto 0 0", fontSize: 15, lineHeight: 1.6 }}>
                  {r.sees}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- العزل ---------- */}
      <section className="s-section s-field" id="isolation">
        <div className="s-wrap">
          <div
            style={{
              display: "grid",
              gap: "clamp(40px, 5vw, 80px)",
              gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
              alignItems: "center"
            }}
          >
            <div>
              <p className="s-note s-rise" style={{ margin: "0 0 14px" }}>
                نموذج الثقة
              </p>
              <h2 className="s-h2 s-rise">لا يخرج نصّ واحد من شبكتك.</h2>
              <p className="s-body s-rise" style={{ marginBlockStart: 22, ["--d" as string]: "80ms" }}>
                النماذج تعمل على أجهزتك أنت: <span dir="ltr">Qwen2.5 14B</span> محلياً. لا مفتاح لمزوّد خارجي، ولا نسخة
                من وثائقك على خادم لا تملكه.
              </p>
              <ul
                className="s-rise"
                style={{ listStyle: "none", margin: "32px 0 0", padding: 0, display: "grid", gap: 16, ["--d" as string]: "160ms" }}
              >
                {[
                  "نماذج محلية: النموذج يعمل على عتاد المنشأة، بلا مفتاح مزوّد خارجي ولا استدعاء سحابي.",
                  "قراءة فقط افتراضاً: لا يعدّل الوكيل ملفاً ولا سياسة، وأي صلاحية كتابة تُمنح صراحةً وتُسجّل.",
                  "موافقة بشرية قبل أي أثر: لا مهمة تُنشَأ ولا بند يُغلَق إلا بقرار مختصّ مسجّل باسمه.",
                  "لا شيء يغادر المنشأة: الوثائق والسجلات والقرارات تبقى داخل المحيط، والجلب وحده يخرج إلى ما نُشر علناً.",
                  "سجل تدقيق لا يقبل التعديل ولا الحذف، وأي تغيير قرار يُسجَّل قراراً جديداً فوقه.",
                  "النموذج يشرح سبب الأولوية ولا يحسب درجتها؛ الدرجة معادلة ثابتة يمكن مراجعتها."
                ].map((t) => (
                  <li key={t} style={{ display: "flex", gap: 14 }}>
                    <IrisBullet />
                    <span style={{ fontSize: 17, lineHeight: 1.6 }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* الصورة تُرى من خلال الفتحة، وتنفتح عليها الحركة التوقيعية */}
            <figure style={{ margin: 0 }}>
              <div className="s-shutter s-iris-mask" style={{ overflow: "hidden" }}>
                <img
                  src="/site/datacenter.jpg"
                  width={1920}
                  height={1280}
                  alt="صفوف من خزائن الخوادم داخل مركز بيانات، تُرى من ممر التبريد."
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "clamp(300px, 38vw, 480px)", objectFit: "cover", display: "block" }}
                />
              </div>
              <figcaption className="s-note" style={{ marginBlockStart: 14 }}>
                مركز بيانات: صورة توضّح بيئة التشغيل، وليست منشأة عميل.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------- الأصول المتأثرة ---------- */}
      <section className="s-section">
        <div className="s-wrap">
          <div
            style={{
              display: "grid",
              gap: "clamp(40px, 5vw, 80px)",
              gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
              alignItems: "center"
            }}
          >
            <figure style={{ margin: 0, order: 1 }}>
              <div className="s-iris-mask" style={{ overflow: "hidden" }}>
                <img
                  src="/site/board.png"
                  width={3000}
                  height={1600}
                  alt="لوحة دوائر مطبوعة: مخطط التصميم إلى يمين الصورة واللوحة المصنّعة إلى يسارها."
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%",
                    height: "clamp(280px, 34vw, 420px)",
                    objectFit: "cover",
                    objectPosition: "75% 50%",
                    display: "block"
                  }}
                />
              </div>
              <figcaption className="s-note" style={{ marginBlockStart: 14 }}>
                لوحة دوائر مطبوعة: صورة لعالم الأصول التي تحكمها الضوابط.
              </figcaption>
            </figure>
            <div>
              <h2 className="s-h2 s-rise">البند يتحوّل إلى قائمة أصول.</h2>
              <p className="s-body s-rise" style={{ marginBlockStart: 22, ["--d" as string]: "80ms" }}>
                كل تغيير مرتبط بما يمسّه فعلاً داخل المنشأة: المنتجات، وخطوط العمليات، والضوابط الداخلية المقابلة له.
                فالقرار لا يُتخذ على نصّ مجرّد، بل على ما سيتغيّر في الأرض.
              </p>
              <p className="s-note s-rise" style={{ marginBlockStart: 20, ["--d" as string]: "140ms" }}>
                مثال من بند التشفير <span className="s-fig">2‑3‑3‑1</span>: ثلاثة منتجات، وعمليتان، وضابطان
                داخليان.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- الدعوة ---------- */}
      <section className="s-section" style={{ position: "relative", overflow: "hidden" }}>
        <img
          src="/site/riyadh.jpg"
          width={1920}
          height={1280}
          alt="أبراج مركز الملك عبدالله المالي في الرياض ليلاً."
          loading="lazy"
          decoding="async"
          className="s-drift"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.4,
            zIndex: 0
          }}
        />
        <div className="s-wrap" style={{ position: "relative", zIndex: 1 }}>
          <h2 className="s-display s-rise" style={{ maxWidth: "16ch" }}>
            ادخل العرض بالدور الذي يعنيك.
          </h2>
          <p className="s-lede s-rise" style={{ marginBlockStart: 26, ["--d" as string]: "80ms" }}>
            خمسة حسابات جاهزة، حساب لكل دور، بلا كلمة مرور: ادخل كمسؤول امتثال فترى التدفّق كاملاً،
            أو كمدقّق فترى الشاشة نفسها بلا زر قرار واحد.
          </p>
          <div
            className="s-rise"
            style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBlockStart: 40, ["--d" as string]: "160ms" }}
          >
            <a className="s-btn s-cut" href="/login">
              ادخل العرض التوضيحي
            </a>
            <a className="s-btn-quiet s-cut" href={DEMO_MAIL}>
              اطلب عرضاً على ضوابطك
            </a>
          </div>
        </div>
      </section>

      {/* ---------- التذييل ---------- */}
      <footer style={{ background: "var(--s-field)", paddingBlock: "clamp(60px, 8vw, 110px) 40px" }}>
        <div className="s-wrap">
          <p
            style={{
              margin: 0,
              fontSize: "clamp(56px, 15vw, 210px)",
              lineHeight: 0.84,
              fontWeight: 700,
              letterSpacing: "-0.03em"
            }}
          >
            Xposure
          </p>
          <div
            style={{
              marginBlockStart: 48,
              display: "flex",
              flexWrap: "wrap",
              gap: 28,
              justifyContent: "space-between",
              alignItems: "flex-end"
            }}
          >
            <p className="s-body" style={{ maxWidth: "40ch" }}>
              رصد التغيّر التنظيمي وإدارة الامتثال، داخل المنشأة.{" "}
              <a href="/login" style={{ color: "var(--s-accent-text)", fontWeight: 600 }}>
                ادخل إلى العرض التوضيحي
              </a>
            </p>
            <p className="s-note" style={{ maxWidth: "62ch" }}>
              الصور:{" "}
              <a href="https://commons.wikimedia.org/wiki/File:Cern_datacenter.jpg">«Cern datacenter»</a> لـ
              Hugovanmeijeren، <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>؛{" "}
              <a href="https://commons.wikimedia.org/wiki/File:King_Abdullah_Financial_District_(KAFD),_Riyadh,_Saudi_Arabia,_2026.jpg">
                «King Abdullah Financial District, Riyadh»
              </a>
              ، <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>؛{" "}
              <a href="https://commons.wikimedia.org/wiki/File:PCB_design_and_realisation_smt_and_through_hole.png">
                «PCB design and realisation»
              </a>{" "}
              لـ Mike1024، <a href="https://creativecommons.org/publicdomain/mark/1.0/">ملكية عامة</a>؛{" "}
              <a href="https://commons.wikimedia.org/wiki/File:Riyadh_Skyline.jpg">«Riyadh Skyline»</a> لـ B.alotaby،{" "}
              <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>، عبر Wikimedia Commons.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
