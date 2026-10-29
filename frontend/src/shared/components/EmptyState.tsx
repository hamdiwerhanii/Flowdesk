import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className='animate-fade-up flex flex-col items-center justify-center gap-4 px-6 py-16 text-center'>
      <div className='relative'>
        <div
          className='bg-primary/15 absolute inset-0 animate-pulse rounded-3xl blur-xl'
          aria-hidden
        />
        <div className='from-primary-soft to-accent-soft text-primary relative grid size-16 place-items-center rounded-3xl bg-linear-to-br ring-1 ring-white'>
          <Icon className='size-7' aria-hidden />
        </div>
      </div>
      <div className='space-y-1.5'>
        <p className='text-base font-bold tracking-tight'>{title}</p>
        {description && (
          <p className='text-muted-foreground max-w-sm text-sm'>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
