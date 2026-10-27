import { Suspense } from "react";

import { pageTitle } from "@/lib/metadata";
import { ResetPasswordForm } from "@/modules/auth";

export const generateMetadata = pageTitle("auth.resetTitle");

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
