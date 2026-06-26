import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold">EAGLE</span>
            </div>
            <p className="text-white/70 text-sm">
              Réseau de télémédecine connectant les centres de santé secondaires 
              aux médecins spécialistes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-white/70 hover:text-white text-sm transition-colors">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#benefits" className="text-white/70 hover:text-white text-sm transition-colors">
                  Avantages
                </a>
              </li>
              <li>
                <a href="#specialties" className="text-white/70 hover:text-white text-sm transition-colors">
                  Spécialités
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/70 hover:text-white text-sm transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-white/70 hover:text-white text-sm transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/70 hover:text-white text-sm transition-colors">
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-white/70 hover:text-white text-sm transition-colors">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/70">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Centre Principal, Yaoundé, Cameroun</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Phone className="w-4 h-4 shrink-0" />
                <span>+237 6XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Mail className="w-4 h-4 shrink-0" />
                <span>contact@eagle-sante.cm</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} EAGLE. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/50">
                Propulsé par la télémédecine
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

