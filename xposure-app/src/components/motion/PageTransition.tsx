"use client";

import { usePathname } from "next/navigation";

/**
 * كل تنقّل يبدأ بصفحة تصعد 12px وتظهر. الحركة قصيرة عمداً (dur-4) لأن دورها
 * تأكيد «وصلت صفحة جديدة» لا إبطاء الوصول إليها. المفتاح هو المسار، فتُعاد
 * الحركة عند كل تنقّل حقيقي فقط.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="flex flex-1 animate-fade-up flex-col">
      {children}
    </div>
  );
}
