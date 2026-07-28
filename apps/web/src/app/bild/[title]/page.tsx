import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ImageDetails {
    image: {
        id: number;
        filename: string;
        title: string | null;
        desc: string | null;
        country: string | null;
        date: string | null;
        width: number | null;
        height: number | null;
        EXIFMake: string | null;
        EXIFModel: string | null;
        EXIFExposureTime: string | null;
        EXIFFNumber: string | null;
        EXIFFocalLength: string | null;
        EXIFISOSpeedRatings: string | null;
        EXIFGPSLatitude: string | null;
        EXIFGPSLongitude: string | null;
        EXIFGPSAltitude: string | null;
    };
    keywords: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    colors: Array<{
        id: string;
        red: number;
        green: number;
        blue: number;
        hex: string;
    }>;
    prev: { title: string; filename: string; country: string } | null;
    next: { title: string; filename: string; country: string } | null;
}

async function getImageDetails(title: string): Promise<ImageDetails | null> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quer-durch-asien-api.vercel.app'}/images/by-title/${title}`, {
        cache: 'no-store',
    });
    if (res.status === 404) {
        return null;
    }
    if (!res.ok) {
        throw new Error('Failed to fetch image details');
    }
    return res.json();
}

export default async function ImageDetailsPage(props: {
    params: Promise<{ title: string }>;
}) {
    const params = await props.params;
    const title = params.title;

    try {
        const details = await getImageDetails(title);

        if (!details) {
            notFound();
        }

        const { image, keywords, colors, prev, next } = details;
        const formattedDate = image.date 
            ? new Date(image.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })
            : null;

        // Image source URL
        const imageSrc = `https://quer-durch-asien.de/assets/images/final/${image.country}/final/${image.filename}`;

        return (
            <div className="max-w-6xl mx-auto px-6 py-12 font-sans bg-gray-50/50 min-h-screen">
                {/* Back Navigation & Breadcrumb */}
                <header className="mb-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        <Link href="/" className="hover:underline text-blue-600">Startseite</Link>
                        <span className="mx-2">/</span>
                        {image.country && (
                            <>
                                <Link href={`/bilder/${image.country}`} className="hover:underline text-blue-600 capitalize">
                                    {image.country}
                                </Link>
                                <span className="mx-2">/</span>
                            </>
                        )}
                        <span className="text-gray-400">{image.title || image.filename}</span>
                    </div>
                    {image.country && (
                        <Link 
                            href={`/bilder/${image.country}`}
                            className="text-xs font-semibold text-gray-700 hover:text-blue-600 bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm transition-colors"
                        >
                            Album anzeigen
                        </Link>
                    )}
                </header>

                {/* Primary Photo Viewer Viewport */}
                <main className="relative bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center min-h-[500px] group">
                    <img 
                        src={imageSrc} 
                        alt={image.title || image.filename}
                        className="max-h-[75vh] object-contain max-w-full z-10"
                    />

                    {/* Navigation Hotspots overlay */}
                    {prev && (
                        <Link 
                            href={`/bild/${prev.title}`}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/75 text-white p-3 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg border border-white/10"
                            aria-label="Vorheriges Bild"
                        >
                            <span className="text-xl font-bold block w-6 h-6 text-center leading-5">‹</span>
                        </Link>
                    )}
                    {next && (
                        <Link 
                            href={`/bild/${next.title}`}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/75 text-white p-3 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg border border-white/10"
                            aria-label="Nächstes Bild"
                        >
                            <span className="text-xl font-bold block w-6 h-6 text-center leading-5">›</span>
                        </Link>
                    )}
                </main>

                {/* Bottom Navigation Buttons (Visible always) */}
                <div className="flex justify-between items-center mt-4 mb-12 px-2">
                    {prev ? (
                        <Link href={`/bild/${prev.title}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                            ← Vorheriges Bild
                        </Link>
                    ) : <span />}
                    {next ? (
                        <Link href={`/bild/${next.title}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                            Nächstes Bild →
                        </Link>
                    ) : <span />}
                </div>

                {/* Details Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Title & Description */}
                    <div className="md:col-span-2 bg-white rounded-xl p-6 border border-gray-150 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{image.title || image.filename}</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {image.desc || 'Keine Beschreibung vorhanden.'}
                        </p>

                        {/* Keyword tags */}
                        {keywords.length > 0 && (
                            <div className="mt-8 border-t border-gray-100 pt-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Stichworte</h3>
                                <div className="flex flex-wrap gap-2">
                                    {keywords.map(kw => (
                                        <Link 
                                            key={kw.id} 
                                            href={`/tag/${kw.slug}`}
                                            className="text-xs bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 px-2.5 py-1 rounded-full border border-gray-200/50 transition-colors"
                                        >
                                            #{kw.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: EXIF technical data, locations, and colors */}
                    <div className="space-y-6">
                        {/* Exif Card */}
                        <div className="bg-white rounded-xl p-6 border border-gray-150 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Kamerainformationen</h3>
                            <dl className="grid grid-cols-2 gap-y-3 text-sm">
                                <dt className="text-gray-500 font-medium">Hersteller</dt>
                                <dd className="text-gray-900 text-right truncate">{image.EXIFMake || 'N/A'}</dd>
                                
                                <dt className="text-gray-500 font-medium">Kamera</dt>
                                <dd className="text-gray-900 text-right truncate">{image.EXIFModel || 'N/A'}</dd>

                                <dt className="text-gray-500 font-medium">Belichtung</dt>
                                <dd className="text-gray-900 text-right">{image.EXIFExposureTime ? `${image.EXIFExposureTime}s` : 'N/A'}</dd>

                                <dt className="text-gray-500 font-medium">Blende</dt>
                                <dd className="text-gray-900 text-right">{image.EXIFFNumber ? `f/${image.EXIFFNumber}` : 'N/A'}</dd>

                                <dt className="text-gray-500 font-medium">ISO</dt>
                                <dd className="text-gray-900 text-right">{image.EXIFISOSpeedRatings || 'N/A'}</dd>

                                <dt className="text-gray-500 font-medium">Brennweite</dt>
                                <dd className="text-gray-900 text-right">{image.EXIFFocalLength ? `${image.EXIFFocalLength}mm` : 'N/A'}</dd>

                                <dt className="text-gray-500 font-medium">Aufnahmedatum</dt>
                                <dd className="text-gray-900 text-right truncate">{formattedDate || 'N/A'}</dd>

                                <dt className="text-gray-500 font-medium">Auflösung</dt>
                                <dd className="text-gray-900 text-right">{image.width && image.height ? `${image.width} × ${image.height}` : 'N/A'}</dd>
                            </dl>
                        </div>

                        {/* Location / GPS Card */}
                        {(image.EXIFGPSLatitude || image.EXIFGPSAltitude) && (
                            <div className="bg-white rounded-xl p-6 border border-gray-150 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Standortdaten</h3>
                                <dl className="grid grid-cols-2 gap-y-3 text-sm">
                                    <dt className="text-gray-500 font-medium">Land</dt>
                                    <dd className="text-gray-900 text-right capitalize">{image.country || 'N/A'}</dd>

                                    <dt className="text-gray-500 font-medium">Breitengrad</dt>
                                    <dd className="text-gray-900 text-right">{image.EXIFGPSLatitude || 'N/A'}</dd>

                                    <dt className="text-gray-500 font-medium">Längengrad</dt>
                                    <dd className="text-gray-900 text-right">{image.EXIFGPSLongitude || 'N/A'}</dd>

                                    <dt className="text-gray-500 font-medium">Höhe über N.N.</dt>
                                    <dd className="text-gray-900 text-right">{image.EXIFGPSAltitude ? `${image.EXIFGPSAltitude}m` : 'N/A'}</dd>
                                </dl>
                            </div>
                        )}

                        {/* Dominant Colors Card */}
                        {colors.length > 0 && (
                            <div className="bg-white rounded-xl p-6 border border-gray-150 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Dominante Farben</h3>
                                <div className="flex items-center gap-3">
                                    {colors.map(color => (
                                        <div 
                                            key={color.id} 
                                            className="w-10 h-10 rounded-full border border-gray-200/50 shadow-inner group relative cursor-pointer"
                                            style={{ backgroundColor: color.hex }}
                                            title={color.hex}
                                        >
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                                                {color.hex}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        );
    } catch (error) {
        console.error(error);
        return (
            <div className="max-w-6xl mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl font-bold text-red-600">Verbindung fehlgeschlagen</h1>
                <p className="mt-2 text-gray-600">
                    Das Bild konnte nicht geladen werden. Bitte vergewissere dich, dass der API-Server auf Port 3000 läuft.
                </p>
                <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
                    ← Zurück zur Startseite
                </Link>
            </div>
        );
    }
}
