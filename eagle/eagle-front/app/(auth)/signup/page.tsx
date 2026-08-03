import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-primary">Inscription non disponible</h1>
        <p className="text-muted-foreground">
          La création de compte est réservée aux administrateurs. Veuillez contacter votre administrateur pour obtenir un accès.
        </p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{" "}
        <Link href="/login" className="text-accent hover:text-accent/80 font-medium">
          Se connecter
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Besoin d&apos;accès ?{" "}
        <Link href="/#contact" className="text-accent hover:text-accent/80">
          Contactez l&apos;administrateur
        </Link>
      </p>
    </div>
  );
}
