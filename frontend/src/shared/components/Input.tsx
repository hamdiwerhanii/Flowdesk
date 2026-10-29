import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const fieldClassName =
  "w-full rounded-xl border border-input bg-card px-3.5 text-sm shadow-xs transition-colors placeholder:text-muted-foreground/80 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none disabled:bg-muted disabled:opacity-70 aria-invalid:border-danger aria-invalid:ring-danger/15";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldClassName, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(fieldClassName, "min-h-24 py-2 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(fieldClassName, "h-10 pr-8", className)} {...props} />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("text-foreground/90 text-sm font-semibold", className)}
      {...props}
    />
  );
}
