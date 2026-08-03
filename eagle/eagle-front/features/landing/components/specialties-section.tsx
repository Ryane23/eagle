import { 
  Heart, 
  Brain, 
  Baby, 
  Bone, 
  Eye, 
  Stethoscope,
  Pill,
  Scan
} from "lucide-react";

const specialties = [
  { icon: Heart, name: "Cardiologie", available: true },
  { icon: Brain, name: "Neurologie", available: true },
  { icon: Baby, name: "Pédiatrie", available: true },
  { icon: Bone, name: "Orthopédie", available: true },
  { icon: Eye, name: "Ophtalmologie", available: true },
  { icon: Stethoscope, name: "Médecine interne", available: true },
  { icon: Pill, name: "Dermatologie", available: true },
  { icon: Scan, name: "Radiologie", available: false },
];

export function SpecialtiesSection() {
  return (
    <section id="specialties" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Spécialités disponibles
          </h2>
          <p className="text-lg text-muted-foreground">
            Un large éventail de spécialités médicales accessibles pour vos patients.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {specialties.map((specialty) => (
            <div
              key={specialty.name}
              className={`p-6 rounded-xl border text-center transition-all ${
                specialty.available
                  ? "bg-background border-border hover:border-accent hover:shadow-lg cursor-pointer"
                  : "bg-muted/50 border-border/50 opacity-60"
              }`}
            >
              <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 ${
                specialty.available ? "bg-accent/10" : "bg-muted"
              }`}>
                <specialty.icon className={`w-7 h-7 ${
                  specialty.available ? "text-accent" : "text-muted-foreground"
                }`} />
              </div>
              <p className={`font-medium ${
                specialty.available ? "text-primary" : "text-muted-foreground"
              }`}>
                {specialty.name}
              </p>
              {!specialty.available && (
                <span className="text-xs text-muted-foreground">Bientôt</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

