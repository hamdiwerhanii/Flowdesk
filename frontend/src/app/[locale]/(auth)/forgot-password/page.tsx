import { pageTitle } from "@/lib/metadata";
import { ForgotPasswordForm } from "@/modules/auth";

export const generateMetadata = pageTitle("auth.forgotTitle");

export default function Page() {
  return <ForgotPasswordForm />;
}
