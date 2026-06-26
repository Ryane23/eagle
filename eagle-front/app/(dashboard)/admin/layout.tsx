import { SidebarInset } from "@/components/ui/sidebar";
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
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}

