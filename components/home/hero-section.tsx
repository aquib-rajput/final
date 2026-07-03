"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Calendar, Clock, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const QUICK_ACTIONS = [
  { label: "Mosques", href: "/mosques", icon: MapPin },
  { label: "Prayer Times", href: "/prayer-times", icon: Clock },
  { label: "Events", href: "/events", icon: Calendar },
] as const

export function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const query = searchQuery.trim()
    if (query.length === 0) return
    router.push(`/mosques?search=${encodeURIComponent(query)}`)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Geometric pattern */}
      <div aria-hidden className="absolute inset-0 opacity-[0.04]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="islamic-pattern"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M30 0L60 30L30 60L0 30Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle
                cx="30"
                cy="30"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
      </div>

      <div className="relative mx-auto w-full max-w-md px-4 py-10 sm:max-w-2xl sm:px-6 sm:py-16 lg:max-w-7xl lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary sm:px-4 sm:py-1.5 sm:text-sm">
            <span className="mr-2">Bismillah</span>
            <span className="text-muted-foreground">Welcome to the Community</span>
          </div>

          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Connect with Your{" "}
            <span className="text-primary">Local Mosque</span> Community
          </h1>

          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:text-xl">
            Discover mosques near you, stay updated with prayer times, join community
            events, and strengthen your bond with the Ummah.
          </p>

          <form onSubmit={handleSearch} className="mt-6 sm:mt-8">
            <div className="mx-auto flex max-w-xl flex-col gap-2 sm:flex-row sm:gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  inputMode="search"
                  enterKeyHint="search"
                  placeholder="Search mosques by name or city"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-12 rounded-xl border-border/60 pl-10 pr-4 text-base shadow-sm sm:h-12"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 gap-2 rounded-xl px-6 font-semibold shadow-md shadow-primary/20"
              >
                Search
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Quick action chips - scrollable on phones, centered on tablets+ */}
          <div className="-mx-4 mt-5 sm:mt-6">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors active:bg-muted sm:hover:border-primary/30 sm:hover:bg-primary/5"
                >
                  <action.icon className="h-4 w-4 text-primary" />
                  {action.label}
                </Link>
              ))}
              <Link
                href="/nearby"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 active:bg-primary/90"
              >
                <MapPin className="h-4 w-4" />
                Find nearby
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative blurs - subtle on mobile, full on desktop */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/4 h-56 w-56 rounded-full bg-primary/5 blur-3xl lg:h-72 lg:w-72"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-1/4 h-56 w-56 rounded-full bg-accent/10 blur-3xl lg:h-72 lg:w-72"
        />
      </div>
    </section>
  )
}
