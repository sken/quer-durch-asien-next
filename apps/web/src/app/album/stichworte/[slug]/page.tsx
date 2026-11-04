import type { Metadata } from "next";
import KeywordView from "@/components/KeywordView";
import { getKeyword, getKeywords } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getKeywords().map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const k = getKeyword(slug)!;
  return { title: `Fotos: ${k.name}`, description: `${k.images.length} Fotos zum Stichwort „${k.name}“ von der Reise quer durch Asien.` };
}

export default async function KeywordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <KeywordView keyword={getKeyword(slug)!} page={1} />;
}
