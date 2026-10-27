import { pageTitle } from "@/lib/metadata";
import { RegisterOrganizationForm } from "@/modules/auth";

export const generateMetadata = pageTitle("auth.registerOrgTitle");

export default function Page() {
  return <RegisterOrganizationForm />;
}
