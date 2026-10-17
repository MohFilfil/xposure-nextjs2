"use client";

import { ComplianceDashboard } from "@/components/dashboards/Compliance";
import { ExecDashboard } from "@/components/dashboards/Exec";
import { OwnerDashboard } from "@/components/dashboards/Owner";
import { AuditorDashboard } from "@/components/dashboards/Auditor";
import { AdminDashboard } from "@/components/dashboards/Admin";
import { useSession } from "@/components/SessionProvider";

/**
 * صفحة بداية واحدة بخمس إجابات. المسار نفسه لكل الأدوار — فالروابط المحفوظة
 * والاختصارات لا تتغيّر بتغيّر الدور — والمعروض فيه هو ما يخصّ صاحب الجلسة.
 *
 * مسؤول الامتثال يرى الشاشة الأصلية كما هي بلا تغيير: هي مسار العرض الكامل،
 * ولا يُعاد ترتيبها من أجل أدوار أُضيفت بعدها.
 */
export default function DashboardPage() {
  const { role } = useSession();

  switch (role) {
    case "exec":
      return <ExecDashboard />;
    case "owner":
      return <OwnerDashboard />;
    case "auditor":
      return <AuditorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <ComplianceDashboard />;
  }
}
