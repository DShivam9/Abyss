import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComponentDetailPagePage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/components?select=${slug}`);
}
