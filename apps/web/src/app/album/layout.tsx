'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AlbumLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Land & Tag', href: '/album', activePattern: /^\/album$/ },
        { name: 'Stichworten', href: '/album/stichworte', activePattern: /^\/album\/stichworte/ },
        { name: 'Farben', href: '/album/farben', activePattern: /^\/album\/farben/ }
    ];

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 font-sans bg-white min-h-screen">
            <header className="mb-8 border-b border-gray-200 pb-6">
                <div className="text-sm text-gray-500 mb-2">
                    <Link href="/" className="hover:underline text-blue-600">Startseite</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-400">Reisealbum</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Reisealbum</h1>
                <p className="mt-2 text-gray-600">
                    Erkunde die Impressionen unserer Reise quer durch Asien.
                </p>

                {/* Subnavigation Tabs */}
                <nav className="mt-8">
                    <ul className="flex items-center gap-2 border-b border-gray-200 -mb-[1px]">
                        <li className="text-gray-400 text-sm font-semibold pr-4">Suche nach:</li>
                        {tabs.map((tab) => {
                            const isActive = tab.activePattern.test(pathname);
                            return (
                                <li key={tab.href}>
                                    <Link
                                        href={tab.href}
                                        className={`inline-block px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                                            isActive
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </header>

            <main>{children}</main>
        </div>
    );
}
