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

interface FetchResponse {
    images: ImageItem[];
    pagination: PaginationData;
}

async function getCountryImages(country: string, page: number): Promise<FetchResponse> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quer-durch-asien-api.vercel.app'}/images?country=${country}&limit=24&page=${page}`, {
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new Error('Failed to fetch country images');
    }
    return res.json();
}

export default async function CountryAlbumPage(props: {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const country = params.country;
    const currentPage = Number(searchParams.page || '1');

    try {
        const { images, pagination } = await getCountryImages(country, currentPage);

        const countryNameFormatted = country.charAt(0).toUpperCase() + country.slice(1);

        return (
            <div className="max-w-6xl mx-auto px-6 py-12 font-sans">
                <header className="mb-12 border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="text-sm text-gray-500 mb-2">
                            <Link href="/" className="hover:underline text-blue-600">Startseite</Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-400">Fotoalben</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight capitalize">
                            Album: {countryNameFormatted}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Aufnahmen und Impressionen unserer Durchquerung von {countryNameFormatted}
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-sm text-gray-500">
                        Insgesamt: <span className="font-semibold text-gray-900">{pagination.total} Bilder</span>
                    </div>
                </header>

                {images.length > 0 ? (
                    <main className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
                                    <p className="text-gray-400">{img.day}</p>
                                </div>
                            </div>
                        ))}
                    </main>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-500 italic">Keine Bilder für dieses Land gefunden.</p>
                    </div>
                )}

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                    <nav className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            {currentPage > 1 && (
                                <Link
                                    href={`/bilder/${country}?page=${currentPage - 1}`}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Zurück
                                </Link>
                            )}
                            {currentPage < pagination.pages && (
                                <Link
                                    href={`/bilder/${country}?page=${currentPage + 1}`}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Weiter
                                </Link>
                            )}
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Zeige Seite <span className="font-medium">{currentPage}</span> von{' '}
                                    <span className="font-medium">{pagination.pages}</span> ({pagination.total} Bilder)
                                </p>
                            </div>
                            <div>
                                <span className="relative z-0 inline-flex shadow-sm rounded-md -space-x-px">
                                    {currentPage > 1 && (
                                        <Link
                                            href={`/bilder/${country}?page=${currentPage - 1}`}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            ‹ Zurück
                                        </Link>
                                    )}
                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => {
                                        const isCurrent = p === currentPage;
                                        return (
                                            <Link
                                                key={p}
                                                href={`/bilder/${country}?page=${p}`}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    isCurrent
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {p}
                                            </Link>
                                        );
                                    })}
                                    {currentPage < pagination.pages && (
                                        <Link
                                            href={`/bilder/${country}?page=${currentPage + 1}`}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            Weiter ›
                                        </Link>
                                    )}
                                </span>
                            </div>
                        </div>
                    </nav>
                )}
            </div>
        );
    } catch (error) {
        console.error(error);
        return (
            <div className="max-w-6xl mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl font-bold text-red-600">Verbindung fehlgeschlagen</h1>
                <p className="mt-2 text-gray-600">
                    Das Album konnte nicht geladen werden. Bitte vergewissere dich, dass der API-Server auf Port 3000 läuft.
                </p>
                <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
                    ← Zurück zur Startseite
                </Link>
            </div>
        );
    }
}
