import { SidebarInset } from "@/components/ui/sidebar";
import { AdminStatsVisibilityProvider } from "@/components/admin/admin-stats-visibility";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { adminNav } from "@/lib/constants/navigation";

const mockUser = {
  name: "Admin EAGLE",
  email: "admin@eagle.cm",
  role: "admin" as const,
  center: "Système Central",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar navigation={adminNav} user={mockUser} />
      <AdminStatsVisibilityProvider>
        <SidebarInset>
          <div className="flex min-h-0 flex-1 flex-col bg-gray-50/30 font-sans">
            {children}
          </div>
        </SidebarInset>
      </AdminStatsVisibilityProvider>
    </>
  );
}
