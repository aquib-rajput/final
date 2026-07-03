"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  Clock,
  Crown,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  PanelTop,
  Rss,
  Settings,
  Shield,
  Sun,
  User,
  Users,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MobileDrawer } from "./mobile-drawer"

const desktopNavigation = [
  { name: "Home", href: "/", icon: Building2 },
  { name: "Mosques", href: "/mosques", icon: MapPin },
  { name: "Feed", href: "/feed", icon: Rss, requiresAuth: true },
  { name: "Messages", href: "/messages", icon: MessageSquare, requiresAuth: true },
  { name: "Prayer Times", href: "/prayer-times", icon: Clock },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Community", href: "/community", icon: Users },
]

// Mobile app-bar titles for the current route. The mobile bar shows a single
// page title instead of the full logo so it feels like a native screen.
const ROUTE_TITLES: Array<{ match: RegExp; title: string }> = [
  { match: /^\/mosques$/, title: "Mosques" },
  { match: /^\/mosques\/register$/, title: "Register Mosque" },
  { match: /^\/mosques\/[^/]+\/management/, title: "Mosque Management" },
  { match: /^\/mosques\/[^/]+\/imam/, title: "Imam Profile" },
  { match: /^\/mosques\/[^/]+/, title: "Mosque Detail" },
  { match: /^\/prayer-times/, title: "Prayer Times" },
  { match: /^\/events\/[^/]+/, title: "Event Detail" },
  { match: /^\/events/, title: "Events" },
  { match: /^\/community/, title: "Community" },
  { match: /^\/feed/, title: "Feed" },
  { match: /^\/messages/, title: "Messages" },
  { match: /^\/profile\/[^/]+/, title: "Profile" },
  { match: /^\/profile/, title: "My Profile" },
  { match: /^\/settings/, title: "Settings" },
  { match: /^\/nearby/, title: "Nearby" },
  { match: /^\/admin/, title: "Admin" },
  { match: /^\/super-admin/, title: "Super Admin" },
  { match: /^\/imam/, title: "Imam" },
  { match: /^\/shura/, title: "Shura" },
]

function getMobileTitle(pathname: string): string | null {
  if (pathname === "/") return null // Show logo on home.
  const match = ROUTE_TITLES.find((entry) => entry.match.test(pathname))
  return match?.title ?? null
}

function getInitials(name: string | null | undefined) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function Header() {
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const { setTheme } = useTheme()
  const {
    profile,
    signOut,
    loading,
    isShura,
    isSignedIn,
    resolvedRole,
    isSuperAdmin,
  } = useAuth()
  const [mounted, setMounted] = useState(false)

  const canAccessAdminPanel = resolvedRole === "admin" || resolvedRole === "super_admin"
  const canAccessImamPanel = resolvedRole === "imam" || resolvedRole === "super_admin"
  const canAccessShuraPanel = isShura

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } finally {
      router.replace("/")
    }
  }

  const mobileTitle = getMobileTitle(pathname)

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
    >
      {/* Mobile app bar */}
      <div className="flex h-14 items-center justify-between gap-2 px-3 lg:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {mobileTitle ? (
            <>
              <Link
                href="/"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground active:scale-95"
                aria-label="Home"
              >
                <MosqueIcon className="h-5 w-5" />
              </Link>
              <h1 className="truncate text-base font-semibold tracking-tight">
                {mobileTitle}
              </h1>
            </>
          ) : (
            <Link href="/" className="flex items-center gap-2 active:scale-95">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <MosqueIcon className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Mosque<span className="text-primary">Connect</span>
              </span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle mounted={mounted} setTheme={setTheme} />
          {!loading && isSignedIn && (
            <Link
              href="/profile"
              aria-label="Open profile"
              className="flex h-10 w-10 items-center justify-center rounded-full active:scale-95"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={profile?.avatar_url || undefined}
                  alt={profile?.full_name || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          <MobileDrawer />
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="mx-auto hidden max-w-7xl items-center justify-between gap-6 px-6 py-3 lg:flex lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2 active:scale-95">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all group-hover:shadow-primary/30">
              <MosqueIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Mosque<span className="text-primary">Connect</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {desktopNavigation.map((item) => {
              if (item.requiresAuth && !isSignedIn) return null
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:-translate-y-px hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mounted &&
            isSignedIn &&
            (canAccessShuraPanel ||
              canAccessImamPanel ||
              canAccessAdminPanel ||
              isSuperAdmin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl border-border/60"
                  >
                    <PanelTop className="h-4 w-4" />
                    Manage
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl border-border/60"
                >
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Panel
                  </div>
                  {isSuperAdmin && (
                    <DropdownMenuItem asChild className="my-0.5 rounded-lg">
                      <Link href="/super-admin" className="flex cursor-pointer items-center">
                        <Crown className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
                        Super Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {canAccessAdminPanel && (
                    <DropdownMenuItem asChild className="my-0.5 rounded-lg">
                      <Link href="/admin" className="flex cursor-pointer items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {canAccessImamPanel && (
                    <DropdownMenuItem asChild className="my-0.5 rounded-lg">
                      <Link href="/imam" className="flex cursor-pointer items-center">
                        <BookOpen className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Imam Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {canAccessShuraPanel && (
                    <DropdownMenuItem asChild className="my-0.5 rounded-lg">
                      <Link href="/shura" className="flex cursor-pointer items-center">
                        <Shield className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                        Shura Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

          <ThemeToggle mounted={mounted} setTheme={setTheme} />

          {!loading &&
            (isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full transition-all hover:ring-2 hover:ring-primary/20"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={profile?.full_name || "User"}
                      />
                      <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 rounded-2xl border-border/60 p-2 shadow-xl"
                >
                  <div className="mb-1 rounded-xl bg-muted/30 px-3 py-3">
                    <p className="truncate text-sm font-bold">
                      {profile?.full_name || "User"}
                    </p>
                    <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                      {resolvedRole || profile?.role || "Member"} Role
                    </p>
                    <p className="mt-1.5 truncate text-xs text-muted-foreground/80">
                      {profile?.email || "Guest access"}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem asChild className="my-0.5 rounded-lg">
                    <Link href="/profile" className="flex cursor-pointer items-center">
                      <User className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="my-0.5 rounded-lg">
                    <Link href="/settings" className="flex cursor-pointer items-center">
                      <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-lg font-bold text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl px-4 font-medium"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="rounded-xl px-5 font-bold shadow-lg shadow-primary/20"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            ))}
        </div>
      </nav>
    </header>
  )
}

function ThemeToggle({
  mounted,
  setTheme,
}: {
  mounted: boolean
  setTheme: (theme: string) => void
}) {
  if (!mounted) return <div className="h-10 w-10" aria-hidden />
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl hover:bg-muted/80"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl border-border/60">
        <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-lg">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-lg">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-lg">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MosqueIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3c-1.5 2-3 3.5-3 5.5a3 3 0 1 0 6 0c0-2-1.5-3.5-3-5.5z" />
      <path d="M4 21V10a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11" />
      <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
      <path d="M3 21h18" />
      <path d="M4 10l8-6 8 6" />
    </svg>
  )
}
