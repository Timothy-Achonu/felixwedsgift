"use client";

import { Check, CircleAlert } from "lucide-react";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

import { cn } from "@/lib/cn";

function Toaster({ className, ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      duration={5000}
      visibleToasts={3}
      className={cn("toaster", className)}
      toastOptions={{
        classNames: {
          toast:
            "flex items-start gap-3 rounded-none border border-wedding-navy/16 bg-wedding-cream px-5 py-4 text-wedding-navy shadow-[0.7rem_0.7rem_0_color-mix(in_srgb,var(--wedding-brown)_12%,transparent)] min-w-[min(24rem,calc(100vw-2rem))]",
          title: "font-display text-lg leading-tight font-medium",
          description: "text-sm leading-relaxed text-wedding-navy/70",
          icon: "mt-0.5",
        },
      }}
      {...props}
    />
  );
}

function toastSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 5000,
    icon: (
      <span className="bg-wedding-blue text-wedding-brown grid size-10 place-items-center rounded-full">
        <Check className="size-5" aria-hidden="true" />
      </span>
    ),
  });
}

function toastError(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: 6000,
    icon: (
      <span className="bg-status-error/12 text-status-error grid size-10 place-items-center rounded-full">
        <CircleAlert className="size-5" aria-hidden="true" />
      </span>
    ),
  });
}

export { Toaster, toastError, toastSuccess };
