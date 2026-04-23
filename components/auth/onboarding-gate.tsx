"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { buildOnboardingRedirect, shouldBypassOnboarding } from "@/lib/auth/onboarding";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, loading, needsOnboarding } = useAuth();

  const safePathname = pathname || "/";
  const bypassOnboarding = shouldBypassOnboarding(safePathname);
  const lastRedirectFromRef = useRef<string | null>(null);

  // Reset the redirect guard whenever the user navigates to a new path so
  // repeated onboarding loops can't latch on forever.
  useEffect(() => {
    lastRedirectFromRef.current = null;
  }, [safePathname]);

  useEffect(() => {
    if (loading || !isSignedIn || !needsOnboarding || bypassOnboarding) {
      return;
    }

    // Only fire the redirect once per pathname to avoid render->replace loops.
    if (lastRedirectFromRef.current === safePathname) {
      return;
    }
    lastRedirectFromRef.current = safePathname;

    const currentPath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : safePathname;

    router.replace(buildOnboardingRedirect(currentPath));
  }, [bypassOnboarding, isSignedIn, loading, needsOnboarding, router, safePathname]);

  if (loading && !bypassOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSignedIn && needsOnboarding && !bypassOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Finishing your account setup...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
