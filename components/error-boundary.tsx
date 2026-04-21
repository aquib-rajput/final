'use client';

import { ReactNode, useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
  section?: string;
}

export function ErrorBoundary({ children, fallback, section = 'section' }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes(section)) {
        setHasError(true);
        setError(new Error(event.message));
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [section]);

  if (hasError && error) {
    return fallback ? fallback(error) : (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Failed to load this section. Please refresh the page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
