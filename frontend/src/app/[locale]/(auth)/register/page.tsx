import { pageTitle } from "@/lib/metadata";
import { RegisterForm } from "@/modules/auth";

export const generateMetadata = pageTitle("auth.registerTitle");

export default function Page() {
  return <RegisterForm />;
}
