import Link from 'next/link';
import MapWrapper from './MapWrapper';

interface TrackPoint {
    id: string;
    lat: number;
    lng: number;
    alt: number;
    utc: number;
    country: string;
}

interface PhotoPoint {
    id: number;
    title: string;
    file: string;
    folder: string;
    lat: number;
    lng: number;
    alt: number;
}

async function getGpsTracks(): Promise<TrackPoint[]> {
    const res = await fetch('http://localhost:3000/gps/tracks?downsample=15', {
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new Error('Failed to fetch GPS tracks');
    }
    return res.json();
}

async function getGeotaggedPhotos(): Promise<PhotoPoint[]> {
    const res = await fetch('http://localhost:3000/gps/photos', {
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new Error('Failed to fetch geotagged photos');
    }
    return res.json();
}

export default async function TravelMapPage() {
    try {
        const [tracks, photos] = await Promise.all([
            getGpsTracks(),
            getGeotaggedPhotos(),
        ]);

        return (
            <div className="max-w-6xl mx-auto px-6 py-12 font-sans">
                <header className="mb-8 border-b border-gray-200 pb-6">
                    <div className="text-sm text-gray-500 mb-2">
                        <Link href="/" className="hover:underline text-blue-600">Startseite</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-400">Reiseroute</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Unsere Reiseroute</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Der Weg unserer Reise quer durch Asien. Zoome und ziehe die Karte, um einzelne Routenabschnitte und Fotos zu erkunden.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Interactive Map Viewport */}
                    <div className="lg:col-span-3 h-[600px]">
                        <MapWrapper tracks={tracks} photos={photos} />
                    </div>

                    {/* Right Timeline Sidebar */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Reisestationen</h2>
                            <ol className="relative border-l border-gray-200 pl-4 space-y-6 text-sm">
                                <li className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                                    <span className="text-xs text-gray-400 font-semibold block">Station 1</span>
                                    <Link href="/bilder/russland" className="font-semibold text-gray-800 hover:text-blue-600 block">Russland</Link>
                                    <span className="text-xs text-gray-500">August 2008</span>
                                </li>
                                <li className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                                    <span className="text-xs text-gray-400 font-semibold block">Station 2</span>
                                    <Link href="/bilder/mongolei" className="font-semibold text-gray-800 hover:text-blue-600 block">Mongolei</Link>
                                    <span className="text-xs text-gray-500">September 2008</span>
                                </li>
                                <li className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                                    <span className="text-xs text-gray-400 font-semibold block">Station 3</span>
                                    <Link href="/bilder/china" className="font-semibold text-gray-800 hover:text-blue-600 block">China</Link>
                                    <span className="text-xs text-gray-500">September 2008</span>
                                </li>
                                <li className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                                    <span className="text-xs text-gray-400 font-semibold block">Station 4</span>
                                    <Link href="/bilder/tibet" className="font-semibold text-gray-800 hover:text-blue-600 block">Tibet</Link>
                                    <span className="text-xs text-gray-500">September 2008</span>
                                </li>
                                <li className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                                    <span className="text-xs text-gray-400 font-semibold block">Station 5</span>
                                    <Link href="/bilder/nepal" className="font-semibold text-gray-800 hover:text-blue-600 block">Nepal</Link>
                                    <span className="text-xs text-gray-500">Oktober 2008</span>
                                </li>
                                <li className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                                    <span className="text-xs text-gray-400 font-semibold block">Station 6</span>
                                    <Link href="/bilder/indien" className="font-semibold text-gray-800 hover:text-blue-600 block">Indien</Link>
                                    <span className="text-xs text-gray-500">Oktober 2008</span>
                                </li>
                            </ol>
                        </div>
                        
                        <div className="mt-8 border-t border-gray-100 pt-4 text-xs text-gray-400 space-y-1">
                            <p>GPS Datenpunkte: {tracks.length * 15}</p>
                            <p>Geotagged Fotos: {photos.length}</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    } catch (error) {
        console.error(error);
        return (
            <div className="max-w-6xl mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl font-bold text-red-600">Verbindung fehlgeschlagen</h1>
                <p className="mt-2 text-gray-600">
                    Die Reiseroute konnte nicht geladen werden. Bitte vergewissere dich, dass der API-Server auf Port 3000 läuft.
                </p>
                <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
                    ← Zurück zur Startseite
                </Link>
            </div>
        );
    }
}
