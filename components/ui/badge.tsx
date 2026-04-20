import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-4 gap-1.5 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-primary/30 bg-primary/8 text-primary [a&]:hover:bg-primary/12 [a&]:hover:border-primary/40',
        secondary:
          'border-secondary/30 bg-secondary/8 text-secondary [a&]:hover:bg-secondary/12 [a&]:hover:border-secondary/40',
        destructive:
          'border-destructive/30 bg-destructive/8 text-destructive [a&]:hover:bg-destructive/12 [a&]:hover:border-destructive/40 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20',
        outline:
          'border-border/60 text-foreground bg-background/50 [a&]:hover:bg-accent/40 [a&]:hover:border-border/80',
        success:
          'border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
