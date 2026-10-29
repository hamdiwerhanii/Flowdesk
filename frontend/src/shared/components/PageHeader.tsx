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
    <div className='mb-8 flex flex-wrap items-end justify-between gap-4'>
      <div className='space-y-1.5'>
        <h1 className='text-[28px] leading-tight font-bold tracking-tight'>
          {title}
        </h1>
        {description && (
          <p className='text-muted-foreground max-w-2xl text-sm'>
            {description}
          </p>
        )}
      </div>
      {actions && <div className='flex flex-wrap gap-2'>{actions}</div>}
    </div>
  );
}
