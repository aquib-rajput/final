"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2,
  Calendar,
  Clock,
  Crown,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  BookOpen,
  Rss,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type NavItem = {
  name: string
  href: string
  icon: typeof Building2
  requiresAuth?: boolean
}

const PRIMARY_NAV: NavItem[] = [
  { name: "Home", href: "/", icon: Building2 },
  { name: "Mosques", href: "/mosques", icon: MapPin },
  { name: "Prayer Times", href: "/prayer-times", icon: Clock },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Community", href: "/community", icon: Users },
]

const AUTH_NAV: NavItem[] = [
  { name: "Feed", href: "/feed", icon: Rss, requiresAuth: true },
  { name: "Messages", href: "/messages", icon: MessageSquare, requiresAuth: true },
  { name: "My Profile", href: "/profile", icon: User, requiresAuth: true },
  { name: "Settings", href: "/settings", icon: Settings, requiresAuth: true },
]

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

export function MobileDrawer() {
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const {
    profile,
    signOut,
    isSignedIn,
    isShura,
    isSuperAdmin,
    resolvedRole,
  } = useAuth()
  const [open, setOpen] = useState(false)

  const canAccessAdminPanel = resolvedRole === "admin" || resolvedRole === "super_admin"
  const canAccessImamPanel = resolvedRole === "imam" || resolvedRole === "super_admin"

  const handleSignOut = async () => {
    setOpen(false)
    try {
      await signOut()
    } finally {
      router.replace("/")
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          className="h-10 w-10 rounded-xl"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[88vw] max-w-sm gap-0 p-0"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>

        {/* Profile / sign-in header */}
        <div className="border-b border-border/40 p-4">
          {isSignedIn ? (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 active:bg-muted"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={profile?.avatar_url || undefined}
                  alt={profile?.full_name || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {profile?.full_name || "Member"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {profile?.email || "Signed in"}
                </p>
                {resolvedRole && (
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {resolvedRole.replace("_", " ")}
                  </p>
                )}
              </div>
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm font-semibold text-foreground active:bg-muted/70"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm active:bg-primary/90"
              >
                <User className="h-4 w-4" />
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3">
          <NavGroup label="Browse">
            {PRIMARY_NAV.map((item) => (
              <DrawerLink
                key={item.name}
                item={item}
                pathname={pathname}
                onSelect={() => setOpen(false)}
              />
            ))}
          </NavGroup>

          {isSignedIn && (
            <NavGroup label="My account">
              {AUTH_NAV.map((item) => (
                <DrawerLink
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  onSelect={() => setOpen(false)}
                />
              ))}
            </NavGroup>
          )}

          {isSignedIn &&
            (isSuperAdmin || canAccessAdminPanel || canAccessImamPanel || isShura) && (
              <NavGroup label="Management">
                {isSuperAdmin && (
                  <DrawerLink
                    item={{
                      name: "Super Admin Panel",
                      href: "/super-admin",
                      icon: Crown,
                    }}
                    pathname={pathname}
                    onSelect={() => setOpen(false)}
                    accent="amber"
                  />
                )}
                {canAccessAdminPanel && (
                  <DrawerLink
                    item={{
                      name: "Admin Panel",
                      href: "/admin",
                      icon: LayoutDashboard,
                    }}
                    pathname={pathname}
                    onSelect={() => setOpen(false)}
                    accent="primary"
                  />
                )}
                {canAccessImamPanel && (
                  <DrawerLink
                    item={{
                      name: "Imam Panel",
                      href: "/imam",
                      icon: BookOpen,
                    }}
                    pathname={pathname}
                    onSelect={() => setOpen(false)}
                    accent="emerald"
                  />
                )}
                {isShura && (
                  <DrawerLink
                    item={{
                      name: "Shura Panel",
                      href: "/shura",
                      icon: Shield,
                    }}
                    pathname={pathname}
                    onSelect={() => setOpen(false)}
                    accent="teal"
                  />
                )}
              </NavGroup>
            )}
        </div>

        {/* Footer */}
        {isSignedIn && (
          <div
            className="border-t border-border/40 p-3"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
          >
            <SheetClose asChild>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive active:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function NavGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

const ACCENT_CLASSES = {
  primary: "text-primary bg-primary/5",
  amber: "text-amber-700 bg-amber-50/80 dark:text-amber-300 dark:bg-amber-950/30",
  emerald:
    "text-emerald-700 bg-emerald-50/70 dark:text-emerald-300 dark:bg-emerald-950/30",
  teal: "text-teal-700 bg-teal-50/70 dark:text-teal-300 dark:bg-teal-950/30",
} as const

function DrawerLink({
  item,
  pathname,
  onSelect,
  accent,
}: {
  item: NavItem
  pathname: string
  onSelect: () => void
  accent?: keyof typeof ACCENT_CLASSES
}) {
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : accent
            ? ACCENT_CLASSES[accent]
            : "text-foreground hover:bg-muted/60 active:bg-muted",
      )}
    >
      <item.icon className="h-5 w-5" />
      <span className="flex-1">{item.name}</span>
    </Link>
  )
}
