"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

/**
 * TextField — PLUGO Design System v2
 *
 * Composite that wraps an input/textarea/select with:
 *  - Label (always above the field for clarity, M3 outlined-style)
 *  - Optional leading icon (left)
 *  - Optional trailing element (right — clear button, unit, etc.)
 *  - Helper text or error message
 *
 * Use this in forms instead of stitching <Label> + <Input> + helper manually.
 *
 * @example
 *   <TextField label="Correo" id="email" leadingIcon={<Mail />}>
 *     <Input id="email" type="email" placeholder="tu@correo.com" />
 *   </TextField>
 */
export function TextField({
  id,
  label,
  helper,
  error,
  required,
  leadingIcon,
  trailing,
  size = "md",
  className,
  children,
}: {
  id?: string
  label?: string
  helper?: string
  error?: string
  required?: boolean
  leadingIcon?: React.ReactNode
  trailing?: React.ReactNode
  size?: "md" | "lg"
  className?: string
  children: React.ReactNode
}) {
  const hasError = Boolean(error)
  const heightClass = size === "lg" ? "h-14" : "h-12"

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            hasError ? "text-destructive" : "text-foreground-muted",
          )}
        >
          {label}
          {required && <span aria-hidden className="text-destructive">*</span>}
        </Label>
      )}

      {leadingIcon || trailing ? (
        <div
          className={cn(
            // Wrapper that simulates the input surface so leading/trailing align
            "relative flex w-full items-center",
            heightClass,
          )}
        >
          {leadingIcon && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-4 z-10 flex h-5 w-5 items-center justify-center text-foreground-muted [&_svg]:size-5"
            >
              {leadingIcon}
            </span>
          )}
          <div
            className={cn(
              "flex h-full w-full",
              // Inject padding for icon spacing
              leadingIcon && "[&_input]:pl-11 [&_textarea]:pl-11 [&_button]:pl-11",
              trailing && "[&_input]:pr-12 [&_textarea]:pr-12 [&_button]:pr-12",
            )}
          >
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<{ className?: string; id?: string; "aria-invalid"?: boolean }>, {
                    id: id ?? (child.props as { id?: string }).id,
                    "aria-invalid": hasError || undefined,
                    className: cn(heightClass, (child.props as { className?: string }).className),
                  })
                : child,
            )}
          </div>
          {trailing && (
            <span className="absolute right-3 z-10 flex h-9 items-center justify-center">
              {trailing}
            </span>
          )}
        </div>
      ) : (
        React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ className?: string; id?: string; "aria-invalid"?: boolean }>, {
                id: id ?? (child.props as { id?: string }).id,
                "aria-invalid": hasError || undefined,
                className: cn(heightClass, (child.props as { className?: string }).className),
              })
            : child,
        )
      )}

      {(helper || error) && (
        <p
          id={id ? `${id}-helper` : undefined}
          role={hasError ? "alert" : undefined}
          className={cn(
            "px-1 text-xs leading-tight",
            hasError ? "text-destructive" : "text-foreground-muted",
          )}
        >
          {error || helper}
        </p>
      )}
    </div>
  )
}
