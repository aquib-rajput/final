'use client';

import { Building2, Users, Calendar, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Stats {
  totalMosques: number;
  totalEvents: number;
  countriesCovered: number;
  totalMembers: number;
}

function formatNumber(value: number): string {
  if (value === 0) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K+`;
  return value.toString();
}

export function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/stats', { 
          cache: 'force-cache'
        });
        const data: Stats = await response.json();
        setStats(data);
      } catch (error) {
        console.error('[StatsSection] Failed to fetch stats:', error);
        setStats({
          totalMosques: 0,
          totalEvents: 0,
          countriesCovered: 0,
          totalMembers: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsConfig = [
    {
      icon: Building2,
      value: stats ? formatNumber(stats.totalMosques) : '--',
      label: 'Registered Mosques',
      description: 'Verified Islamic centers worldwide',
    },
    {
      icon: Users,
      value: stats ? formatNumber(stats.totalMembers) : '--',
      label: 'Community Members',
      description: 'Active users on the platform',
    },
    {
      icon: Calendar,
      value: stats ? formatNumber(stats.totalEvents) : '--',
      label: 'Monthly Events',
      description: 'Lectures, classes & gatherings',
    },
    {
      icon: MapPin,
      value: stats ? stats.countriesCovered.toString() : '--',
      label: 'Countries Served',
      description: 'Global Muslim community reach',
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Serving the Global Ummah
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of mosques and community members already connected through our platform
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat) => (
            <div 
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5" />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <stat.icon className="h-7 w-7" />
                </div>
                <p className="text-4xl font-bold text-foreground animate-pulse" style={{ opacity: isLoading ? 0.6 : 1 }}>
                  {stat.value}
                </p>
                <p className="mt-1 font-semibold text-foreground">{stat.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
