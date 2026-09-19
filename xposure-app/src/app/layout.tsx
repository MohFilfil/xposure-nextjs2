import type { Metadata } from "next";
import { Cairo, Roboto_Mono, Tajawal } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DecisionsProvider } from "@/components/DecisionsProvider";
import { ToastProvider } from "@/components/ui/Toast";

const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["600", "700"], variable: "--font-cairo", display: "swap" });
const tajawal = Tajawal({ subsets: ["arabic", "latin"], weight: ["400", "500", "700"], variable: "--font-tajawal", display: "swap" });
const mono = Roboto_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-roboto-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Xposure — رصد التغيرات التنظيمية وإدارة الامتثال",
  description: "وكيل ذكي يعمل داخل بيئة المنشأة لرصد التغيرات التنظيمية وتحليل أثرها وإدارة الامتثال."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark" className={`${cairo.variable} ${tajawal.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider>
          <DecisionsProvider>
            <ToastProvider>{children}</ToastProvider>
          </DecisionsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
