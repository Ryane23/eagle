import { DashboardLayout } from "@/components/layout/dashboard-layout";

const mockUser = {
    name: "Marie Dupont",
    email: "marie.dupont@eagle.cm",
    role: "secondary_secretary" as const,
    center: "Centre de Douala",
};

export default function SecondarySecretaryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout role="secondary_secretary" user={mockUser}>
            {children}
        </DashboardLayout>
    );
}

