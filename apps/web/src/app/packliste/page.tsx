import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unsere Packliste für die Reise",
  description: "Was vier Leute für sechs Wochen Transsib, Mongolei, Tibet, Nepal und Indien eingepackt haben.",
};

// The packing list of the old site (views/packliste.php), word for word;
// its two smiley images became emoji.
const INTRO = "Jeder packt seinen Rucksack und nimmt mit:";
const SECTIONS: { title: string; items: string[] }[] = [
  {
    "title": "Unterlagen",
    "items": [
      "Reisepass/Visum",
      "Flugticket",
      "Zugtickets",
      "Geld (650 Euro bar) und Geldbeutel",
      "Kreditkarte (+ die Nummer zum sperren)",
      "Auslandskrankenversicherung",
      "Impfpass",
      "Passfotos",
      "Kopien aller Ausweise",
      "Familienfotos zum Herzeigen"
    ]
  },
  {
    "title": "Klamotten / Bekleidung",
    "items": [
      "Trekkingschuhe",
      "Trekkingsandalen",
      "Halbschuhe",
      "Socken",
      "Zip Hosen / Cargo-Hosen / kurze Hosen",
      "Regenjacke",
      "Unterwäsche",
      "T-Shirts",
      "Sweat-Shirt(s)",
      "Fleece-Shirts",
      "Wind- oder Regenjacke",
      "Mütze/Hut",
      "Handschuhe",
      "Sonnenbrille",
      "Badesachen",
      "Hilfe: Skiunterwäsche… ☹️ – Ulan-Bator = Kälteste Hauptstadt der Welt",
      "Handtuch"
    ]
  },
  {
    "title": "Ausrüstung / Equipment",
    "items": [
      "Tagesrucksack",
      "Trinkbecher",
      "Teller / Schüssel",
      "Vorhängeschloss",
      "Wäscheklammern",
      "Plastiktüten",
      "Schlafsack",
      "Jugendherbergschlafsack",
      "Isomatte",
      "Thermosflasche/Wasserflasche",
      "Desinfektionsmittel"
    ]
  },
  {
    "title": "Kulturbeutelkram",
    "items": [
      "Kernseife",
      "Zahnbürste",
      "Rasierzeug",
      "Unmengen an Deo 😉",
      "Klopapier",
      "Tempos",
      "Oropax",
      "Lippenschutz"
    ]
  },
  {
    "title": "dies und das",
    "items": [
      "Hüftgurt/Umhängetasche",
      "Reiselektüre"
    ]
  },
  {
    "title": "Katrin sorgt außerdem noch für / nimmt mit",
    "items": [
      "Packsafe",
      "Desinfektionsspray",
      "Après Lotion",
      "Wundsalbe / PVC-Salbe",
      "Geschirrspülmittel",
      "Bilder-Wörterbuch",
      "falls vorhanden: Nähzeug",
      "franz. Spielkarten"
    ]
  },
  {
    "title": "Evelyn sorgt außerdem noch für / nimmt mit",
    "items": [
      "All-in-one-Besteck",
      "Pinzette",
      "Schere",
      "Feile",
      "Fenestilgel (oder war des jmd. anderes?)",
      "Blasenpflaster (?)",
      "diverse Gastgeschenke",
      "Falls Vorhanden: Heft für Tagebuch",
      "Panzertape",
      "Fieberthermometer",
      "Aspirin"
    ]
  },
  {
    "title": "Steve sorgt außerdem noch für / nimmt mit",
    "items": [
      "Wasserfilter ( Care Plus Aqua Clean )",
      "100 Euro in russischen Rubel",
      "Pflaster & Verbandszeug, elastische Binde",
      "Autan Akut (nach Insektenstichen)",
      "Calcium, Magnesium (Brausetabletten)",
      "Vitamine",
      "Malarone",
      "bayrische Spielkarten",
      "Adapterstecker",
      "Objektiv",
      "Datalogger",
      "Plastikbeutel",
      "Buntstifte zum Herschenken",
      "Schnupftabak"
    ]
  },
  {
    "title": "Flo sorgt außerdem noch für / nimmt mit",
    "items": [
      "Schmerzmittel: Paracetamol",
      "Antibiotikum",
      "Wunddesinfektionsmittel",
      "Malarone",
      "sterile Nadeln",
      "Durchfallmittel: Lopedium akut, Immodium akut, Kohletabletten",
      "Abführmittel",
      "Mittel gegen Höhenkrankheit",
      "Insektenschutzmittel: NoBite",
      "Falls vorhanden: Nähzeug",
      "Stativ",
      "Lautsprecher",
      "chinesische Yuan",
      "Nagelclip",
      "0,02/0,04l-Trinkgefäß",
      "Thermometer",
      "Nagelclip",
      "evtl. Fernglas",
      "Sonnencreme LSF 15",
      "Tabu-Spielkarten",
      "Ersatz-Kontaktlinsen",
      "Kontaktlinsenmittel + Behälter",
      "Brille",
      "Schnupftabak"
    ]
  },
  {
    "title": "Nicht alle packen zusätzlich noch in ihren Rucksack",
    "items": [
      "Jugendherbergsausweis",
      "Gürtel mit Geldfach",
      "Funktionsunterwäsche",
      "Unterhemden",
      "Softshell-Jacke",
      "Schal",
      "Kopftuch",
      "Feuchte (Körper)Reinigungstücher",
      "Gesichtspflege",
      "Pille",
      "OBs",
      "Jogginganzug",
      "Schlafanzug",
      "Make-up",
      "Haargummis / Haarklammern",
      "Decke",
      "Kissen",
      "MP3-Player",
      "Waschmittel",
      "Zahnpasta",
      "Duschgel",
      "Haarshampoo",
      "Kamm",
      "Kamera",
      "Akkus",
      "Ersatzbatterien (AAA)",
      "Speicherkarten",
      "Handy",
      "Handyladegerät",
      "Adressliste (Postkarten)",
      "Taschenmesser / Essbesteck / Allzwecktool",
      "Teleskopfensterputzer",
      "Feuerzeug",
      "Moskitonetz",
      "Taschenlampe",
      "Reiseführer",
      "Schreibutensilien / Papier"
    ]
  }
];

export default function PackingList() {
  return (
    <div className="wrap page">
      <div className="title-row">
        <h1>Packliste</h1>
        <span className="hand">sechs Wochen, ein Rucksack</span>
      </div>
      <p style={{ marginTop: -12 }}><strong>{INTRO}</strong></p>
      <div className="packing">
        {SECTIONS.map((s) => (
          <section key={s.title} className="sheet">
            <h2>{s.title}</h2>
            <ul>
              {s.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
