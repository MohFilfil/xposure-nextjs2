import { cx } from "@/lib/utils";

/**
 * الشعار أحادي اللون دائماً: يُعرض عبر CSS mask بلون ink فينقلب أبيض/أسود مع السمة.
 * لا فلتر لوني، ولا نسختان من الملف، ولا إعادة تلوين بـ brand.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Xposure"
      className={cx("block bg-ink", className)}
      style={{
        maskImage: "url(/logos/xposure-logo-vector.svg)",
        WebkitMaskImage: "url(/logos/xposure-logo-vector.svg)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center"
      }}
    />
  );
}
