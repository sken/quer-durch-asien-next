import type { Metadata } from "next";
import { Caveat, Source_Serif_4 } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

// next/font downloads the fonts at build time and serves them from this site,
// so visitors never contact Google.
const serif = Source_Serif_4({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-serif", display: "swap" });
const hand = Caveat({ subsets: ["latin", "latin-ext"], weight: ["500", "700"], variable: "--font-hand", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Quer durch Asien", template: "%s | Quer durch Asien" },
  description:
    "6 Wochen quer durch Eurasien: mit der Transsibirischen Eisenbahn durch Russland, durch die Mongolei nach Peking, über Tibet nach Nepal und Indien. Fotos, Tagebuch und Reiseroute von 2008.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${serif.variable} ${hand.variable}`}>
      <body>
        <a className="skip-link" href="#inhalt">Zum Inhalt</a>
        <SiteHeader />
        <main id="inhalt">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
