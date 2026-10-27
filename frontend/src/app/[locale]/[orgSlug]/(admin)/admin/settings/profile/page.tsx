import { pageTitle } from "@/lib/metadata";
import { ProfileSettings } from "@/modules/settings";

export const generateMetadata = pageTitle("nav.profile");

export default function Page() {
  return <ProfileSettings />;
}
