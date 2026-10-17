"use client";

import { LandingNav } from "@/components/landing/LandingNav";
import {
  FinalCta,
  GoalsSection,
  Hero,
  HowSection,
  LandingFooter,
  ProblemSection,
  RolesSection,
  TrustSection
} from "@/components/landing/sections";

/**
 * الصفحة التعريفية العامة.
 *
 * بُنيت كلها على رموز التطبيق نفسها (tokens.css عبر tailwind.config.ts): السمة
 * الفاتحة والداكنة تعملان هنا كما تعملان في أي شاشة أخرى، ولا لوحة ألوان ثانية
 * ولا ورقة أنماط خاصة بالصفحة.
 *
 * كل نصّ معروض يأتي من content/landing-content.ts بالعربية والإنجليزية — لا جملة
 * مكتوبة داخل مكوّن، ولا رقم ولا ادعاء خارج ذلك الملف.
 *
 * الترتيب: شريط لاصق ← الصدارة (مع محاكاة شاشة المراجعة) ← المشكلة ← كيف يعمل ←
 * لمن هو ← الثقة ← ما نستهدف قياسه ← الدعوة ← التذييل.
 */
export default function LandingPage() {
  return (
    <>
      {/* رابط تخطٍّ: أول عنصر قابل للتركيز في الصفحة، كما في داخل التطبيق */}
      <a
        href="#main"
        className="sr-only rounded-md bg-surface-raised px-4 py-3 font-body text-body-sm text-ink focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-toast focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-border-focus"
      >
        Xposure
      </a>

      <LandingNav />

      <main id="main">
        <Hero />
        <ProblemSection />
        <HowSection />
        <RolesSection />
        <TrustSection />
        <GoalsSection />
        <FinalCta />
      </main>

      <LandingFooter />
    </>
  );
}
