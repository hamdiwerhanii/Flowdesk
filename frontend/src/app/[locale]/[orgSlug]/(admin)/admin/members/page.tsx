import { pageTitle } from "@/lib/metadata";
import { MembersRoot } from "@/modules/members";

export const generateMetadata = pageTitle("nav.members");

export default function Page() {
  return <MembersRoot />;
}
