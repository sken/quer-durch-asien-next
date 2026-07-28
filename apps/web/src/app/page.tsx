'use client'

import ColorPicker from '@sken/color-picker/ColorPicker';
import {useState, useEffect} from "react";
import Link from 'next/link';


export default function Home() {

    const [color, setColor] = useState('#ffffff');
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    // Function to convert hex to RGB
    const hexToRgb = (hex: string) => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    };

    useEffect(() => {
        const fetchImages = async () => {
            const { r, g, b } = hexToRgb(color);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.quer-durch-asien.de'}/images?r=${r}&g=${g}&b=${b}&page=${page}`);
                const data = await response.json();
                setImages(data.images || []);
                setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
            } catch (err) {
                console.error(err);
                setImages([]);
            }
        };

        fetchImages();
    }, [color, page]);


    return (
        <div
            className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">

            <div className="w-[900px] h-[196px] bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center rounded-lg shadow-md" style={{ backgroundColor: '#' + color.replace('#', ''), backgroundImage: 'url(/background_colorselection.png)' }}>
                <div className="mt-5 text-center bg-black/40 text-white px-4 py-2 rounded backdrop-blur-sm">
                    <p className="font-mono font-bold mb-2">Ausgewählte Farbe: {color}</p>
                    <ColorPicker onColorSelect={setColor}></ColorPicker>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
                <Link href="/blog" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">📖 Reisetagebuch</Link>
                <Link href="/album" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">📸 Reisealbum</Link>
                <Link href="/unsere-reise" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">🗺️ Reiseroute</Link>
                <Link href="/packliste" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">🎒 Packliste</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full max-w-6xl">
                {images.map((img: { id: number; title: string; folder: string; file: string; country?: string; day?: string }) => (
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
                            <p className="capitalize">{img.country}</p>
                        </div>
                    </div>
                ))}
            </div>

            {pagination.pages > 1 && (
                <div className="flex items-center gap-4 mt-8">
                    <button 
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page <= 1}
                        className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
                    <button 
                        onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                        disabled={page >= pagination.pages}
                        className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
