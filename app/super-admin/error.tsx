"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuperAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[super-admin-dashboard]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this part of the Super Admin dashboard. Please try again, or contact support if the issue persists.
          </p>
        </div>
        {error.digest ? (
          <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
        ) : null}
        <Button onClick={reset} variant="outline" size="sm" className="gap-2">
          <RefreshCcw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    </div>
  );
}
