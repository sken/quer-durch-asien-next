import type { Metadata } from "next";
import AlbumView from "@/components/AlbumView";
import { COUNTRIES, countryDays, countryName } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ land: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ land: string }> }): Promise<Metadata> {
  const { land } = await params;
  return { title: `Bilder aus ${countryName(land)}` };
}

/** /bilder/<land>/ opens the country on its first travel day. */
export default async function CountryPage({ params }: { params: Promise<{ land: string }> }) {
  const { land } = await params;
  return <AlbumView country={land} day={countryDays(land)[0].day} />;
}
