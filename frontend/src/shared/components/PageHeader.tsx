import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  title,
  description,
  actions
}: PageHeaderProps) {
  return (
    <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
        {description && (
          <p className='text-muted-foreground text-sm'>{description}</p>
        )}
      </div>
      {actions && <div className='flex gap-2'>{actions}</div>}
    </div>
  );
}
