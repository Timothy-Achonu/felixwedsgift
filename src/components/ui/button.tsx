"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "button focus-ring relative cursor-pointer disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        cream: "button-cream",
        blue: "button-blue",
        outlineNavy: "button-outline-navy",
        navy: "rounded-none border-wedding-navy bg-wedding-navy px-4 py-[0.95rem] text-[0.72rem] font-extrabold tracking-[0.08em] text-wedding-cream hover:not-disabled:bg-wedding-brown focus-visible:bg-wedding-brown disabled:cursor-wait",
      },
    },
    defaultVariants: {
      variant: "outlineNavy",
    },
  },
);

function ButtonSpinner({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 20 20"
      aria-hidden="true"
      data-icon="loading"
      className={cn("size-4 shrink-0 animate-spin", className)}
    >
      <circle
        className="stroke-current opacity-30"
        cx="10"
        cy="10"
        r="8"
        fill="none"
        strokeWidth="2"
      />
      <circle
        className="stroke-current"
        cx="10"
        cy="10"
        r="8"
        fill="none"
        strokeWidth="2"
        strokeDasharray="12.5 50"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    showTextWhileLoading?: boolean;
  };

function Button({
  className,
  variant,
  asChild = false,
  isLoading = false,
  showTextWhileLoading = true,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant }), className);

  if (asChild && !isLoading) {
    return (
      <Slot data-slot="button" className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <ButtonSpinner
          className={cn(
            !showTextWhileLoading &&
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          )}
        />
      ) : null}
      {showTextWhileLoading || !isLoading ? (
        children
      ) : (
        <span className="invisible">{children}</span>
      )}
    </button>
  );
}

export { Button, buttonVariants };
