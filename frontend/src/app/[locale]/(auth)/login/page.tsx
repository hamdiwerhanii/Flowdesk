import { pageTitle } from "@/lib/metadata";
import { LoginForm } from "@/modules/auth";

export const generateMetadata = pageTitle("auth.login");

export default function Page() {
  return <LoginForm />;
}
