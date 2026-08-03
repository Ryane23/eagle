import { SidebarProvider } from "@/components/ui/sidebar";
import { SkipNav } from "@/components/layout/skip-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SkipNav />
      {children}
    </SidebarProvider>
  );
}

