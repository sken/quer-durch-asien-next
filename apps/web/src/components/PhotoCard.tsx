import Link from "next/link";
import { photoUrl } from "@/lib/format";

export interface PhotoCardProps {
  slug: string;
  country: string;
  file: string;
  alt: string;
  left: string;
  right?: string;
  /** above-the-fold photos load eagerly; everything else lazily */
  eager?: boolean;
}

export default function PhotoCard({ slug, country, file, alt, left, right, eager }: PhotoCardProps) {
  return (
    <Link href={`/bild/${slug}/`} className="photo-card">
      <img src={photoUrl(country, file)} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" width={480} height={320} />
      <span className="caption">
        <span>{left}</span>
        {right ? <span>{right}</span> : null}
      </span>
    </Link>
  );
}
