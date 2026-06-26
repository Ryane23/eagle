import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background font-sans flex">
            <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-primary via-secondary to-accent opacity-90" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                            <span className="text-primary font-bold text-xl">E</span>
                        </div>
                        <span className="text-2xl font-bold">EAGLE</span>
                    </Link>

                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold leading-tight">
                            Réseau de télémédecine pour un accès aux soins spécialisés
                        </h1>
                        <p className="text-white/80 text-lg">
                            Connectez-vous pour accéder à votre tableau de bord et gérer
                            les consultations de votre centre.
                        </p>
                    </div>

                    <p className="text-white/60 text-sm">
                        © {new Date().getFullYear()} EAGLE. Tous droits réservés.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">E</span>
                        </div>
                        <span className="text-xl font-bold text-primary">EAGLE</span>
                    </Link>
                    {children}
                </div>
            </div>
        </div>
    );
}

