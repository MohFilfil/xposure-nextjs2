"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MotifSpinner } from "@/components/ui/BrandMotif";
import { useSession } from "@/components/SessionProvider";
import { useT } from "@/components/I18nProvider";
import { allowsPath, homeFor } from "@/lib/roles";

/**
 * حارس الجلسة. ثلاث حالات لا رابعة:
 * 1. قبل قراءة التخزين — لوح انتظار، لا حكم بوجود جلسة أو غيابها (وإلا ومض
 *    التطبيق لمن لديه جلسة محفوظة، أو ومضت الشاشة لمن ليست لديه).
 * 2. بلا جلسة — تحويل إلى شاشة الدخول.
 * 3. بجلسة لكن المسار ليس من مسارات الدور — تحويل إلى صفحة بداية الدور، فلا
 *    يصل مالكُ عملية إلى شاشة لا يملك فيها شيئاً عبر رابط محفوظ.
 */
export function RequireSession({ children }: { children: React.ReactNode }) {
  const { role, hydrated } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const permitted = role !== null && allowsPath(role, pathname);

  useEffect(() => {
    if (!hydrated) return;
    if (!role) {
      router.replace("/login");
      return;
    }
    if (!allowsPath(role, pathname)) router.replace(homeFor(role));
  }, [hydrated, role, pathname, router]);

  if (!hydrated || !permitted) return <SessionSplash />;

  return <>{children}</>;
}

/** لوح الانتظار: نفس نمط العدسة المستخدم في التحميل داخل التطبيق — لا شاشة بيضاء. */
function SessionSplash() {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5" role="status" aria-live="polite">
      <MotifSpinner className="h-14 w-14" />
      <p className="font-body text-body-sm text-ink-muted">{t.common.checkingSession}</p>
    </div>
  );
}
