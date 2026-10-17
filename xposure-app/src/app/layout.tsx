import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider } from "@/components/SessionProvider";
import { DecisionsProvider } from "@/components/DecisionsProvider";
import { ToastProvider } from "@/components/ui/Toast";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap"
});
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Xposure — رصد التغيرات التنظيمية وإدارة الامتثال",
  description: "وكيل ذكي يعمل داخل بيئة المنشأة لرصد التغيرات التنظيمية وتحليل أثرها وإدارة الامتثال."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark" className={`${plexArabic.variable} ${plexMono.variable}`}>
      <body>
        <ThemeProvider>
          <SessionProvider>
            <DecisionsProvider>
              <ToastProvider>{children}</ToastProvider>
            </DecisionsProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
