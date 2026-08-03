import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { primarySecretaryNav } from "@/lib/constants/navigation";

const mockUser = {
  name: "Jean Kamga",
  email: "jean.kamga@eagle.cm",
  role: "primary_secretary" as const,
  center: "Centre Principal - Yaoundé",
};

export default function PrimarySecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar navigation={primarySecretaryNav} user={mockUser} />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}

