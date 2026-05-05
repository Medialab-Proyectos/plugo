import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Button — PLUGO Design System v2
 *
 * Shape language: pill (rounded-full) for primary CTAs and tonal/secondary,
 * rounded-2xl for utility/icon buttons. ALWAYS distinct from inputs (which use rounded-2xl with input surface).
 *
 * Variants follow Material 3 Expressive:
 *   - default  → filled primary (highest emphasis)
 *   - tonal    → primary tinted (medium-high emphasis)
 *   - secondary→ neutral filled (medium emphasis)
 *   - outline  → stroked (medium-low emphasis)
 *   - ghost    → text only (lowest emphasis)
 *   - destructive → danger filled
 *   - link     → inline text link
 */
const buttonVariants = cva(
  [
    // Base
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none',
    'transition-[transform,background-color,border-color,box-shadow,color] duration-200',
    'will-change-transform active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-50',
    // Icon defaults
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0",
    // Focus
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'aria-invalid:ring-2 aria-invalid:ring-destructive',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_8px_24px_-12px_rgba(0,241,199,0.55)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-pressed)]',
        tonal:
          'bg-primary/15 text-primary ring-1 ring-inset ring-primary/20 hover:bg-primary/20',
        secondary:
          'bg-white text-[#0b0f14] hover:bg-white/95 shadow-[0_4px_16px_-8px_rgba(255,255,255,0.25)]',
        outline:
          'bg-transparent text-foreground ring-1 ring-inset ring-border-strong hover:bg-white/[0.04] hover:ring-foreground-muted/40',
        ghost:
          'bg-transparent text-foreground hover:bg-white/[0.06]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[0_8px_24px_-12px_rgba(255,90,95,0.55)] hover:bg-destructive/90',
        link:
          'h-auto p-0 text-primary underline-offset-4 hover:underline active:scale-100',
      },
      size: {
        sm: 'h-10 px-4 text-sm rounded-full',
        default: 'h-12 px-6 text-sm rounded-full',
        lg: 'h-14 px-7 text-base rounded-full',
        // Utility — for icon-only or secondary nav buttons (less emphatic shape)
        icon: 'size-11 rounded-2xl',
        'icon-sm': 'size-9 rounded-xl',
        'icon-lg': 'size-12 rounded-2xl',
        // Inline utility (like 'Ver todos' link buttons)
        inline: 'h-auto px-0 text-sm rounded-none',
      },
    },
    compoundVariants: [
      // Link variant ignores size styles
      { variant: 'link', size: 'default', class: 'h-auto px-0 rounded-none' },
      { variant: 'link', size: 'sm', class: 'h-auto px-0 rounded-none' },
      { variant: 'link', size: 'lg', class: 'h-auto px-0 rounded-none' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
