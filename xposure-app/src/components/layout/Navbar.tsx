"use client";

import { Bell, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ui/Toast";

/** ارتفاع ثابت 56px في كل الشاشات. نقطة الجرس دائماً danger مهما كان نوع الإشعار. */
export function Navbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { theme, toggle } = useTheme();
  const toast = useToast();

  return (
    <header className="sticky top-0 z-sticky flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface-raised px-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="فتح القائمة"
          className="flex rounded-md p-1 text-ink-muted hover:bg-surface-overlay hover:text-ink md:hidden"
        >
          <Menu size={24} strokeWidth={2} aria-hidden />
        </button>
        <span className="font-display text-h3 text-ink">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="الإشعارات"
          onClick={() => toast("info", "لديك 4 قضايا حرجة بانتظار قرارك.")}
          className="relative flex rounded-md p-1 text-ink-muted hover:bg-surface-overlay hover:text-ink"
        >
          <span className="absolute end-0 top-0 h-2 w-2 rounded-full border-2 border-surface-raised bg-danger" aria-hidden />
          <Bell size={24} strokeWidth={2} aria-hidden />
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label="تبديل السمة"
          className="flex rounded-md p-1 text-ink-muted hover:bg-surface-overlay hover:text-ink"
        >
          {theme === "dark" ? <Sun size={24} strokeWidth={2} aria-hidden /> : <Moon size={24} strokeWidth={2} aria-hidden />}
        </button>

        <div className="flex items-center gap-2">
          {/* الصورة الرمزية: دائرية بخلفية brand وحرف واحد — لا أيقونة شخص عامة */}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-body text-body-sm font-bold text-on-brand" aria-hidden>
            م
          </span>
          <span className="hidden font-body text-body-sm text-ink-muted md:inline">محمد الفلفل</span>
        </div>
      </div>
    </header>
  );
}
