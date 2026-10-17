import { cx } from "@/lib/utils";

/** وسم محايد لقيمة واحدة (منتج، عملية، ضابط). لا يحمل لوناً دلالياً أبداً. */
export function Chip({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-sm border border-hairline bg-surface-overlay px-2 py-1 font-body text-caption text-ink",
        "transition-colors duration-1 hover:border-[color-mix(in_srgb,var(--brand)_35%,transparent)]",
        muted && "opacity-50"
      )}
    >
      {children}
    </span>
  );
}
