'use client';

export function StatsSkeleton() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <div className="h-8 bg-muted rounded-lg w-48 mx-auto mb-4" />
          <div className="h-5 bg-muted rounded-lg w-64 mx-auto" />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-xl bg-muted" />
              </div>
              <div className="h-8 bg-muted rounded-lg w-16 mx-auto mb-2" />
              <div className="h-5 bg-muted rounded-lg w-32 mx-auto mb-2" />
              <div className="h-4 bg-muted rounded-lg w-40 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PrayerTimesSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-3">
      <div className="h-6 bg-muted rounded-lg w-24" />
      <div className="h-10 bg-muted rounded-lg" />
      <div className="h-16 bg-muted rounded-lg" />
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
