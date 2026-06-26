import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetPasswordForm } from "@/features/auth";

export default function ResetPasswordPage() {
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
        <h1 className="text-2xl font-bold text-primary">
          Réinitialiser le mot de passe
        </h1>
        <p className="text-muted-foreground">
          Choisissez un nouveau mot de passe sécurisé pour votre compte.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}

