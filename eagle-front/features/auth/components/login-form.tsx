"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";

// Role to dashboard path mapping
const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin",
  primary_secretary: "/dashboard/primary",
  secondary_secretary: "/dashboard/secondary",
  nurse: "/dashboard/nurse",
  doctor: "/dashboard/doctor",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error, clearError, user, isAuthenticated } = useAuthStore();

  // Clear error when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, clearError, error]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo = searchParams.get("redirect");
      const dashboard = redirectTo || ROLE_DASHBOARDS[user.role] || "/dashboard/secondary";
      router.push(dashboard);
    }
  }, [isAuthenticated, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    try {
      await login(email, password);
      // Redirect will happen automatically via useEffect when isAuthenticated changes
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.cm"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            disabled={isLoading}
          />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
            Se souvenir de moi
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            <>
              Se connecter
              <LogIn className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        En vous connectant, vous acceptez les conditions d&apos;utilisation et la politique de confidentialité.
      </p>
    </div>
  );
}
