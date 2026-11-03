import Link from "next/link";
import { isSoon } from "@/lib/sections";

const LINKS = [
  { href: "/packliste/", label: "Packliste" },
  { href: "/impressum/", label: "Impressum" },
  { href: "/datenschutz/", label: "Datenschutz" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span className="hand">Quer durch Asien, 2008</span>
        <nav aria-label="Weitere Seiten">
          {LINKS.map((l) =>
            isSoon(l.href) ? (
              <span key={l.href} className="muted" title="kommt bald">{l.label} (bald)</span>
            ) : (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}
