import type { Metadata } from "next";
import ContactBlock from "@/components/ContactBlock";

export const metadata: Metadata = { title: "Datenschutz" };

// Written from the facts in docs/datenschutz-fakten.md; keep both in sync
// when the site starts loading anything new.
export default function Datenschutz() {
  return (
    <div className="wrap page">
      <h1>Datenschutzerklärung</h1>
      <div className="sheet legal">
        <h2>Kurz gesagt</h2>
        <p>
          Diese Website ist ein privates Reisetagebuch. Sie setzt keine Cookies, verwendet keine Analyse- oder
          Tracking-Dienste, keine Werbung, keine Kommentarfunktion und kein Kontaktformular. Schriften werden
          nicht von Google geladen, sondern liegen auf dem eigenen Server. Karten von OpenStreetMap werden nur
          geladen, wenn man auf „Karte anzeigen“ klickt.
        </p>

        <h2>Verantwortlich</h2>
        <ContactBlock />

        <h2>Hosting und Server-Logdateien</h2>
        <p>
          Die Website und die Fotos liegen bei ALL-INKL.COM – Neue Medien Münnich, Hauptstraße 68,
          02742 Friedersdorf, Deutschland. Bei jedem Aufruf verarbeitet der Webserver technisch notwendige Daten:
          IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, Referrer, Browser und Betriebssystem
          (User-Agent) sowie den Statuscode. Das ist nötig, um die Seiten auszuliefern und den Betrieb sicher zu
          halten (Art. 6 Abs. 1 lit. f DSGVO). Die Logdateien werden nach den Einstellungen des Hosters
          automatisch gelöscht.
        </p>

        <h2>Karten von OpenStreetMap</h2>
        <p>
          Auf Fotoseiten und der Reiseroute kann man eine Karte einblenden. Erst nach dem Klick auf „Karte
          anzeigen“ lädt der Browser Kartenkacheln von den Servern der OpenStreetMap Foundation (St John’s
          Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Vereinigtes Königreich). Dabei werden IP-Adresse,
          Browserdaten und die aufgerufene Seite an die OpenStreetMap Foundation übertragen. Rechtsgrundlage ist
          die Einwilligung durch den Klick (Art. 6 Abs. 1 lit. a DSGVO); für das Vereinigte Königreich besteht
          ein Angemessenheitsbeschluss der EU-Kommission. Mehr dazu in der{" "}
          <a href="https://osmfoundation.org/wiki/Privacy_Policy">Datenschutzerklärung der OpenStreetMap Foundation</a>.
          Ohne Klick wird nichts von OpenStreetMap geladen.
        </p>

        <h2>Ortsangaben</h2>
        <p>
          Die Orte in der Nähe eines Fotos stammen aus der GeoNames-Datenbank. Sie wurden einmalig beim Erstellen
          der Website abgefragt; beim Besuch der Seiten wird GeoNames nicht kontaktiert.
        </p>

        <h2>Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft über die zu Ihrer Person gespeicherten Daten, auf Berichtigung,
          Löschung und Einschränkung der Verarbeitung, auf Widerspruch gegen die Verarbeitung sowie auf
          Datenübertragbarkeit (Art. 15 bis 21 DSGVO). Wenden Sie sich dazu an die oben genannte Adresse. Außerdem
          können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel beim Bayerischen
          Landesamt für Datenschutzaufsicht.
        </p>

        <p className="muted small">Stand: November 2026</p>
      </div>
    </div>
  );
}
