"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const ElaPanel = ({ image }: { image: any }) => {
    const [quality, setQuality] = useState(75);
    const [scale, setScale] = useState(50);
    const [contrast, setContrast] = useState(20);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const processEla = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const res = await axios.post('/api/forensic/ela', {
                image_path: image.fullPath, // Pass the internal path
                params: {
                    quality,
                    scale,
                    contrast
                }
            });
            setResultUrl(res.data.result_url);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-process on load if image exists? Or wait for user.
    // Let's process when params change with debounce? Or typical Apply button.
    // Sherloq is often interactive.

    return (
        <div className="flex flex-col h-full bg-[#323232]">
            {/* Toolbar */}
            <div className="flex items-center p-2 bg-[#252525] border-b border-gray-600 gap-4 text-xs">
                <div className="flex flex-col">
                    <label>Quality: {quality}</label>
                    <input type="range" min="1" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} />
                </div>
                <div className="flex flex-col">
                    <label>Scale: {scale}</label>
                    <input type="range" min="1" max="100" value={scale} onChange={e => setScale(Number(e.target.value))} />
                </div>
                <div className="flex flex-col">
                    <label>Contrast: {contrast}</label>
                    <input type="range" min="0" max="100" value={contrast} onChange={e => setContrast(Number(e.target.value))} />
                </div>
                <button
                    onClick={processEla}
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded font-bold"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Process"}
                </button>
            </div>

            {/* Viewer */}
            <div className="flex-1 flex items-center justify-center overflow-auto bg-[#222] p-4 relative">
                {!image && <span className="text-gray-500">Select an image first</span>}
                {image && !resultUrl && !loading && (
                    <span className="text-gray-500">Click Process to run ELA</span>
                )}
                {resultUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={resultUrl} alt="ELA Result" className="max-w-full max-h-full object-contain" />
                )}
            </div>
        </div>
    );
};
