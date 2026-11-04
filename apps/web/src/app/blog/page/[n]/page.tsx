import type { Metadata } from "next";
import BlogList from "@/components/BlogList";
import { blogPages } from "@/lib/content";

export const dynamicParams = false;

// Page 1 is /blog/ itself.
export function generateStaticParams() {
  return Array.from({ length: blogPages() - 1 }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  return { title: `Reiseblog, Seite ${n}` };
}

export default async function BlogPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  return <BlogList page={Number(n)} />;
}
