import { Headset } from "lucide-react";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthCard({
  title,
  subtitle,
  children,
  footer
}: AuthCardProps) {
  return (
    <div className='w-full max-w-md space-y-6'>
      <div className='space-y-3 text-center'>
        <span className='bg-primary text-primary-foreground mx-auto grid size-11 place-items-center rounded-xl'>
          <Headset className='size-5' aria-hidden />
        </span>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
          <p className='text-muted-foreground text-sm'>{subtitle}</p>
        </div>
      </div>
      <div className='bg-card rounded-xl border p-6 shadow-sm'>{children}</div>
      {footer && (
        <div className='text-muted-foreground space-y-1 text-center text-sm'>
          {footer}
        </div>
      )}
    </div>
  );
}
