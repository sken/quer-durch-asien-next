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

interface KeywordTag {
    id: string;
    name: string;
    slug: string;
    count: number;
}

async function getImages(tag?: string, page: number = 1): Promise<ImagesResponse> {
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'https://next.quer-durch-asien.de'}/images?limit=12&page=${page}`;
    if (tag) url += `&tag=${tag}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch images');
    }
    return res.json();
}

async function getTags(): Promise<KeywordTag[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://next.quer-durch-asien.de'}/images/tags`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch tags');
    }
    return res.json();
}

export default async function AlbumStichwortePage(props: {
    searchParams: Promise<{ tag?: string; page?: string }>;
}) {
    const searchParams = await props.searchParams;
    const activeTag = searchParams.tag || '';
    const page = Number(searchParams.page || '1');

    try {
        const [{ images, pagination }, tags] = await Promise.all([
            getImages(activeTag, page),
            getTags()
        ]);

        return (
            <div className="space-y-8">
                {/* Tag Cloud Selector */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-150">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Filtern nach Stichwort:</h3>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/album/stichworte"
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                !activeTag
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Alle Stichworte
                        </Link>
                        {tags.map((tag) => {
                            const isSelected = activeTag === tag.slug;
                            
                            // Scale font size based on keyword frequency counts (min 12px, max 20px)
                            const countRatio = Math.min(1, tag.count / 30);
                            const fontSize = 12 + Math.floor(countRatio * 6);

                            return (
                                <Link
                                    key={tag.id}
                                    href={`/album/stichworte?tag=${tag.slug}`}
                                    className={`px-3 py-1.5 rounded-full border transition-all ${
                                        isSelected
                                            ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                                            : 'bg-white border-gray-250/60 text-gray-700 hover:bg-gray-100'
                                    }`}
                                    style={{ fontSize: `${fontSize}px` }}
                                >
                                    #{tag.name} <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>({tag.count})</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Info Bar */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm text-gray-500">
                    <div>
                        Ausgewähltes Stichwort:{' '}
                        <span className="font-semibold text-gray-900 capitalize">
                            {activeTag ? `#${activeTag.replace(/-/g, ' ')}` : 'Alle'}
                        </span>
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
                        <p className="text-gray-500 italic">Keine Bilder für dieses Stichwort gefunden.</p>
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
                                    href={`/album/stichworte?page=${page - 1}${activeTag ? `&tag=${activeTag}` : ''}`}
                                    className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50"
                                >
                                    ‹ Zurück
                                </Link>
                            )}
                            {page < pagination.pages && (
                                <Link
                                    href={`/album/stichworte?page=${page + 1}${activeTag ? `&tag=${activeTag}` : ''}`}
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
