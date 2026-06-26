import {
    Zap,
    Shield,
    TrendingUp,
    Users,
    Clock,
    HeartPulse
} from "lucide-react";

const benefits = [
    {
        icon: Zap,
        title: "Accès immédiat aux spécialistes",
        description: "Consultations planifiées rapidement selon l&apos;urgence du patient.",
    },
    {
        icon: Shield,
        title: "Qualité des soins garantie",
        description: "Médecins spécialistes qualifiés basés au centre principal de Yaoundé.",
    },
    {
        icon: TrendingUp,
        title: "Réduction des coûts",
        description: "Élimination des frais de transport et d&apos;hébergement pour vos patients.",
    },
    {
        icon: Users,
        title: "Formation continue",
        description: "Vos équipes apprennent au contact des spécialistes lors des consultations.",
    },
    {
        icon: Clock,
        title: "Suivi simplifié",
        description: "Dossiers médicaux partagés et consultations de suivi facilitées.",
    },
    {
        icon: HeartPulse,
        title: "Meilleurs résultats",
        description: "Diagnostic précoce et prise en charge rapide améliorent les outcomes.",
    },
];

export function BenefitsSection() {
    return (
        <section id="benefits" className="py-20 bg-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Pourquoi rejoindre le réseau EAGLE ?
                    </h2>
                    <p className="text-lg text-white/70">
                        Des avantages concrets pour votre établissement et vos patients.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit) => (
                        <div
                            key={benefit.title}
                            className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-colors"
                        >
                            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                                <benefit.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                            <p className="text-sm text-white/70">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

