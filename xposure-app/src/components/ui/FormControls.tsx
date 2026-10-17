"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/utils";

/**
 * التسمية إلزامية وظاهرة فوق الحقل — لا placeholder بديلاً عنها.
 * رسالة الخطأ دائماً danger وتشرح السبب بجملة فعلية، لا كلمة «خطأ» وحدها.
 * حلقة التركيز 3px شفافة حول الحقل بأكمله.
 */
const FIELD =
  "w-full rounded-md border border-border bg-surface p-3 font-body text-body text-ink " +
  "transition-[box-shadow,border-color,background-color] duration-2 ease-out " +
  "placeholder:text-ink-subtle hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--border))] " +
  "focus:border-border-focus focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--border-focus)_35%,transparent)]";

function Wrapper({
  label,
  error,
  htmlFor,
  children
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="font-body text-body-sm font-bold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p className="animate-fade-in font-body text-body-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  label,
  error,
  className,
  ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Wrapper label={label} error={error} htmlFor={id}>
      <input id={id} className={cx(FIELD, error && "border-danger", className)} {...props} />
    </Wrapper>
  );
}

export function Textarea({
  label,
  error,
  className,
  ...props
}: { label: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Wrapper label={label} error={error} htmlFor={id}>
      <textarea id={id} className={cx(FIELD, "min-h-24 resize-y", error && "border-danger", className)} {...props} />
    </Wrapper>
  );
}

export function Select({
  label,
  error,
  options,
  className,
  ...props
}: { label: string; error?: string; options: Array<{ value: string; label: string }> } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Wrapper label={label} error={error} htmlFor={id}>
      {/* السهم مرسوم بأيقونة النظام نفسها بدل سهم المتصفح، فيتطابق شكل الحقول في كل الصفحات */}
      <div className="relative">
        <select
          id={id}
          className={cx(FIELD, "cursor-pointer appearance-none pe-10", error && "border-danger", className)}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          strokeWidth={2}
          aria-hidden
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
      </div>
    </Wrapper>
  );
}

/** accent-color: brand — أحد المواضع النادرة التي يظهر فيها brand خارج الأزرار والروابط. */
export function Checkbox({
  label,
  ...props
}: { label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="inline-flex cursor-pointer items-start gap-2 font-body text-body text-ink">
      <input type="checkbox" className="h-[18px] w-[18px] accent-brand" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function Radio({
  label,
  ...props
}: { label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 font-body text-body text-ink",
        "transition-[background-color,border-color] duration-2 ease-out hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--border))]",
        "has-[:checked]:border-brand has-[:checked]:bg-surface-overlay"
      )}
    >
      <input type="radio" className="mt-1 h-[18px] w-[18px] accent-brand" {...props} />
      <span>{label}</span>
    </label>
  );
}
