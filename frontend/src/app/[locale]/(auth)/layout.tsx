import type { ReactNode } from "react";
import { Suspense } from "react";

import LocaleSwitcher from "@/shared/components/LocaleSwitcher";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className='relative flex min-h-screen items-center justify-center px-4 py-12'>
      <div className='absolute top-4 right-4'>
        <Suspense>
          <LocaleSwitcher />
        </Suspense>
      </div>
      {children}
    </main>
  );
}
