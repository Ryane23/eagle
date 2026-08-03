import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { roleNavigation, type UserRole } from "@/lib/constants/navigation";
import type { SessionUser } from "@/types/user";

type DashboardLayoutProps = {
  children: React.ReactNode;
  role: UserRole;
  user: SessionUser;
};

export function DashboardLayout({ children, role, user }: DashboardLayoutProps) {
  const navigation = roleNavigation[role];

  return (
    <>
      <AppSidebar navigation={navigation} user={user} />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}







