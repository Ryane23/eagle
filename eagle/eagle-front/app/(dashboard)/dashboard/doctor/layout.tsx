import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { doctorNav } from "@/lib/constants/navigation";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar navigation={doctorNav} />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}

