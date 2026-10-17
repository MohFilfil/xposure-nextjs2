"use client";

import { useEffect, useRef, useState } from "react";
import "./site.css";
import { useI18n } from "@/components/I18nProvider";
import { useContent } from "@/lib/content";

/**
 * الصفحة التعريفية العامة.
 *
 * الاتجاه: «النوع ولا شيء غيره». الشاشة الأولى كلمات وحدها — بلا صورة وبلا شكل —
 * والصور تأتي بعدها كبيرة وقليلة، وكلها صور حقيقية لعالم هذا المنتج (لوحة دوائر،
 * مجهر على عطل، غرفة خوادم، الرياض) مع نسبتها في التذييل.
 *
 * الفكرة: نصّ الضابط كما نشرته الجهة هو مادة الصفحة. ما يبيعه هذا المنتج ليس
 * لوحة معلومات بل الكلمات التي تغيّرت في وثيقة مُلزِمة — فالصفحة تعرض تلك الكلمات
 * نفسها، بخطّ كبير، مأخوذة من بيانات المنتج (lib/data.ts) لا من نصّ معروض.
 *
 * الشيء الحيّ: الزائر يختار رقم بند فيقرأ نصّه قبل وبعد، مع سطر الاستشهاد الذي
 * يقول من أي وثيقة وأي صفحة — وهو ما يفعله مسؤول الامتثال في التطبيق نفسه.
 */

/** الصور: كلها من مجموعات مفتوحة، منسوبة في التذييل، ولا تُقدَّم على أنها منشأة عميل. */
const PICTURES = {
  microscope: "/site/microscope.jpg",
  operator: "/site/operator.jpg",
  skyline: "/site/skyline.jpg",
  board: "/site/board.png",
  datacenter: "/site/datacenter.jpg",
  kafd: "/site/riyadh.jpg"
};

