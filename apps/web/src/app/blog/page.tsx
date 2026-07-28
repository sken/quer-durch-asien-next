import Link from 'next/link';

interface Post {
    ID: string;
    post_title: string;
    post_content: string;
    post_excerpt: string;
    post_date: string;
    post_name: string;
    comment_count: string;
}

interface PaginationData {
    total: number;
    limit: number;
    page: number;
    pages: number;
}

interface FetchResponse {
    posts: Post[];
    pagination: PaginationData;
}

// Function to format Date objects to strings matching legacy route patterns
function getLegacyLink(postDateStr: string, slug: string) {
    const date = new Date(postDateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `/${year}/${month}/${day}/${slug}`;
}

async function getPosts(page: number): Promise<FetchResponse> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.quer-durch-asien.de'}/posts?limit=8&page=${page}`, {
        cache: 'no-store', // Ensures fresh data
    });
    if (!res.ok) {
        throw new Error('Failed to fetch posts');
    }
    return res.json();
}

export default async function BlogListPage(props: {
    searchParams: Promise<{ page?: string }>;
}) {
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams.page || '1');

    try {
        const { posts, pagination } = await getPosts(currentPage);

        return (
            <div className="max-w-4xl mx-auto px-6 py-12 font-sans">
                <header className="mb-12 border-b border-gray-200 pb-6">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Reisetagebuch</h1>
                    <p className="mt-2 text-lg text-gray-600">Geschichten von unserer Reise quer durch Asien</p>
                    <div className="mt-4 flex gap-4">
                        <Link href="/" className="text-blue-600 hover:underline">← Zurück zur Startseite</Link>
                    </div>
                </header>

                <main className="space-y-12">
                    {posts.map((post) => {
                        const postDate = new Date(post.post_date);
                        const formattedDate = postDate.toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });
                        const readMoreLink = getLegacyLink(post.post_date, post.post_name);

                        // Fallback excerpt if empty
                        const excerpt = post.post_excerpt || 
                            (post.post_content.replace(/<[^>]*>/g, '').slice(0, 240) + '...');

                        return (
                            <article key={post.ID} className="group">
                                <div className="text-sm text-gray-500 mb-2">
                                    <time dateTime={post.post_date}>{formattedDate}</time>
                                    <span className="mx-2">•</span>
                                    <span>{post.comment_count} {Number(post.comment_count) === 1 ? 'Kommentar' : 'Kommentare'}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                                    <Link href={readMoreLink}>{post.post_title}</Link>
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: excerpt }} />
                                <Link 
                                    href={readMoreLink} 
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                    Weiterlesen <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                            </article>
                        );
                    })}
                </main>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                    <nav className="mt-16 flex items-center justify-between border-t border-gray-200 pt-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            {currentPage > 1 && (
                                <Link
                                    href={`/blog?page=${currentPage - 1}`}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Zurück
                                </Link>
                            )}
                            {currentPage < pagination.pages && (
                                <Link
                                    href={`/blog?page=${currentPage + 1}`}
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
                                    <span className="font-medium">{pagination.pages}</span> ({pagination.total} Einträge)
                                </p>
                            </div>
                            <div>
                                <span className="relative z-0 inline-flex shadow-sm rounded-md -space-x-px">
                                    {currentPage > 1 && (
                                        <Link
                                            href={`/blog?page=${currentPage - 1}`}
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
                                                href={`/blog?page=${p}`}
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
                                            href={`/blog?page=${currentPage + 1}`}
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
            <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl font-bold text-red-600">Verbindung fehlgeschlagen</h1>
                <p className="mt-2 text-gray-600">
                    Das Reisetagebuch konnte nicht geladen werden. Bitte vergewissere dich, dass der API-Server auf Port 3000 läuft.
                </p>
                <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
                    ← Zurück zur Startseite
                </Link>
            </div>
        );
    }
}
