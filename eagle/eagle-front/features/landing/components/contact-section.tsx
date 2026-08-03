"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Rejoignez le réseau EAGLE
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Vous dirigez un établissement de santé et souhaitez offrir à vos patients 
              l&apos;accès aux soins spécialisés ? Contactez-nous pour discuter de votre 
              intégration au réseau.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-accent font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Évaluation initiale</h3>
                  <p className="text-sm text-muted-foreground">
                    Nous analysons vos besoins et votre infrastructure technique.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-accent font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Formation des équipes</h3>
                  <p className="text-sm text-muted-foreground">
                    Vos secrétaires et infirmiers sont formés à l&apos;utilisation du système.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-accent font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Mise en service</h3>
                  <p className="text-sm text-muted-foreground">
                    Votre centre est connecté et opérationnel en quelques semaines.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-2xl p-8 border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facility">Nom de l&apos;établissement</Label>
                  <Input 
                    id="facility" 
                    placeholder="Hôpital de..." 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input 
                    id="city" 
                    placeholder="Douala, Bafoussam..." 
                    required 
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Nom du responsable</Label>
                  <Input 
                    id="contact" 
                    placeholder="Dr. Nom Prénom" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Fonction</Label>
                  <Input 
                    id="role" 
                    placeholder="Directeur, Médecin chef..." 
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="contact@hopital.cm" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+237 6XX XXX XXX" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Décrivez votre établissement et vos besoins..." 
                  rows={4}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    Envoyer la demande
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

