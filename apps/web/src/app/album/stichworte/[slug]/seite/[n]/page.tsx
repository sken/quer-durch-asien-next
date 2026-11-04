import type { Metadata } from "next";
import KeywordView from "@/components/KeywordView";
import { getKeyword, getKeywords, keywordPages } from "@/lib/data";

// The old URLs /album/stichworte/<slug>/seite/N; page 1 is the keyword page itself.
export const dynamicParams = false;

export function generateStaticParams() {
  return getKeywords().flatMap((k) =>
    Array.from({ length: keywordPages(k) - 1 }, (_, i) => ({ slug: k.slug, n: String(i + 2) })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }): Promise<Metadata> {
  const { slug, n } = await params;
  return { title: `Fotos: ${getKeyword(slug)!.name}, Seite ${n}` };
}

export default async function KeywordPageN({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  return <KeywordView keyword={getKeyword(slug)!} page={Number(n)} />;
}
