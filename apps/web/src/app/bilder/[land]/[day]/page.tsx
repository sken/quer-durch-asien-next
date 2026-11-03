import type { Metadata } from "next";
import AlbumView from "@/components/AlbumView";
import { COUNTRIES, countryDays, countryName } from "@/lib/data";
import { shortDate } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.flatMap((c) => countryDays(c.slug).map((d) => ({ land: c.slug, day: d.day })));
}

export async function generateMetadata({ params }: { params: Promise<{ land: string; day: string }> }): Promise<Metadata> {
  const { land, day } = await params;
  const d = countryDays(land).find((x) => x.day === day);
  return { title: `${countryName(land)}, Tag ${d?.index ?? ""} (${shortDate(day)})` };
}

export default async function DayPage({ params }: { params: Promise<{ land: string; day: string }> }) {
  const { land, day } = await params;
  return <AlbumView country={land} day={day} />;
}
