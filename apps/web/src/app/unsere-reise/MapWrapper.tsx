'use client';

import dynamic from 'next/dynamic';

interface TrackPoint {
    id: string;
    lat: number;
    lng: number;
    alt: number;
    utc: number;
    country: string;
}

interface PhotoPoint {
    id: number;
    title: string;
    file: string;
    folder: string;
    lat: number;
    lng: number;
    alt: number;
}

interface MapWrapperProps {
    tracks: TrackPoint[];
    photos: PhotoPoint[];
}

const DynamicMap = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full min-h-[600px] flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200">
            <div className="text-center text-gray-500 font-semibold">
                <p>Karte wird geladen...</p>
                <div className="mt-2 w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        </div>
    ),
});

export default function MapWrapper({ tracks, photos }: MapWrapperProps) {
    return <DynamicMap tracks={tracks} photos={photos} />;
}
