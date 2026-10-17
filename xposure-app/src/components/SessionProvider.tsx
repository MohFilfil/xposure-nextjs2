"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ROLES, accountOf, can as roleCan, isRole, type Permission, type Role } from "@/lib/roles";

const SESSION_KEY = "xposure-session-v1";

interface Store {
  /** null = لا جلسة؛ الحارس يحوّل حينها إلى صفحة الدخول. */
  role: Role | null;
  account: { name: string; title: string; email: string } | null;
  /** يصير true بعد قراءة التخزين — قبلها لا يُحكم بوجود جلسة أو غيابها. */
  hydrated: boolean;
  signIn: (role: Role) => void;
  signOut: () => void;
  /** تبديل الدور داخل الجلسة — مخصص للعرض الحيّ وحده. */
  switchRole: (role: Role) => void;
  /** الصلاحية للدور الحالي؛ بلا جلسة لا صلاحية. */
  can: (permission: Permission) => boolean;
}

const SessionContext = createContext<Store | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

/**
 * جلسة العرض التوضيحي. لا مصادقة ولا كلمة مرور — الدور يُختار من شاشة الدخول
 * ويُحفظ في localStorage ليبقى بعد تحديث الصفحة.
 *
 * عند الربط الفعلي: يُستبدل signIn بطلب إلى FastAPI، ويُقرأ الدور من رمز الجلسة
 * بدل التخزين المحلي. بقية التطبيق لا يتغيّر لأنه يسأل عن الصلاحية لا عن مصدرها.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [hydrated, setHydrated] = useState(false);
  /* الكتابة تُمنع قبل اكتمال القراءة، وإلا محا الحفظُ الأولُ الجلسةَ المحفوظة */
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { role?: unknown };
        if (isRole(parsed.role)) setRole(parsed.role);
      }
    } catch {
      /* تخزين معطّل أو محتوى تالف — تُعامل كجلسة غير موجودة */
    }
    loaded.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      if (role) window.localStorage.setItem(SESSION_KEY, JSON.stringify({ role }));
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* الوضع الخاص يمنع التخزين — الجلسة تبقى لهذه الصفحة فقط */
    }
  }, [role]);

  const signIn = useCallback((next: Role) => setRole(next), []);
  const signOut = useCallback(() => setRole(null), []);

  const value = useMemo<Store>(
    () => ({
      role,
      account: role ? accountOf(role) : null,
      hydrated,
      signIn,
      signOut,
      switchRole: signIn,
      can: (permission: Permission) => (role ? roleCan(role, permission) : false)
    }),
    [role, hydrated, signIn, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** اسم الدور الحالي كما يُعرض — يُستخدم في الشريط العلوي وشاشة الإعدادات. */
export function useRoleLabel() {
  const { role } = useSession();
  return role ? ROLES[role].label : "";
}
