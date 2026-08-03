"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useWorkflowContextQuery } from "@/hooks/queries";
import { useWorkflowSocket } from "@/hooks/use-workflow-socket";
import { useAuthStore } from "@/stores/auth-store";

export default function NurseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticatedUser = useAuthStore((state) => state.user);
  const { data: context } = useWorkflowContextQuery();
  useWorkflowSocket(!!authenticatedUser);
  const user = context?.user || authenticatedUser;
  const sessionUser = {
    name: user?.name || "Infirmier(ère)",
    email: user?.email || "",
    role: "nurse" as const,
    center: context?.hospital?.name || "Centre non assigné",
  };

  return (
    <DashboardLayout role="nurse" user={sessionUser}>
      {children}
    </DashboardLayout>
  );
}
