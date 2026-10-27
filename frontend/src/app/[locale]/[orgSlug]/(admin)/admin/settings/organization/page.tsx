import { pageTitle } from "@/lib/metadata";
import { OrganizationSettings } from "@/modules/settings";

export const generateMetadata = pageTitle("nav.organization");

export default function Page() {
  return <OrganizationSettings />;
}
