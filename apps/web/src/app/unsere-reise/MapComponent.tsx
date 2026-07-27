'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker image path resolutions in Next.js
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    iconUrl: (markerIcon as any).src || markerIcon,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shadowUrl: (markerShadow as any).src || markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

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

interface MapComponentProps {
    tracks: TrackPoint[];
    photos: PhotoPoint[];
}

export default function MapComponent({ tracks, photos }: MapComponentProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Determine starting center coordinate
        // Defaulting to central Asia / China if no tracks
        const centerLat = tracks.length > 0 ? tracks[Math.floor(tracks.length / 2)].lat : 35.0;
        const centerLng = tracks.length > 0 ? tracks[Math.floor(tracks.length / 2)].lng : 90.0;

        // Initialize Leaflet Map
        const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 4);
        mapRef.current = map;

        // Add free OpenStreetMap tile layers
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Draw polyline connecting route coordinates
        if (tracks.length > 0) {
            const pathCoordinates = tracks.map(t => [t.lat, t.lng] as [number, number]);
            
            // Draw route shadow
            L.polyline(pathCoordinates, {
                color: '#1e3a8a',
                weight: 6,
                opacity: 0.3,
            }).addTo(map);

            // Draw primary route
            L.polyline(pathCoordinates, {
                color: '#2563eb',
                weight: 3,
                opacity: 0.85,
            }).addTo(map);

            // Fit map bounds to encompass route path
            const bounds = L.latLngBounds(pathCoordinates);
            map.fitBounds(bounds, { padding: [30, 30] });
        }

        // Draw geotagged image markers
        photos.forEach(photo => {
            const marker = L.marker([photo.lat, photo.lng]).addTo(map);
            
            const popupContent = `
                <div style="font-family: system-ui, -apple-system, sans-serif; text-align: center; width: 140px;">
                    <p style="font-weight: bold; font-size: 13px; margin: 0 0 6px 0; color: #111827; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                        ${photo.title}
                    </p>
                    <a href="/bild/${photo.title}" style="display: block; margin-bottom: 6px;">
                        <img 
                            src="https://quer-durch-asien.de/assets/images/final/${photo.folder}/thumb2/${photo.file}" 
                            alt="${photo.title}" 
                            style="width: 100%; max-height: 90px; object-cover; border-radius: 4px; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"
                        />
                    </a>
                    <a href="/bild/${photo.title}" style="color: #2563eb; text-decoration: none; font-size: 11px; font-weight: 600; display: inline-block;">
                        Details ansehen →
                    </a>
                </div>
            `;

            marker.bindPopup(popupContent);
        });

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [tracks, photos]);

    return (
        <div className="w-full h-full relative rounded-xl overflow-hidden border border-gray-200 shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full min-h-[600px] z-10" />
        </div>
    );
}
