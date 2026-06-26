import { ArrowRight, Building2, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium text-accent">
                Réseau de télémédecine au Cameroun
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight">
              Connectez votre centre aux{" "}
              <span className="text-accent">soins spécialisés</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              EAGLE permet aux établissements de santé secondaires d&apos;offrir à leurs 
              patients des consultations avec des médecins spécialistes, sans déplacement 
              vers la capitale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  Rejoindre le réseau
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  Découvrir comment ça marche
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div>
                <p className="text-3xl font-bold text-primary">4+</p>
                <p className="text-sm text-muted-foreground">Centres connectés</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">10+</p>
                <p className="text-sm text-muted-foreground">Spécialités</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground">Disponibilité</p>
              </div>
            </div>
          </div>

          <div className="relative lg:h-[500px] hidden lg:block">
            <div className="absolute top-0 right-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Centre de Douala</p>
                  <p className="text-sm text-muted-foreground">3 patients en attente</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl border-2 border-accent">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Consultation en cours</p>
                  <p className="text-sm text-muted-foreground">Dr. Nana - Cardiologie</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Centre de Bafoussam</p>
                  <p className="text-sm text-muted-foreground">5 consultations aujourd&apos;hui</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

