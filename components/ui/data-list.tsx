"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function DataList({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-3", className)} {...props} />
}

function DataCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function DataCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-border/40 p-4",
        className
      )}
      {...props}
    />
  )
}

function DataCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-w-0", className)} {...props} />
}

function DataCardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-3 p-4", className)} {...props} />
}

function DataRow({
  label,
  value,
  className,
}: {
  label: React.ReactNode
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="min-w-0 text-right text-sm text-foreground">{value}</div>
    </div>
  )
}

export { DataList, DataCard, DataCardHeader, DataCardTitle, DataCardBody, DataRow }

