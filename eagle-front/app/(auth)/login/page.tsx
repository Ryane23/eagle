import Link from "next/link";
import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-primary">Connexion</h1>
        <p className="text-muted-foreground">
          Entrez vos identifiants pour accéder à votre espace.
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-xs text-muted-foreground">
        Besoin d&apos;accès ?{" "}
        <Link href="/#contact" className="text-accent hover:text-accent/80">
          Contactez l&apos;administrateur
        </Link>
      </p>
    </div>
  );
}
