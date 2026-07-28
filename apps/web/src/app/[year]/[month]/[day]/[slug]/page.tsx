import Link from 'next/link';
import { notFound } from 'next/navigation';
import CommentForm from './CommentForm';

interface Post {
    ID: string;
    post_title: string;
    post_content: string;
    post_date: string;
    comment_count: string;
}

interface Comment {
    comment_ID: string;
    comment_author: string;
    comment_author_email: string;
    comment_author_url: string;
    comment_date: string;
    comment_content: string;
}

async function getPostBySlug(slug: string): Promise<Post | null> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.quer-durch-asien.de'}/posts/by-slug/${slug}`, {
        cache: 'no-store',
    });
    if (res.status === 404) {
        return null;
    }
    if (!res.ok) {
        throw new Error('Failed to fetch post');
    }
    return res.json();
}

async function getPostComments(postId: string): Promise<Comment[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.quer-durch-asien.de'}/posts/${postId}/comments`, {
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new Error('Failed to fetch comments');
    }
    return res.json();
}

export default async function BlogPostPage(props: {
    params: Promise<{ year: string; month: string; day: string; slug: string }>;
}) {
    const params = await props.params;
    const { slug } = params;

    try {
        const post = await getPostBySlug(slug);

        if (!post) {
            notFound();
        }

        const comments = await getPostComments(post.ID);

        const postDate = new Date(post.post_date);
        const formattedDate = postDate.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <div className="max-w-3xl mx-auto px-6 py-12 font-sans">
                {/* Navigation Back */}
                <div className="mb-8">
                    <Link href="/blog" className="text-blue-600 hover:underline">
                        ← Zurück zum Reisetagebuch
                    </Link>
                </div>

                <article className="prose lg:prose-xl max-w-none">
                    <header className="mb-8 not-prose">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                            {post.post_title}
                        </h1>
                        <div className="text-gray-500 text-sm">
                            Veröffentlicht am <time dateTime={post.post_date}>{formattedDate}</time>
                        </div>
                    </header>

                    {/* Blog Content */}
                    <div 
                        className="text-gray-800 leading-relaxed space-y-6 blog-content" 
                        dangerouslySetInnerHTML={{ __html: post.post_content }} 
                    />
                </article>

                <hr className="my-12 border-gray-200" />

                {/* Comments Section */}
                <section className="mt-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        Kommentare ({comments.length})
                    </h3>

                    {comments.length > 0 ? (
                        <div className="space-y-6 mb-12">
                            {comments.map((comment) => {
                                const commentDate = new Date(comment.comment_date);
                                const formattedCommentDate = commentDate.toLocaleDateString('de-DE', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });

                                return (
                                    <div key={comment.comment_ID} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-semibold text-gray-900">
                                                {comment.comment_author_url ? (
                                                    <a 
                                                        href={comment.comment_author_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="hover:underline text-blue-600"
                                                    >
                                                        {comment.comment_author}
                                                    </a>
                                                ) : (
                                                    comment.comment_author
                                                )}
                                            </span>
                                            <span className="text-xs text-gray-500">{formattedCommentDate}</span>
                                        </div>
                                        <div className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                                            {comment.comment_content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic mb-8">Noch keine Kommentare. Schreibe den ersten!</p>
                    )}

                    {/* Add Comment Form */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Kommentar schreiben</h4>
                        <CommentForm postId={post.ID} />
                    </div>
                </section>
            </div>
        );
    } catch (error) {
        console.error(error);
        return (
            <div className="max-w-3xl mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl font-bold text-red-600">Verbindung fehlgeschlagen</h1>
                <p className="mt-2 text-gray-600">
                    Der Beitrag konnte nicht geladen werden. Bitte vergewissere dich, dass der API-Server läuft.
                </p>
                <Link href="/blog" className="mt-6 inline-block text-blue-600 hover:underline">
                    ← Zurück zum Reisetagebuch
                </Link>
            </div>
        );
    }
}
