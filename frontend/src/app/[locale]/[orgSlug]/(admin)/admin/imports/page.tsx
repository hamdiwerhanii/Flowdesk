import { pageTitle } from "@/lib/metadata";
import { ImportsRoot } from "@/modules/imports";

export const generateMetadata = pageTitle("nav.imports");

export default function Page() {
  return <ImportsRoot />;
}
