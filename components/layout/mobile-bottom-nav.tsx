"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MapPin, Clock, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"

type BottomTab = {
  name: string
  href: string
  icon: typeof Home
  /** When set, the tab is treated active for any path that starts with this value. */
  matchPrefix?: string
}

const TABS: BottomTab[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Mosques", href: "/mosques", icon: MapPin, matchPrefix: "/mosques" },
  { name: "Prayer", href: "/prayer-times", icon: Clock, matchPrefix: "/prayer-times" },
  { name: "Events", href: "/events", icon: Calendar, matchPrefix: "/events" },
  { name: "Profile", href: "/profile", icon: User, matchPrefix: "/profile" },
]

// Routes where the bottom nav should be hidden (auth flows, full-screen
// management, onboarding) so it never overlaps modal/full-page content.
const HIDDEN_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/onboarding",
  "/messages", // Messenger has its own bottom-anchored composer.
]

function isTabActive(pathname: string, tab: BottomTab) {
  if (tab.href === "/") {
    return pathname === "/"
  }
  if (tab.matchPrefix) {
    return pathname === tab.matchPrefix || pathname.startsWith(`${tab.matchPrefix}/`)
  }
  return pathname === tab.href
}

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/"
  const { isSignedIn } = useAuth()

  const shouldHide = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
  if (shouldHide) {
    return null
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
      }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((tab) => {
          const active = isTabActive(pathname, tab)
          // For the Profile tab, route signed-out users to sign-in instead.
          const href =
            tab.name === "Profile" && !isSignedIn
              ? `/sign-in?redirect_url=${encodeURIComponent("/profile")}`
              : tab.href

          return (
            <li key={tab.name} className="contents">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={tab.name}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors",
                  "active:bg-muted/60",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full transition-colors",
                    active ? "bg-primary" : "bg-transparent",
                  )}
                />
                <tab.icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    active ? "scale-110" : "scale-100",
                  )}
                />
                <span className="leading-none">{tab.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
