'use client';

import ColorPicker from '@sken/color-picker/ColorPicker';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AlbumFarbenPage() {
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
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.quer-durch-asien.de'}/images?r=${r}&g=${g}&b=${b}&page=${page}&limit=18`);
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
        <div className="space-y-8">
            {/* Color Selector Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-150 flex flex-col items-center">
                <div 
                    className="w-full max-w-xl h-24 flex flex-col justify-center items-center rounded-lg shadow-inner mb-4 transition-all duration-300 border border-black/10" 
                    style={{ backgroundColor: color }}
                >
                    <div className="text-center bg-black/60 text-white px-4 py-1.5 rounded backdrop-blur-sm shadow-md">
                        <p className="font-mono text-xs font-bold">Ausgewählte Farbe: {color}</p>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <ColorPicker onColorSelect={setColor} />
                </div>
            </div>

            {/* Info Bar */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm text-gray-500">
                <div>
                    Ähnlichste Bilder für: <span className="font-mono font-bold text-gray-900">{color}</span>
                </div>
                <div>
                    Gefunden: <span className="font-semibold text-gray-900">{pagination.total} Bilder</span>
                </div>
            </div>

            {/* Photos Grid */}
            {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
                                <p className="text-gray-400 capitalize">{img.country}, {img.day}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500 italic">Keine Bilder für diese Farbe gefunden.</p>
                </div>
            )}

            {/* Pagination Nav */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                    <div>
                        <p className="text-sm text-gray-700">
                            Seite <span className="font-medium">{page}</span> von{' '}
                            <span className="font-medium">{pagination.pages}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page <= 1}
                            className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-opacity"
                        >
                            ‹ Zurück
                        </button>
                        <button 
                            onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                            disabled={page >= pagination.pages}
                            className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-opacity"
                        >
                            Weiter ›
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