export default function SitePage() {
  const root = useRef<HTMLDivElement>(null);
  const { t, lang, setLang } = useI18n();
  const { changes } = useContent();
  const s = t.site2;

  const picks = changes.slice(0, 5);
  const [clause, setClause] = useState(0);
  const c = picks[clause] ?? picks[0];

  /** الجملة الكبيرة في قسم العزل: عنصر واحد مضيء في كل لحظة، يتنقّل كل ثانيتين. */
  const [lit, setLit] = useState(0);
  const guarantees = t.site.trustPoints;

  useEffect(() => {
    const id = setInterval(() => setLit((i) => (i + 1) % guarantees.length), 2000);
    return () => clearInterval(id);
  }, [guarantees.length]);

  /**
   * الحركة تُركَّب بعد التحميل: الصفحة مكتوبة كاملة في HTML، وإن لم يعمل السكربت
   * ظهر كل شيء في مكانه. الفئة s-ready وحدها هي ما يفتح باب الانتقالات.
   */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.classList.add("s-ready");

    const targets = Array.from(el.querySelectorAll<HTMLElement>(".s-rise, .s-mask"));
    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((x) => x.setAttribute("data-shown", "true"));
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    /**
     * ما يقع في الشاشة الأولى يتحرّك عند التحميل لا عند التمرير: المراقب لا يُطلق
     * لما هو ظاهر أصلاً إلا بعد دورة، فكانت جملة الصدارة وزرّها يغيبان عن أول لقطة.
     */
    targets.forEach((x) => {
      if (x.getBoundingClientRect().top < window.innerHeight * 0.9) x.setAttribute("data-shown", "true");
      else io.observe(x);
    });
    /* شبكة أمان: لا يبقى محتوى مخفياً إن تعثّر المراقب */
    const failsafe = setTimeout(() => targets.forEach((x) => x.setAttribute("data-shown", "true")), 1800);
    return () => {
      io.disconnect();
      clearTimeout(failsafe);
    };
  }, [lang]);

  const stairs = [
    { q: s.q1, a: s.a1 },
    { q: s.q2, a: s.a2 },
    { q: s.q3, a: s.a3 },
    { q: s.q4, a: s.a4 },
    { q: s.q5, a: s.a5 }
  ];

  const stages = [s.stage1, s.stage2, s.stage3, s.stage4, s.stage5];

  /** صفوف الإيصال تجمع فعلاً: 47 = 12 + 35، و12 = 4 + 3 + 3 + 2. */
  const byPriority = (p: string) => changes.filter((x) => x.priority === p).length;
  const kept = changes.length;

  return (
    <div className="site" ref={root} dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* ---------- الشاشة الأولى: الترويسة والجملة والفعل في 100svh واحدة ---------- */}
      <header className="s-wrap s-hero" id="top">
        <nav className="s-nav">
          <a href="#top" style={{ fontSize: 24, fontWeight: 700, textDecoration: "none", letterSpacing: "-0.02em" }}>
            Xposure
          </a>
          <div className="s-nav-links">
            <a href="#clause" className="s-nav-hide">
              {s.navCompare}
            </a>
            <a href="#how" className="s-nav-hide">
              {s.navHow}
            </a>
            <a href="#isolation" className="s-nav-hide">
              {s.navTrust}
            </a>
            <button type="button" onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
              {lang === "ar" ? "English" : "العربية"}
            </button>
            <a href="/login" style={{ color: "var(--s-ink)", fontWeight: 700 }}>
              {s.navEnter}
            </a>
          </div>
        </nav>

        <h1 className="s-display s-hero-statement">
          <span className="s-mask">
            <span>{s.heroLine1}</span>
          </span>
          <span className="s-mask" style={{ ["--d" as string]: "110ms" }}>
            <span>{s.heroLine2}</span>
          </span>
        </h1>

        <div className="s-hero-foot">
          <p className="s-body s-rise" style={{ maxWidth: "46ch", ["--d" as string]: "320ms" }}>
            {s.heroNote}
          </p>
          <a className="s-btn s-rise" href="/login" style={{ ["--d" as string]: "400ms" }}>
            {s.heroAction}
          </a>
        </div>
      </header>

      {/* ---------- المشكلة: سلّم من خمسة أسئلة، وصورتان في الربع الأخير ---------- */}
      <section className="s-section s-field">
        <div className="s-wrap">
          <div className="s-problem">
            <div>
              <p className="s-note s-rise" style={{ marginBottom: "clamp(28px, 3.4vw, 48px)", maxWidth: "48ch" }}>
                {s.stairsNote}
              </p>

              <div className="s-stairs">
                {stairs.map((x, i) => (
                  <div key={x.q} className="s-stair s-rise" style={{ ["--d" as string]: `${i * 70}ms` }}>
                    <q>{x.q}</q>
                    <p>{x.a}</p>
                  </div>
                ))}
              </div>

              <p className="s-mid s-rise" style={{ marginTop: "clamp(40px, 5vw, 80px)", maxWidth: "34ch" }}>
                {s.stairsFoot}
              </p>
            </div>

            {/* صورتان مكدّستان، أعلاهما محاذية لأول سطر في السلّم */}
            <figure className="s-figure s-rise" style={{ ["--d" as string]: "200ms" }}>
              <img
                src={PICTURES.microscope}
                width={1920}
                height={1440}
                alt={lang === "ar" ? "مكوّن محترق على لوحة دوائر مطبوعة تحت المجهر." : "A burnt component on a printed circuit board under a microscope."}
                loading="lazy"
                decoding="async"
                className="s-shot"
                style={{ aspectRatio: "3 / 2" }}
              />
              <img
                src={PICTURES.operator}
                width={1365}
                height={2048}
                alt={
                  lang === "ar"
                    ? "محطة عمل مشغّل داخل مركز معالجة بيانات، وخلفها خزائن الخوادم."
                    : "An operator's workstation inside a data processing centre, server cabinets behind it."
                }
                loading="lazy"
                decoding="async"
                className="s-shot"
                style={{ aspectRatio: "3 / 2" }}
              />
            </figure>
          </div>
        </div>
      </section>

      {/* ---------- الشيء الحيّ: اقرأ الضابط كما نُشر ---------- */}
      <section className="s-section" id="clause">
        <div className="s-wrap">
          <h2 className="s-big s-rise" style={{ maxWidth: "20ch" }}>
            {s.pickHeading}
          </h2>
          <p className="s-note s-rise" style={{ marginTop: 18, maxWidth: "54ch", ["--d" as string]: "80ms" }}>
            {s.pickNote}
          </p>

          {/* سطر البند هو عنوان القسم، وأرقام البنود أزرار حقيقية تغيّره */}
          <div className="s-clause-line s-rise" style={{ marginTop: "clamp(34px, 4vw, 60px)", ["--d" as string]: "140ms" }}>
            {picks.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="s-clause-pick s-fig"
                aria-pressed={i === clause}
                onClick={() => setClause(i)}
              >
                <bdi dir="ltr">{p.clause}</bdi>
              </button>
            ))}
          </div>

          <p className="s-mid s-rise" style={{ marginTop: 22, maxWidth: "40ch", ["--d" as string]: "180ms" }}>
            {c.title}
          </p>

          {/* الجواب بمقاس الواجهة الحقيقي — هذا جزء من المنتج نفسه */}
          <div className="s-answer s-rise" data-ui style={{ ["--d" as string]: "220ms" }}>
            <div className="s-text-row">
              <div className="s-text-cell" data-kind="after">
                <p className="s-text-label">
                  {s.after} · <bdi dir="ltr">{c.docTo}</bdi>
                </p>
                <p className="s-text-body">
                  {c.current.map((seg, i) =>
                    seg.kind === "add" ? (
                      <mark key={i} className="s-add">
                        {seg.text}
                      </mark>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    )
                  )}
                </p>
              </div>

              <div className="s-text-cell">
                <p className="s-text-label">
                  {s.before} · <bdi dir="ltr">{c.docFrom}</bdi>
                </p>
                <p className="s-text-body">
                  {c.previous.length === 0 ? (
                    <span style={{ color: "var(--s-ink-dim)" }}>{s.noPrevious}</span>
                  ) : (
                    c.previous.map((seg, i) =>
                      seg.kind === "del" ? (
                        <mark key={i} className="s-del">
                          {seg.text}
                        </mark>
                      ) : (
                        <span key={i}>{seg.text}</span>
                      )
                    )
                  )}
                </p>
              </div>
            </div>

            <p className="s-small">
              {s.citationLine} <bdi dir="ltr">{c.docTo}</bdi> · {s.pageWord}{" "}
              <bdi dir="ltr" className="s-fig">
                {c.page}
              </bdi>{" "}
              · {s.effective}{" "}
              <bdi dir="ltr" className="s-fig">
                {c.effective}
              </bdi>
            </p>
          </div>
        </div>
      </section>

      {/* ---------- صورة واحدة كبيرة بين قسمين من النص ---------- */}
      <section aria-hidden style={{ height: "clamp(320px, 54svh, 620px)", overflow: "hidden" }}>
        <img
          src={PICTURES.skyline}
          width={1920}
          height={1080}
          alt=""
          loading="lazy"
          decoding="async"
          className="s-shot s-drift"
        />
      </section>

      {/* ---------- الإجمالي وإيصاله ---------- */}
      <section className="s-section s-field">
        <div className="s-wrap s-total-row">
          <div>
            <h2 className="s-big s-rise" style={{ maxWidth: "18ch" }}>
              {s.receiptHeading}
            </h2>
            <p className="s-note s-rise" style={{ marginTop: 16, maxWidth: "46ch", ["--d" as string]: "80ms" }}>
              {s.receiptNote}
            </p>
            <p className="s-total s-fig s-rise" style={{ marginTop: "clamp(48px, 8vw, 150px)", ["--d" as string]: "140ms" }}>
              <bdi dir="ltr">{kept}</bdi>
            </p>
            <p className="s-body s-rise" style={{ maxWidth: "30ch", ["--d" as string]: "200ms" }}>
              {s.receiptTotalCaption}
            </p>
          </div>

          {/* الإيصال: قيمه تجمع فعلاً إلى الرقم الكبير */}
          <div className="s-slip s-rise" style={{ ["--d" as string]: "260ms" }}>
            <p className="s-slip-title">{s.receiptSlipTitle}</p>

            <p className="s-slip-group">{s.receiptGroupRaw}</p>
            <Row label={s.receiptRaw} value="47" />

            <p className="s-slip-group">{s.receiptGroupDropped}</p>
            <Row label={s.receiptNumbering} value="18" />
            <Row label={s.receiptFormat} value="11" />
            <Row label={s.receiptWording} value="6" />

            <p className="s-slip-group">{s.receiptGroupKept}</p>
            <Row label={s.receiptCritical} value={String(byPriority("critical"))} />
            <Row label={s.receiptStrategic} value={String(byPriority("strategic"))} />
            <Row label={s.receiptQuick} value={String(byPriority("quick"))} />
            <Row label={s.receiptWatch} value={String(byPriority("watch"))} />

            <p className="s-slip-total">
              <span>{s.receiptTotalRow}</span>
              <bdi dir="ltr" className="s-fig">
                {kept}
              </bdi>
            </p>
          </div>
        </div>
      </section>

      {/* ---------- المراحل: سطر لكل مرحلة، والأخيرة توقّف ---------- */}
      <section className="s-section" id="how">
        <div className="s-wrap">
          <h2 className="s-mid s-rise" style={{ marginBottom: "clamp(34px, 4vw, 60px)", color: "var(--s-ink-dim)" }}>
            {s.stagesHeading}
          </h2>
          <div className="s-steps">
            {stages.map((line, i) => (
              <p key={line} className="s-step s-rise" style={{ ["--d" as string]: `${i * 80}ms` }}>
                {line}
              </p>
            ))}
          </div>
          <p className="s-body s-rise" style={{ marginTop: "clamp(44px, 6vw, 96px)", maxWidth: "62ch", color: "var(--s-ink-dim)" }}>
            {s.stagesFoot}
          </p>
        </div>
      </section>

      {/* ---------- الأصول التي تحكمها هذه الضوابط ---------- */}
      <section aria-hidden style={{ height: "clamp(300px, 48svh, 560px)", overflow: "hidden" }}>
        <img
          src={PICTURES.board}
          width={3000}
          height={1600}
          alt=""
          loading="lazy"
          decoding="async"
          className="s-shot"
          style={{ objectPosition: "72% 50%" }}
        />
      </section>

      {/* ---------- الأدوار: عنوان مثبّت وصفوف تمرّ ---------- */}
      <section className="s-section s-field" id="roles">
        <div className="s-wrap s-roles">
          <div className="s-roles-head">
            <h2 className="s-big s-rise" style={{ maxWidth: "12ch" }}>
              {s.rolesHeading}
            </h2>
            <p className="s-note s-rise" style={{ marginTop: 16, maxWidth: "34ch", ["--d" as string]: "80ms" }}>
              {s.rolesNote}
            </p>
          </div>

          <div>
            {t.site.roleCards.map((r, i) => (
              <div key={r.name} className="s-role s-rise" data-lit={i === 0 ? "true" : "false"} style={{ ["--d" as string]: `${i * 60}ms` }}>
                <h3 className="s-role-name">{r.name}</h3>
                <p className="s-role-q">{r.question}</p>
                <p className="s-role-sees">{r.sees}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- أين يعمل ---------- */}
      <section aria-hidden style={{ height: "clamp(280px, 44svh, 520px)", overflow: "hidden" }}>
        <img
          src={PICTURES.datacenter}
          width={1920}
          height={1280}
          alt=""
          loading="lazy"
          decoding="async"
          className="s-shot"
        />
      </section>

      {/* ---------- العزل: جملة واحدة كبيرة، عنصر مضيء واحد في كل لحظة ---------- */}
      <section className="s-section" id="isolation">
        <div className="s-wrap">
          <p className="s-run-on s-rise">
            <strong>{s.trustOpening}</strong>{" "}
            {guarantees.map((g, i) => (
              <span key={g} data-lit={i === lit ? "true" : "false"}>
                {g.split(":")[0]}
                {i < guarantees.length - 1 ? "، " : " "}
              </span>
            ))}
            <strong>{s.trustClose}</strong>
          </p>

        </div>
      </section>

      {/* ---------- المنشأة التي تبقى البيانات داخلها ---------- */}
      <section aria-hidden style={{ height: "clamp(260px, 40svh, 480px)", overflow: "hidden" }}>
        <img
          src={PICTURES.kafd}
          width={1920}
          height={1280}
          alt=""
          loading="lazy"
          decoding="async"
          className="s-shot"
          style={{ objectPosition: "50% 62%" }}
        />
      </section>

      {/* ---------- الدعوة: الشريط كلّه زر واحد ---------- */}
      <a className="s-cta" href="/login" id="enter">
        <span className="s-cta-top">
          <span className="s-note" style={{ color: "inherit", maxWidth: "34ch" }}>
            {s.ctaNote}
          </span>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M7 17L17 7M17 7H8M17 7v9" />
          </svg>
        </span>
        <span className="s-cta-word">{s.ctaWord}</span>
      </a>

      {/* ---------- التذييل: دعوة فوق اسم مقصوص ---------- */}
      <footer className="s-footer">
        <div className="s-wrap">
          <div className="s-footer-top">
            <div>
              <p className="s-big s-rise" style={{ maxWidth: "14ch" }}>
                {s.footerInvite}
              </p>
              <a
                className="s-btn s-rise"
                style={{ marginTop: 28, ["--d" as string]: "80ms" }}
                href={
                  "mailto:demo@xposure.local?subject=" +
                  encodeURIComponent(t.site.mailSubject) +
                  "&body=" +
                  encodeURIComponent(t.site.mailBody)
                }
              >
                {s.footerAction}
              </a>
            </div>

            <div className="s-footer-links">
              <a href="/login">{s.navEnter}</a>
              <a href="#clause">{s.navCompare}</a>
              <a href="#how">{s.navHow}</a>
              <a href="#isolation">{s.navTrust}</a>
            </div>
          </div>

          <p className="s-credits">
            <span>{s.credits}</span>
            <span>
              <a href="https://commons.wikimedia.org/w/index.php?curid=169491206">
                “Microscope close-up of blown step-down regulator on laptop PCB”
              </a>{" "}
              {s.creditsBy} Profpcde, <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a>;
            </span>
            <span>
              <a href="https://wordpress.org/photos/photo/61563ef3d9/">“A system administrator’s workstation”</a>{" "}
              {s.creditsBy} Javier Salinas, <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a>;
            </span>
            <span>
              <a href="https://commons.wikimedia.org/wiki/File:Riyadh_Skyline.jpg">“Riyadh Skyline”</a> {s.creditsBy}{" "}
              B.alotaby, <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>;
            </span>
            <span>
              <a href="https://commons.wikimedia.org/wiki/File:PCB_design_and_realisation_smt_and_through_hole.png">
                “PCB design and realisation”
              </a>{" "}
              {s.creditsBy} Mike1024,{" "}
              <a href="https://creativecommons.org/publicdomain/mark/1.0/">public domain</a>;
            </span>
            <span>
              <a href="https://commons.wikimedia.org/wiki/File:Cern_datacenter.jpg">“Cern datacenter”</a> {s.creditsBy}{" "}
              Hugovanmeijeren, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>;
            </span>
            <span>
              <a href="https://commons.wikimedia.org/wiki/File:King_Abdullah_Financial_District_(KAFD),_Riyadh,_Saudi_Arabia,_2026.jpg">
                “King Abdullah Financial District, Riyadh”
              </a>
              , <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a> — {s.creditsVia} Wikimedia
              Commons.
            </span>
          </p>
        </div>

        <p className="s-wordmark">Xposure</p>
      </footer>
    </div>
  );
}

/** صفّ في الإيصال: وصف، ثم نقاط قائدة، ثم قيمة بأرقام جدولية. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="s-slip-row">
      <span>{label}</span>
      <span className="s-leader" aria-hidden>
        ····································································
      </span>
      <bdi dir="ltr" className="s-slip-value s-fig">
        {value}
      </bdi>
    </p>
  );
}
