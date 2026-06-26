"use client";

import { GenericErrorBoundary } from "@/components/shared";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <GenericErrorBoundary error={error} reset={reset} />;
}

