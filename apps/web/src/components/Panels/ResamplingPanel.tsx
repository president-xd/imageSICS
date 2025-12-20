"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const ResamplingPanel = ({ image }: { image: any }) => {
    // Basic simplified UI for Resampling
    const [hanning, setHanning] = useState(true);
    const [upsample, setUpsample] = useState(true);
    const [gamma, setGamma] = useState(4.0);

    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const processResampling = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const res = await axios.post('/api/forensic/resampling', {
                image_path: image.fullPath,
                params: {
                    hanning, upsample, gamma
                }
            });
            setResultUrl(res.data.result_url);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#323232]">
            <div className="flex flex-wrap items-center p-2 bg-[#252525] border-b border-gray-600 gap-4 text-xs">
                <div className="p-2 bg-yellow-900/50 text-yellow-200 rounded border border-yellow-700/50">
                    ⚠️ Computationally Expensive
                </div>

                <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={hanning} onChange={e => setHanning(e.target.checked)} />
                    Hanning
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={upsample} onChange={e => setUpsample(e.target.checked)} />
                    Upsample
                </label>

                <div className="flex flex-col">
                    <label>Gamma: {gamma}</label>
                    <input type="number" step="0.1" className="w-12 bg-[#444] rounded px-1" value={gamma} onChange={e => setGamma(Number(e.target.value))} />
                </div>

                <button
                    onClick={processResampling}
                    className="ml-auto px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded font-bold"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Analysis"}
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-auto bg-[#222] p-4">
                {resultUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={resultUrl} alt="Resampling Result" className="max-w-full max-h-full object-contain" />
                )}
                {!resultUrl && !loading && <span className="text-gray-500">Click Run Analysis</span>}
            </div>
        </div>
    );
};
