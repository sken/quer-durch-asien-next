import Link from 'next/link';

interface ImageItem {
    id: number;
    title: string;
    desc: string;
    date: string | null;
    day: string | null;
    country: string;
    file: string;
    folder: string;
}

interface PaginationData {
    total: number;
    limit: number;
    page: number;
    pages: number;
}

interface ImagesResponse {
    images: ImageItem[];
    pagination: PaginationData;
}

interface TravelDay {
    id: string;
    date: string;
    title: string | null;
    description: string | null;
    preview: string | null;
}

async function getImages(country?: string, date?: string, page: number = 1): Promise<ImagesResponse> {
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'https://next.quer-durch-asien.de'}/images?limit=12&page=${page}`;
    if (country) url += `&country=${country}`;
    if (date) url += `&date=${date}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch images');
    }
    return res.json();
}

async function getTravelDays(): Promise<TravelDay[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://next.quer-durch-asien.de'}/images/days`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch travel days');
    }
    return res.json();
}

export default async function AlbumLandUndTagPage(props: {
    searchParams: Promise<{ country?: string; date?: string; page?: string }>;
}) {
    const searchParams = await props.searchParams;
    const activeCountry = searchParams.country || '';
    const activeDate = searchParams.date || '';
    const page = Number(searchParams.page || '1');

    try {
        const [{ images, pagination }, days] = await Promise.all([
            getImages(activeCountry, activeDate, page),
            getTravelDays()
        ]);

        const countries = [
            { code: 'russland', name: 'Russland' },
            { code: 'mongolei', name: 'Mongolei' },
            { code: 'china', name: 'China' },
            { code: 'tibet', name: 'Tibet' },
            { code: 'nepal', name: 'Nepal' },
            { code: 'indien', name: 'Indien' }
        ];

        return (
            <div className="space-y-8">
                {/* Country Selector Grid */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-150">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Filtern nach Land:</h3>
                    <div className="flex flex-wrap gap-2.5">
                        <Link
                            href="/album"
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                !activeCountry
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Alle Länder
                        </Link>
                        {countries.map((c) => {
                            const isSelected = activeCountry.toLowerCase() === c.code;
                            return (
                                <Link
                                    key={c.code}
                                    href={`/album?country=${c.code}`}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                        isSelected
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {c.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Day/Date Slider/Timeline List */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-150">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Reisetag auswählen:</h3>
                    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
                        <Link
                            href={`/album${activeCountry ? `?country=${activeCountry}` : ''}`}
                            className={`flex-none flex flex-col items-center justify-center w-28 h-28 rounded-lg border bg-white p-3 text-center transition-all shadow-sm ${
                                !activeDate
                                    ? 'ring-2 ring-blue-500 border-transparent font-bold text-blue-600'
                                    : 'border-gray-200 hover:border-gray-400 text-gray-700'
                            }`}
                        >
                            <span className="text-xl mb-1">📅</span>
                            <span className="text-xs font-semibold">Alle Tage</span>
                        </Link>
                        {days.map((day) => {
                            const isSelected = activeDate === day.date;
                            
                            // Parse day description nicely
                            const formattedDateStr = new Date(day.date).toLocaleDateString('de-DE', {
                                month: 'short',
                                day: 'numeric'
                            });

                            return (
                                <Link
                                    key={day.id}
                                    href={`/album?date=${day.date}${activeCountry ? `&country=${activeCountry}` : ''}`}
                                    className={`flex-none flex flex-col justify-between w-28 h-28 rounded-lg border bg-cover bg-center overflow-hidden transition-all shadow-sm group relative ${
                                        isSelected
                                            ? 'ring-2 ring-blue-500 border-transparent font-bold scale-[1.02]'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                    style={day.preview ? { backgroundImage: `url(${day.preview})` } : undefined}
                                >
                                    {/* Overlay Gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-0 group-hover:via-black/55 transition-all ${isSelected ? 'from-blue-900/90' : ''}`} />

                                    {/* Top Date Stamp */}
                                    <div className="z-10 p-2 text-right">
                                        <span className="text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white px-1.5 py-0.5 rounded">
                                            {formattedDateStr}
                                        </span>
                                    </div>

                                    {/* Bottom Title Label */}
                                    <div className="z-10 p-2 text-left">
                                        <p className="text-[10px] text-gray-300 font-medium truncate uppercase">{day.date}</p>
                                        <p className="text-[11px] text-white font-bold truncate leading-tight">
                                            {day.title || 'Reisetag'}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Info Bar */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm text-gray-500">
                    <div>
                        Ausgewählt: <span className="font-semibold text-gray-900 capitalize">{activeCountry || 'Alle Länder'}</span>
                        {activeDate && (
                            <>
                                <span className="mx-2">•</span>
                                Reisetag: <span className="font-semibold text-gray-900">{activeDate}</span>
                            </>
                        )}
                    </div>
                    <div>
                        Gefunden: <span className="font-semibold text-gray-900">{pagination.total} Bilder</span>
                    </div>
                </div>

                {/* Photos Grid */}
                {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {images.map((img) => (
                            <div key={img.id} className="group bg-white rounded border border-gray-100 p-2 shadow-sm hover:shadow transition-shadow">
                                <div className="relative aspect-square overflow-hidden bg-gray-100 rounded">
                                    <Link href={`/bild/${img.title}`}>
                                        <img 
                                            src={`https://quer-durch-asien.de/assets/images/final/${img.folder}/thumb2/${img.file}`} 
                                            alt={img.title} 
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </Link>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 truncate">
                                    <p className="font-semibold text-gray-900 truncate">{img.title}</p>
                                    <p className="text-gray-400 capitalize">{img.country}, {img.day}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-500 italic">Keine Bilder für diese Filterkombination gefunden.</p>
                    </div>
                )}

                {/* Pagination Nav */}
                {pagination.pages > 1 && (
                    <nav className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                        <div>
                            <p className="text-sm text-gray-700">
                                Seite <span className="font-medium">{page}</span> von{' '}
                                <span className="font-medium">{pagination.pages}</span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {page > 1 && (
                                <Link
                                    href={`/album?page=${page - 1}${activeCountry ? `&country=${activeCountry}` : ''}${activeDate ? `&date=${activeDate}` : ''}`}
                                    className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50"
                                >
                                    ‹ Zurück
                                </Link>
                            )}
                            {page < pagination.pages && (
                                <Link
                                    href={`/album?page=${page + 1}${activeCountry ? `&country=${activeCountry}` : ''}${activeDate ? `&date=${activeDate}` : ''}`}
                                    className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50"
                                >
                                    Weiter ›
                                </Link>
                            )}
                        </div>
                    </nav>
                )}
            </div>
        );
    } catch (error) {
        console.error(error);
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-red-600">Verbindungsfehler</h2>
                <p className="text-gray-600 mt-2">Das Album konnte nicht geladen werden. Bitte vergewissere dich, dass der API-Server auf Port 3000 läuft.</p>
            </div>
        );
    }
}
