import { AppShell } from "@/components/layout/AppShell";
import { RequireSession } from "@/components/RequireSession";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession>
      <AppShell>{children}</AppShell>
    </RequireSession>
  );
}
