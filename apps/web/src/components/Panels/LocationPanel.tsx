"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, MapPin } from 'lucide-react';

export const LocationPanel = ({ image }: { image: any }) => {
    const [coords, setCoords] = useState<{ lat: number, lon: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!image) return;
        const fetchGps = async () => {
            setLoading(true);
            setError(null);
            setCoords(null);
            try {
                const res = await axios.get(`/api/forensic/metadata/gps?path=${encodeURIComponent(image.fullPath)}`);
                if (res.data.error) {
                    setError(res.data.error);
                } else {
                    setCoords(res.data);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to fetch GPS data");
            } finally {
                setLoading(false);
            }
        };
        fetchGps();
    }, [image]);

    if (loading) return <div className="p-4"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                <MapPin className="w-8 h-8 opacity-20" />
                <span>{error}</span>
            </div>
        );
    }

    if (!coords) return null;

    // Use OpenStreetMap embed for free maps
    // Or Google Maps Embed API (requires key usually, but simple link works)
    // We can use an iframe to OSM.

    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.01},${coords.lat - 0.01},${coords.lon + 0.01},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`;

    return (
        <div className="flex flex-col h-full bg-[#323232]">
            <div className="p-2 bg-[#252525] border-b border-gray-600 flex justify-between items-center text-xs">
                <span className="font-bold text-gray-300">
                    {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
                </span>
                <a href={googleUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                    Open in Google Maps
                </a>
            </div>

            <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={osmUrl}
                className="flex-1 bg-gray-200"
            ></iframe>
        </div>
    );
};
