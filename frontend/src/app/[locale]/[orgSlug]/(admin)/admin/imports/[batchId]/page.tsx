import { pageTitle } from "@/lib/metadata";
import { ImportBatchRoot } from "@/modules/imports";

export const generateMetadata = pageTitle("nav.imports");

type PageProps = { params: Promise<{ batchId: string }> };

export default async function Page({ params }: PageProps) {
  const { batchId } = await params;
  return <ImportBatchRoot batchId={batchId} />;
}
