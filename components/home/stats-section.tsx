import { Building2, Calendar, MapPin, Users } from "lucide-react";

import { getPublicPlatformStats } from "@/lib/mosques/public";

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toFixed(millions >= 10 ? 0 : 1).replace(/\.0$/, "")}M+`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${thousands.toFixed(thousands >= 10 ? 0 : 1).replace(/\.0$/, "")}K+`;
  }
  return value.toLocaleString();
}

export async function StatsSection() {
  const stats = await getPublicPlatformStats();

  // Hide the whole section when the platform has no meaningful data yet.
  const hasData =
    stats.mosques > 0 ||
    stats.members > 0 ||
    stats.upcomingEvents > 0 ||
    stats.countries > 0;

  if (!hasData) {
    return null;
  }

  const tiles = [
    {
      icon: Building2,
      value: formatCount(stats.mosques),
      label: "Verified Mosques",
      description: "Registered Islamic centers",
      show: stats.mosques > 0,
    },
    {
      icon: Users,
      value: formatCount(stats.members),
      label: "Community Members",
      description: "Active users on the platform",
      show: stats.members > 0,
    },
    {
      icon: Calendar,
      value: formatCount(stats.upcomingEvents),
      label: "Upcoming Events",
      description: "Lectures, classes and gatherings",
      show: stats.upcomingEvents > 0,
    },
    {
      icon: MapPin,
      value: stats.countries.toLocaleString(),
      label: stats.countries === 1 ? "Country Served" : "Countries Served",
      description: "Global community reach",
      show: stats.countries > 0,
    },
  ].filter((tile) => tile.show);

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Serving the Global Ummah
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Real activity from mosques and members already connected through our platform
          </p>
        </div>

        <div
          className={
            tiles.length === 1
              ? "grid gap-8"
              : tiles.length === 2
                ? "grid gap-8 sm:grid-cols-2"
                : tiles.length === 3
                  ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          }
        >
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5" />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <tile.icon className="h-7 w-7" />
                </div>
                <p className="text-4xl font-bold text-foreground">{tile.value}</p>
                <p className="mt-1 font-semibold text-foreground">{tile.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tile.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
