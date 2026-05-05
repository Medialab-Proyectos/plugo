import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Textarea — PLUGO Design System v2
 * Same recessed surface language as Input. Distinct from Buttons.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex w-full field-sizing-content min-h-24 px-4 py-3 text-base md:text-sm',
        'rounded-2xl',
        'bg-[var(--input)] border border-[var(--input-border)]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.25)]',
        'text-foreground placeholder:text-[var(--input-placeholder)] caret-primary',
        'outline-none transition-[color,box-shadow,border-color] duration-200',
        'focus-visible:border-[var(--input-border-focus)] focus-visible:ring-4 focus-visible:ring-primary/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15',
        'text-[16px] md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
