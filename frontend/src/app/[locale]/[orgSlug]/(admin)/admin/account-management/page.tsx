import { pageTitle } from "@/lib/metadata";
import { AccountRequestsRoot } from "@/modules/account-management";

export const generateMetadata = pageTitle("nav.accountRequests");

export default function Page() {
  return <AccountRequestsRoot />;
}
