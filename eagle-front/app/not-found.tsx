import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/back-button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 font-sans">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-primary-foreground font-bold text-3xl">E</span>
        </div>

        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Page introuvable
        </h2>
        
        <p className="text-muted-foreground mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Home className="w-4 h-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
