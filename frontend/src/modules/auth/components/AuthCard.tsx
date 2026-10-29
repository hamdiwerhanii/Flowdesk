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
    <div className='animate-fade-up w-full max-w-md space-y-7'>
      <div className='space-y-4 text-center'>
        <span className='mx-auto grid size-12 place-items-center rounded-2xl bg-linear-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-600/30 lg:hidden'>
          <Headset className='size-5' aria-hidden />
        </span>
        <div className='space-y-1.5'>
          <h1 className='text-3xl font-extrabold tracking-tight'>{title}</h1>
          <p className='text-muted-foreground text-sm'>{subtitle}</p>
        </div>
      </div>
      <div className='bg-card/90 shadow-card rounded-3xl border border-white p-7 ring-1 ring-black/5 backdrop-blur'>
        {children}
      </div>
      {footer && (
        <div className='text-muted-foreground space-y-1 text-center text-sm'>
          {footer}
        </div>
      )}
    </div>
  );
}
