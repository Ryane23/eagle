"use client";

import { GenericErrorBoundary } from "@/components/shared/error-fallback";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <GenericErrorBoundary error={error} reset={reset} />;
}

