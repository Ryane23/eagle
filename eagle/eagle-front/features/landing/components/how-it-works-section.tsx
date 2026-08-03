import { ClipboardList, UserCheck, Stethoscope, FileText } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Enregistrement du patient",
    description: "Le secrétaire du centre secondaire enregistre le patient et sa demande de consultation.",
    actor: "Secrétaire secondaire",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Validation et planification",
    description: "Le secrétaire principal valide l&apos;urgence et assigne un médecin spécialiste disponible.",
    actor: "Secrétaire principal",
  },
  {
    number: "03",
    icon: Stethoscope,
    title: "Préparation et consultation",
    description: "L'infirmier prépare le patient, puis le médecin effectue la téléconsultation vidéo.",
    actor: "Infirmier + Médecin",
  },
  {
    number: "04",
    icon: FileText,
    title: "Suivi post-consultation",
    description: "Ordonnances, examens complémentaires et rendez-vous de suivi sont planifiés.",
    actor: "Équipe médicale",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-background to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Comment fonctionne EAGLE ?
          </h2>
          <p className="text-lg text-muted-foreground">
            Un processus simple et coordonné pour connecter vos patients aux spécialistes.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary via-secondary to-accent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-border hover:border-accent transition-colors h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-accent/20">{step.number}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                  <div className="inline-flex items-center px-3 py-1 bg-accent/10 rounded-full">
                    <span className="text-xs font-medium text-accent">{step.actor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

