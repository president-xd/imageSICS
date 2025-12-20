"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const HistogramPanel = ({ image }: { image: any }) => {
    const [hists, setHists] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!image) return;
        const fetchHist = async () => {
            setLoading(true);
            try {
                // Endpoint already exists /api/forensic/histogram
                const res = await axios.post('/api/forensic/histogram', {
                    image_path: image.fullPath
                });
                setHists(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHist();
    }, [image]);

    // Simple SVG or Canvas histogram rendering
    // hists = { b: [...], g: [...], r: [...], y: [...] }

    return (
        <div className="flex flex-col h-full bg-[#323232] p-4">
            <h3 className="text-gray-300 font-bold border-b border-gray-600 pb-2 mb-2">Channel Histogram</h3>

            {loading && <Loader2 className="animate-spin text-accent" />}

            {hists && (
                <div className="flex flex-col gap-4 overflow-auto">
                    {Object.keys(hists).map(key => (
                        <div key={key} className="h-32 bg-black/20 border border-gray-700 relative">
                            {/* Render bars */}
                            <div className="absolute inset-0 flex items-end">
                                {hists[key].map((val: number, i: number) => {
                                    const max = Math.max(...hists[key]);
                                    const height = (val / max) * 100;
                                    let color = 'white';
                                    if (key === 'r') color = '#ef4444';
                                    if (key === 'g') color = '#22c55e';
                                    if (key === 'b') color = '#3b82f6';
                                    if (key === 'y') color = '#eab308'; // Luminance

                                    return (
                                        <div
                                            key={i}
                                            style={{ height: `${height}%`, width: '0.39%', backgroundColor: color }}
                                        />
                                    );
                                })}
                            </div>
                            <span className="absolute top-1 left-1 text-[10px] text-gray-500 uppercase font-bold">{key}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
