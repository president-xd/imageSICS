"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const StatsPanel = ({ image }: { image: any }) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!image) return;
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await axios.post('/api/forensic/analysis/stats', {
                    image_path: image.fullPath
                });
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [image]);

    return (
        <div className="flex flex-col h-full bg-[#323232]">
            <div className="p-2 bg-[#252525] border-b border-gray-600 text-xs font-bold text-gray-300">
                Pixel Statistics
            </div>

            <div className="flex-1 overflow-auto bg-[#222] p-4 text-xs">
                {loading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}

                {!loading && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(stats).map(([channel, data]: [string, any]) => (
                            <div key={channel} className="bg-[#333] p-3 rounded border border-gray-700">
                                <h3 className="text-accent font-bold mb-2 border-b border-gray-600 pb-1">{channel} Channel</h3>
                                <div className="grid grid-cols-2 gap-y-1">
                                    <span className="text-gray-400">Min:</span> <span className="text-right">{data.min}</span>
                                    <span className="text-gray-400">Max:</span> <span className="text-right">{data.max}</span>
                                    <span className="text-gray-400">Mean:</span> <span className="text-right">{data.mean.toFixed(2)}</span>
                                    <span className="text-gray-400">StdDev:</span> <span className="text-right">{data.std_dev.toFixed(2)}</span>
                                    <span className="text-gray-400">Entropy:</span> <span className="text-right">{data.entropy.toFixed(3)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
