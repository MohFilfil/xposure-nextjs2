export function Chip({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm bg-surface-overlay px-2 py-1 font-body text-caption text-ink${
        muted ? " opacity-50" : ""
      }`}
    >
      {children}
    </span>
  );
}
