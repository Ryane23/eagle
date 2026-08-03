import { Building2, MapPin } from "lucide-react";

const centers = [
  { 
    name: "Centre Principal", 
    city: "Yaoundé", 
    type: "primary",
    description: "Siège des médecins spécialistes" 
  },
  { 
    name: "Centre Secondaire", 
    city: "Douala", 
    type: "secondary",
    description: "Accueil et préparation des patients" 
  },
  { 
    name: "Centre Secondaire", 
    city: "Bafoussam", 
    type: "secondary",
    description: "Accueil et préparation des patients" 
  },
  { 
    name: "Centre Secondaire", 
    city: "Maroua", 
    type: "secondary",
    description: "Accueil et préparation des patients" 
  },
];

export function NetworkSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Notre réseau au Cameroun
          </h2>
          <p className="text-lg text-muted-foreground">
            Un centre principal à Yaoundé connecté aux centres secondaires à travers le pays.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {centers.map((center) => (
            <div
              key={center.city}
              className={`p-6 rounded-xl border-2 transition-all ${
                center.type === "primary"
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border hover:border-accent"
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                center.type === "primary" ? "bg-white/20" : "bg-accent/10"
              }`}>
                <Building2 className={`w-6 h-6 ${
                  center.type === "primary" ? "text-white" : "text-accent"
                }`} />
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <MapPin className={`w-4 h-4 ${
                  center.type === "primary" ? "text-white/70" : "text-muted-foreground"
                }`} />
                <span className={`text-sm font-medium ${
                  center.type === "primary" ? "text-white/70" : "text-muted-foreground"
                }`}>
                  {center.city}
                </span>
              </div>
              
              <h3 className={`font-semibold mb-1 ${
                center.type === "primary" ? "text-white" : "text-primary"
              }`}>
                {center.name}
              </h3>
              
              <p className={`text-sm ${
                center.type === "primary" ? "text-white/70" : "text-muted-foreground"
              }`}>
                {center.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

