import { pageTitle } from "@/lib/metadata";
import { DashboardRoot } from "@/modules/dashboard";

export const generateMetadata = pageTitle("nav.dashboard");

export default function Page() {
  return <DashboardRoot />;
}
