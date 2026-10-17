"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cx } from "@/lib/utils";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost";

/**
 * قاعدة اللون: نص كل زر مصمت بلون ink دائماً — أبيض في الداكن وأسود في الفاتح.
 * خلفية الزر هي لون الحالة ممزوجاً 55/45 مع surface، لا اللون الخام.
 * ghost وحده يخالف: نص وحدود بلون brand على خلفية شفافة.
 * لا تُستخدم on-brand / on-success / on-danger كلون نص زر — تلك للشارات فقط.
 */
const VARIANT: Record<Variant, string> = {
  primary:
    "text-ink bg-[color-mix(in_srgb,var(--brand)_55%,var(--surface))] shadow-sm hover:enabled:bg-[color-mix(in_srgb,var(--brand-hover)_60%,var(--surface))] hover:enabled:shadow-glow",
  secondary:
    "text-ink bg-surface-overlay hover:enabled:bg-[color-mix(in_srgb,var(--surface-overlay)_70%,var(--ink))] hover:enabled:shadow-sm",
  success:
    "text-ink bg-[color-mix(in_srgb,var(--success)_55%,var(--surface))] hover:enabled:bg-[color-mix(in_srgb,var(--success)_65%,var(--surface))]",
  danger:
    "text-ink bg-[color-mix(in_srgb,var(--danger)_55%,var(--surface))] hover:enabled:bg-[color-mix(in_srgb,var(--danger)_65%,var(--surface))]",
  ghost:
    "text-brand border-2 border-brand bg-transparent hover:enabled:bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] hover:enabled:text-brand-hover"
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "sm";
  /** يستبدل الأيقونة بدوّارة ويعطّل الزر — النص يبقى كما هو فلا يتغيّر عرض الزر. */
  loading?: boolean;
}

/**
 * لا تضع أيقونة بلا نص على زر إجراء رئيسي، ولا أكثر من زر primary واحد في الشاشة.
 * حالة disabled لا تُخفى — اشرح سببها بنص مجاور (انظر ButtonNote).
 *
 * الحركة: ضغطة تُصغّر الزر 1% (تأكيد لمسي)، و hover يمرّر ومضة ضوء عبر الزر
 * الأساسي وحده — الومضة تدلّ على «هذا هو الإجراء»، فتكرارها على كل زر يُلغي معناها.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", className, type = "button", loading, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden whitespace-nowrap rounded-md border-0 font-body font-semibold",
        "transition-[background-color,box-shadow,transform] duration-2 ease-out",
        "active:enabled:scale-[0.99]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
        "disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "px-3 py-2 text-body-sm" : "px-5 py-3 text-body",
        variant === "ghost" && (size === "sm" ? "px-[10px] py-[6px]" : "px-[18px] py-[10px]"),
        VARIANT[variant],
        className
      )}
      {...props}
    >
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-sheen opacity-0 group-hover:animate-sheen group-hover:opacity-100 motion-reduce:hidden"
        />
      )}
      {loading && <Loader2 size={size === "sm" ? 16 : 20} strokeWidth={2} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

/** النص الذي يشرح لماذا الزر معطّل — إلزامي بجانب أي زر disabled. */
export function ButtonNote({ children }: { children: React.ReactNode }) {
  return <span className="font-body text-body-sm text-ink-muted">{children}</span>;
}
