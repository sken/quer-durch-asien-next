import type { Metadata } from "next";
import Link from "next/link";
import ContactBlock from "@/components/ContactBlock";

export const metadata: Metadata = { title: "Impressum" };

export default function Impressum() {
  return (
    <div className="wrap page">
      <h1>Impressum</h1>
      <div className="sheet legal">
        <h2>Verantwortlich für den Inhalt</h2>
        <p className="muted small">Angaben nach § 5 DDG und § 18 Abs. 1 MStV</p>
        <ContactBlock />

        <h2>Urheberrecht</h2>
        <p>
          Texte und Fotos dieser Website sind urheberrechtlich geschützt. Wer etwas davon verwenden möchte,
          fragt bitte vorher per E-Mail.
        </p>

        <h2>Links</h2>
        <p>
          Für die Inhalte verlinkter fremder Websites sind deren Betreiber verantwortlich. Viele Links in Tagebuch
          und Blog stammen aus dem Jahr 2008 und führen heute womöglich ins Leere.
        </p>

        <p className="muted small"><Link href="/datenschutz/">Datenschutzerklärung</Link></p>
      </div>
    </div>
  );
}
