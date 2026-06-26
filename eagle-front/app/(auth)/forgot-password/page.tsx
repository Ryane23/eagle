import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/features/auth";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la connexion
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-primary">Mot de passe oublié</h1>
        <p className="text-muted-foreground">
          Pas de panique ! Entrez votre email et nous vous enverrons un lien 
          pour réinitialiser votre mot de passe.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}

