import { AlertTriangle, Clock, MapPin, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: MapPin,
    title: "Distance géographique",
    description: "Les spécialistes sont concentrés à Yaoundé, loin des patients des régions.",
  },
  {
    icon: Clock,
    title: "Délais d&apos;attente",
    description: "Des semaines voire des mois pour obtenir un rendez-vous spécialisé.",
  },
  {
    icon: TrendingDown,
    title: "Coûts de déplacement",
    description: "Transport et hébergement représentent un frein majeur pour les patients.",
  },
  {
    icon: AlertTriangle,
    title: "Perte de suivi",
    description: "Difficile de maintenir un suivi médical régulier à distance.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            L&apos;accès aux soins spécialisés reste un défi
          </h2>
          <p className="text-lg text-muted-foreground">
            Au Cameroun, les patients des centres secondaires font face à de nombreux 
            obstacles pour accéder aux médecins spécialistes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="p-6 bg-background rounded-xl border border-border hover:border-accent/50 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <problem.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-primary mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

