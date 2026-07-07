import { DetailPageClient } from "./DetailPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComponentDetailPagePage({ params }: PageProps) {
  const { slug } = await params;
  return <DetailPageClient slug={slug} />;
}
