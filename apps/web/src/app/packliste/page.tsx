'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Helper interface for checklist items
interface ChecklistState {
    [key: string]: boolean;
}

export default function PacklistePage() {
    const [checkedItems, setCheckedItems] = useState<ChecklistState>({});

    // Load checklist state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('qda_packliste_checked');
        if (saved) {
            try {
                setCheckedItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse checklist state', e);
            }
        }
    }, []);

    // Save checklist state to localStorage when it changes
    const toggleItem = (itemId: string) => {
        const newState = {
            ...checkedItems,
            [itemId]: !checkedItems[itemId],
        };
        setCheckedItems(newState);
        localStorage.setItem('qda_packliste_checked', JSON.stringify(newState));
    };

    const resetChecklist = () => {
        if (confirm('Möchtest du alle Haken wirklich zurücksetzen?')) {
            setCheckedItems({});
            localStorage.removeItem('qda_packliste_checked');
        }
    };

    // Rendering helper for list items
    const renderItem = (category: string, itemText: string) => {
        const itemId = `${category}-${itemText.replace(/\s+/g, '-').toLowerCase()}`;
        const isChecked = !!checkedItems[itemId];
        
        // Remove HTML tags for clean label
        const cleanText = itemText.replace(/<[^>]*>/g, '');

        return (
            <li key={itemId} className="flex items-start gap-2.5 py-1 text-sm select-none">
                <input
                    type="checkbox"
                    id={itemId}
                    checked={isChecked}
                    onChange={() => toggleItem(itemId)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer print:hidden"
                />
                {/* Print only checkboxes */}
                <span className="hidden print:inline-block w-3.5 h-3.5 border border-black/40 rounded-sm mr-1 mt-0.5" />
                <label 
                    htmlFor={itemId} 
                    className={`cursor-pointer ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                >
                    {cleanText}
                </label>
            </li>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 font-sans bg-white min-h-screen">
            {/* Header */}
            <header className="mb-10 border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end md:justify-between print:mb-6 print:border-b-2 print:border-black">
                <div>
                    <div className="text-sm text-gray-500 mb-2 print:hidden">
                        <Link href="/" className="hover:underline text-blue-600">Startseite</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-400">Packliste</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Packliste</h1>
                    <p className="mt-2 text-gray-600 print:text-black">
                        Unsere Packliste für die Asienreise (Transsib & Seidenstraße)
                    </p>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 md:mt-0 flex gap-3 print:hidden">
                    <button
                        onClick={resetChecklist}
                        className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3.5 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        Zurücksetzen
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="text-xs font-semibold text-white bg-blue-600 px-3.5 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                    >
                        Drucken 🖨️
                    </button>
                </div>
            </header>

            {/* Intro paragraph */}
            <p className="mb-8 text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3 print:border-l-0 print:pl-0 print:mb-4">
                Jeder packt seinen Rucksack und nimmt mit:
            </p>

            <main className="space-y-12 print:space-y-6">
                {/* Section 1: Everyone's Shared Items */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 print:grid-cols-2 print:gap-4">
                    {/* Documents */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-150 shadow-sm print:bg-white print:border-0 print:p-0 print:shadow-none">
                        <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3 print:border-black print:pb-1">
                            Unterlagen
                        </h3>
                        <ul className="space-y-1">
                            {renderItem('shared-docs', 'Reisepass / Visum')}
                            {renderItem('shared-docs', 'Flugticket')}
                            {renderItem('shared-docs', 'Zugtickets')}
                            {renderItem('shared-docs', 'Geld (650 Euro bar) & Geldbeutel')}
                            {renderItem('shared-docs', 'Kreditkarte (+ Sperr-Notrufnummer)')}
                            {renderItem('shared-docs', 'Auslandskrankenversicherung')}
                            {renderItem('shared-docs', 'Impfpass')}
                            {renderItem('shared-docs', 'Passfotos')}
                            {renderItem('shared-docs', 'Kopien aller Ausweise')}
                            {renderItem('shared-docs', 'Familienfotos zum Herzeigen')}
                        </ul>
                    </div>

                    {/* Clothing */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-150 shadow-sm print:bg-white print:border-0 print:p-0 print:shadow-none">
                        <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3 print:border-black print:pb-1">
                            Bekleidung
                        </h3>
                        <ul className="space-y-1">
                            {renderItem('shared-wear', 'Trekkingschuhe')}
                            {renderItem('shared-wear', 'Trekkingsandalen')}
                            {renderItem('shared-wear', 'Halbschuhe')}
                            {renderItem('shared-wear', 'Socken')}
                            {renderItem('shared-wear', 'Zip-Hosen / Cargo-Hosen / kurze Hosen')}
                            {renderItem('shared-wear', 'Regenjacke')}
                            {renderItem('shared-wear', 'Unterwäsche')}
                            {renderItem('shared-wear', 'T-Shirts')}
                            {renderItem('shared-wear', 'Sweat-Shirt(s)')}
                            {renderItem('shared-wear', 'Fleece-Shirts')}
                            {renderItem('shared-wear', 'Wind- oder Regenjacke')}
                            {renderItem('shared-wear', 'Mütze / Hut')}
                            {renderItem('shared-wear', 'Handschuhe')}
                            {renderItem('shared-wear', 'Sonnenbrille')}
                            {renderItem('shared-wear', 'Badesachen')}
                            {renderItem('shared-wear', 'Skiunterwäsche (Ulan-Bator = Kälteste Hauptstadt)')}
                            {renderItem('shared-wear', 'Handtuch')}
                        </ul>
                    </div>

                    {/* Equipment */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-150 shadow-sm print:bg-white print:border-0 print:p-0 print:shadow-none">
                        <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3 print:border-black print:pb-1">
                            Ausrüstung / Equipment
                        </h3>
                        <ul className="space-y-1">
                            {renderItem('shared-equip', 'Tagesrucksack')}
                            {renderItem('shared-equip', 'Trinkbecher')}
                            {renderItem('shared-equip', 'Teller / Schüssel')}
                            {renderItem('shared-equip', 'Vorhängeschloss')}
                            {renderItem('shared-equip', 'Wäscheklammern')}
                            {renderItem('shared-equip', 'Plastiktüten')}
                            {renderItem('shared-equip', 'Schlafsack')}
                            {renderItem('shared-equip', 'Jugendherbergschlafsack')}
                            {renderItem('shared-equip', 'Isomatte')}
                            {renderItem('shared-equip', 'Thermosflasche / Wasserflasche')}
                            {renderItem('shared-equip', 'Desinfektionsmittel')}
                        </ul>
                    </div>

                    {/* Toiletries */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-150 shadow-sm print:bg-white print:border-0 print:p-0 print:shadow-none">
                        <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3 print:border-black print:pb-1">
                            Kulturbeutelkram
                        </h3>
                        <ul className="space-y-1">
                            {renderItem('shared-wash', 'Kernseife')}
                            {renderItem('shared-wash', 'Zahnbürste')}
                            {renderItem('shared-wash', 'Rasierzeug')}
                            {renderItem('shared-wash', 'Deo')}
                            {renderItem('shared-wash', 'Klopapier')}
                            {renderItem('shared-wash', 'Tempos')}
                            {renderItem('shared-wash', 'Oropax')}
                            {renderItem('shared-wash', 'Lippenschutz')}
                        </ul>
                        
                        <h4 className="font-bold text-gray-650 text-xs uppercase tracking-wider mt-5 mb-2 border-t border-gray-200 pt-3 print:border-0 print:pt-0 print:mt-2">
                            Dies und das..
                        </h4>
                        <ul className="space-y-1">
                            {renderItem('shared-misc', 'Hüftgurt / Umhängetasche')}
                            {renderItem('shared-misc', 'Reiselektüre')}
                        </ul>
                    </div>
                </section>

                <hr className="border-gray-200 print:border-black print:border-t-2" />

                {/* Section 2: Individual Responsibilities */}
                <p className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3 print:border-l-0 print:pl-0 print:my-3">
                    Individuelle Zuteilung und Sonderausrüstung:
                </p>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 print:grid-cols-2 print:gap-4">
                    {/* Katrin */}
                    <div className="bg-blue-50/30 rounded-xl p-5 border border-blue-100 shadow-sm print:bg-white print:border-0 print:p-0 print:shadow-none">
                        <h3 className="font-bold text-blue-900 border-b border-blue-100 pb-2 mb-3 print:border-black print:text-black print:pb-1">
                            Katrin
                        </h3>
                        <ul className="space-y-1">
                            {renderItem('katrin', 'Packsafe')}
                            {renderItem('katrin', 'Desinfektionsspray')}
                            {renderItem('katrin', 'Après Lotion')}
                            {renderItem('katrin', 'Wundsalbe / PVC-Salbe')}
                            {renderItem('katrin', 'Geschirrspülmittel')}
                            {renderItem('katrin', 'Bilder-Wörterbuch')}
                            {renderItem('katrin', 'Nähzeug (falls vorhanden)')}
                            {renderItem('katrin', 'Französische Spielkarten')}
                        </ul>
                    </div>

                    {/* Evelyn */}
                    <div className="bg-blue-50/30 rounded-xl p-5 border border-blue-100 shadow-sm print:bg-white print:border-0 print:p-0 print:shadow-none">
                        <h3 className="font-bold text-blue-900 border-b border-blue-100 pb-2 mb-3 print:border-black print:text-black print:pb-1">
                            Evelyn
                        </h3>
                        <ul className="space-y-1">
                            {renderItem('evelyn', 'All-in-one-Besteck')}
                            {renderItem('evelyn', 'Pinzette')}
                            {renderItem('evelyn', 'Schere')}
                            {renderItem('evelyn', 'Feile')}
                            {renderItem('evelyn', 'Fenistil Gel')}
                            {renderItem('evelyn', 'Blasenpflaster')}
                            {renderItem('evelyn', 'Diverse Gastgeschenke')}
                            {renderItem('evelyn', 'Heft für Tagebuch')}
                            {renderItem('evelyn', 'Panzertape')}
                            {renderItem('evelyn', 'Fieberthermometer')}
                            {renderItem('evelyn', 'Aspirin')}
                        </ul>
                    </div>

                    {/* Steve */}
                    <div className="bg-blue-50/30 rounded-xl p-5 border border-blue-100 shadow-sm print:bg-white print:border-0 print:p-0 print:shadow-none">
                        <h3 className="font-bold text-blue-900 border-b border-blue-100 pb-2 mb-3 print:border-black print:text-black print:pb-1">
                            Steve
                        </h3>
                        <ul className="space-y-1">
                            {renderItem('steve', 'Wasserfilter (Care Plus Aqua Clean)')}
                            {renderItem('steve', '100 Euro in russischen Rubel')}
                            {renderItem('steve', 'Pflaster, Verbandszeug & elastische Binde')}
                            {renderItem('steve', 'Autan Akut (nach Insektenstichen)')}
                            {renderItem('steve', 'Calcium & Magnesium (Brausetabletten)')}
                            {renderItem('steve', 'Vitamine')}
                            {renderItem('steve', 'Malarone (Malariaprophylaxe)')}
                            {renderItem('steve', 'Bayerische Spielkarten')}
                            {renderItem('steve', 'Adapterstecker')}
                            {renderItem('steve', 'Objektiv')}
                            {renderItem('steve', 'Datalogger')}
                            {renderItem('steve', 'Plastikbeutel')}
                            {renderItem('steve', 'Buntstifte zum Herschenken')}
                            {renderItem('steve', 'Schnupftabak')}
                        </ul>
                    </div>

                    {/* Flo */}
                    <div className="bg-blue-50/30 rounded-xl p-5 border border-blue-100 shadow-sm print:bg-white print:border-0 print:p-0 print:shadow-none">
                        <h3 className="font-bold text-blue-900 border-b border-blue-100 pb-2 mb-3 print:border-black print:text-black print:pb-1">
                            Flo
                        </h3>
                        <ul className="space-y-1">
                            {renderItem('flo', 'Schmerzmittel (Paracetamol)')}
                            {renderItem('flo', 'Antibiotikum')}
                            {renderItem('flo', 'Wunddesinfektionsmittel')}
                            {renderItem('flo', 'Malarone (Malariaprophylaxe)')}
                            {renderItem('flo', 'Sterile Nadeln')}
                            {renderItem('flo', 'Durchfallmittel (Lopedium, Imodium, Kohle)')}
                            {renderItem('flo', 'Abführmittel (Glaubersalz)')}
                            {renderItem('flo', 'Mittel gegen Höhenkrankheit')}
                            {renderItem('flo', 'Insektenschutzmittel (NoBite)')}
                            {renderItem('flo', 'Nähzeug (falls vorhanden)')}
                            {renderItem('flo', 'Stativ')}
                            {renderItem('flo', 'Lautsprecher')}
                            {renderItem('flo', 'Chinesische Yuan')}
                            {renderItem('flo', 'Nagelclip')}
                            {renderItem('flo', '0,02l / 0,04l Trinkgefäß')}
                            {renderItem('flo', 'Thermometer')}
                            {renderItem('flo', 'Fernglas (evtl.)')}
                            {renderItem('flo', 'Sonnencreme LSF 15')}
                            {renderItem('flo', 'Tabu-Spielkarten')}
                            {renderItem('flo', 'Ersatz-Kontaktlinsen')}
                            {renderItem('flo', 'Kontaktlinsenmittel & Behälter')}
                            {renderItem('flo', 'Brille')}
                            {renderItem('flo', 'Schnupftabak')}
                        </ul>
                    </div>
                </section>

                <hr className="border-gray-200 print:border-black print:border-t-2" />

                {/* Section 3: Optional Personal Items */}
                <section className="bg-gray-50 rounded-xl p-6 border border-gray-150 shadow-sm print:bg-white print:border-0 print:p-0 print:shadow-none">
                    <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 print:border-black print:pb-1">
                        Nicht alle packen zusätzlich noch in ihren Rucksack (Optionales):
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1">
                        {renderItem('optional', 'Jugendherbergsausweis')}
                        {renderItem('optional', 'Gürtel mit Geldfach')}
                        {renderItem('optional', 'Funktionsunterwäsche')}
                        {renderItem('optional', 'Unterhemden')}
                        {renderItem('optional', 'Softshell-Jacke')}
                        {renderItem('optional', 'Schal')}
                        {renderItem('optional', 'Kopftuch')}
                        {renderItem('optional', 'Feuchte Körperreinigungstücher')}
                        {renderItem('optional', 'Gesichtspflege')}
                        {renderItem('optional', 'Pille')}
                        {renderItem('optional', 'OBs')}
                        {renderItem('optional', 'Jogginganzug')}
                        {renderItem('optional', 'Schlafanzug')}
                        {renderItem('optional', 'Make-up')}
                        {renderItem('optional', 'Haargummis / Haarklammern')}
                        {renderItem('optional', 'Decke')}
                        {renderItem('optional', 'Kissen')}
                        {renderItem('optional', 'MP3-Player')}
                        {renderItem('optional', 'Waschmittel')}
                        {renderItem('optional', 'Zahnpasta')}
                        {renderItem('optional', 'Duschgel')}
                        {renderItem('optional', 'Haarshampoo')}
                        {renderItem('optional', 'Kamm')}
                        {renderItem('optional', 'Kamera')}
                        {renderItem('optional', 'Akkus')}
                        {renderItem('optional', 'Ersatzbatterien (AAA)')}
                        {renderItem('optional', 'Speicherkarten')}
                        {renderItem('optional', 'Handy')}
                        {renderItem('optional', 'Handyladegerät')}
                        {renderItem('optional', 'Adressliste (Postkarten)')}
                        {renderItem('optional', 'Taschenmesser / Essbesteck / Allzwecktool')}
                        {renderItem('optional', 'Teleskopfensterputzer')}
                        {renderItem('optional', 'Feuerzeug')}
                        {renderItem('optional', 'Moskitonetz')}
                        {renderItem('optional', 'Taschenlampe')}
                        {renderItem('optional', 'Reiseführer')}
                        {renderItem('optional', 'Schreibutensilien / Papier')}
                    </ul>
                </section>
            </main>
        </div>
    );
}
