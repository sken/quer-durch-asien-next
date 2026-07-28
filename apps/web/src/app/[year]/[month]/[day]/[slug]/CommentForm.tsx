'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId }: { postId: string }) {
    const router = useRouter();
    const [author, setAuthor] = useState('');
    const [email, setEmail] = useState('');
    const [url, setUrl] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        if (!author.trim() || !email.trim() || !content.trim()) {
            setError('Name, E-Mail-Adresse und Kommentar sind Pflichtfelder.');
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://next.quer-durch-asien.de'}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    author,
                    email,
                    url,
                    content,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Kommentar konnte nicht gesendet werden.');
            }

            // Clear form
            setAuthor('');
            setEmail('');
            setUrl('');
            setContent('');
            setSuccess(true);

            // Refresh the server component to load the newly added comment
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Verbindung zum API-Server fehlgeschlagen.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
                    Kommentar erfolgreich gesendet! Er wird sofort angezeigt.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                    </label>
                    <input
                        type="text"
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                        disabled={submitting}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-Mail * (wird nicht veröffentlicht)
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={submitting}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                    Website (optional)
                </label>
                <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={submitting}
                    placeholder="https://"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Kommentar *
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    disabled={submitting}
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded shadow transition-colors disabled:opacity-50"
            >
                {submitting ? 'Sende...' : 'Abschicken'}
            </button>
        </form>
    );
}
