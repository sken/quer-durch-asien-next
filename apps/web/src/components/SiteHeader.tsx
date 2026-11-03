"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isSoon } from "@/lib/sections";

const NAV = [
  { href: "/", label: "Startseite", match: (p: string) => p === "/" },
  { href: "/bilder/russland/", label: "Bilder", match: (p: string) => /^\/(bilder|bild|album)\//.test(p) },
  { href: "/unsere-reise/", label: "Reiseroute", match: (p: string) => p.startsWith("/unsere-reise") },
  { href: "/tagebuch/", label: "Tagebuch", match: (p: string) => p.startsWith("/tagebuch") },
  { href: "/blog/", label: "Reiseblog", match: (p: string) => p.startsWith("/blog") },
];

function NavLinks({ path }: { path: string }) {
  return (
    <>
      {NAV.map((n) =>
        isSoon(n.href) ? (
          <span key={n.href} className="nav-link soon" title="kommt bald">
            {n.label} <small>(bald)</small>
          </span>
        ) : (
          <Link key={n.href} href={n.href} className="nav-link" aria-current={n.match(path) ? "page" : undefined}>
            {n.label}
          </Link>
        ),
      )}
    </>
  );
}

export default function SiteHeader() {
  const path = usePathname() ?? "/";
  return (
    <header className="site-header">
      {/* desktop and tablet: the hand-drawn route as the masthead */}
      <div className="route-header">
        <Link href="/" aria-label="Quer durch Asien, zur Startseite">
          <img src="/site/header.png" width={980} height={201} alt="Illustrierte Reiseroute: Russland, Mongolei, China, Tibet, Nepal, Indien" />
        </Link>
      </div>
      <nav className="main-nav" aria-label="Hauptnavigation">
        <NavLinks path={path} />
      </nav>

      {/* phone: a simple top bar; the menu works without JavaScript */}
      <div className="topbar">
        <Link href="/" className="brand">Quer durch Asien</Link>
        <details className="menu">
          <summary aria-label="Menü">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <nav aria-label="Hauptnavigation">
            <NavLinks path={path} />
          </nav>
        </details>
      </div>
    </header>
  );
}
