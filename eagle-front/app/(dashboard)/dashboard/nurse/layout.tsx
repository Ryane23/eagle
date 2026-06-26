import { DashboardLayout } from "@/components/layout/dashboard-layout";

const mockUser = {
  name: "Sophie Ateba",
  email: "sophie.ateba@eagle.cm",
  role: "nurse" as const,
  center: "Centre de Douala",
};

export default function NurseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="nurse" user={mockUser}>
      {children}
    </DashboardLayout>
  );
}

