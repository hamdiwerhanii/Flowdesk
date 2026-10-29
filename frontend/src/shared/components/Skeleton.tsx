import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-shimmer rounded-xl bg-[linear-gradient(90deg,var(--muted)_0%,#e9ecf1_50%,var(--muted)_100%)] bg-size-[800px_100%]",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className='space-y-3' role='status' aria-busy>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className='h-12 w-full' />
      ))}
    </div>
  );
}
