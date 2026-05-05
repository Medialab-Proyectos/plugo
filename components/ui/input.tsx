import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Input — PLUGO Design System v2
 *
 * Visually distinct from buttons:
 *  - rounded-2xl (NEVER pill)
 *  - recessed surface (--input) with inset shadow → looks "into the page"
 *  - explicit border that intensifies on focus
 *  - h-12 default (48dp tap target) — h-14 for forms with leading icons
 *
 * Pair with <Label> always; for complex forms prefer the <TextField> composite.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Layout & sizing
        'flex h-12 w-full min-w-0 px-4 py-2 text-base md:text-sm',
        // Shape (distinct from buttons)
        'rounded-2xl',
        // Recessed surface
        'bg-[var(--input)] border border-[var(--input-border)]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.25)]',
        // Text & placeholder
        'text-foreground placeholder:text-[var(--input-placeholder)] caret-primary',
        // Selection
        'selection:bg-primary selection:text-primary-foreground',
        // Focus — clear emphasis (border + soft glow), still distinct from button
        'outline-none transition-[color,box-shadow,border-color] duration-200',
        'focus-visible:border-[var(--input-border-focus)] focus-visible:ring-4 focus-visible:ring-primary/15',
        // File input
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        // Disabled
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        // Invalid
        'aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15',
        // iOS: prevent zoom on focus when font-size < 16
        'text-[16px] md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
