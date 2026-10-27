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
    <div className='flex flex-col items-center justify-center gap-3 px-6 py-14 text-center'>
      <div className='bg-muted rounded-full p-3'>
        <Icon className='text-muted-foreground size-6' aria-hidden />
      </div>
      <div className='space-y-1'>
        <p className='font-medium'>{title}</p>
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
