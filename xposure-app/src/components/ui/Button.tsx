"use client";

import { forwardRef } from "react";
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
    "text-ink bg-[color-mix(in_srgb,var(--brand)_55%,var(--surface))] hover:enabled:bg-[color-mix(in_srgb,var(--brand-hover)_60%,var(--surface))]",
  secondary: "text-ink bg-surface-overlay hover:enabled:bg-[color-mix(in_srgb,var(--surface-overlay)_70%,var(--ink))]",
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
}

/**
 * لا تضع أيقونة بلا نص على زر إجراء رئيسي، ولا أكثر من زر primary واحد في الشاشة.
 * حالة disabled لا تُخفى — اشرح سببها بنص مجاور (انظر ButtonNote).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border-0 font-body font-semibold transition-colors duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
        "disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "px-3 py-2 text-body-sm" : "px-5 py-3 text-body",
        variant === "ghost" && (size === "sm" ? "px-[10px] py-[6px]" : "px-[18px] py-[10px]"),
        VARIANT[variant],
        className
      )}
      {...props}
    />
  );
});

/** النص الذي يشرح لماذا الزر معطّل — إلزامي بجانب أي زر disabled. */
export function ButtonNote({ children }: { children: React.ReactNode }) {
  return <span className="font-body text-body-sm text-ink-muted">{children}</span>;
}
