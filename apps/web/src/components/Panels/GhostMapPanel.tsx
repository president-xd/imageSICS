"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const GhostMapPanel = ({ image }: { image: any }) => {
    const [qmin, setQmin] = useState(50);
    const [qmax, setQmax] = useState(90);
    const [qstep, setQstep] = useState(5);
    const [xoffset, setXoffset] = useState(0);
    const [yoffset, setYoffset] = useState(0);
    const [grayscale, setGrayscale] = useState(true);
    const [includeOriginal, setIncludeOriginal] = useState(false);

    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const processGhost = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const res = await axios.post('/api/forensic/jpeg/ghost', {
                image_path: image.fullPath,
                params: {
                    qmin, qmax, qstep, xoffset, yoffset,
                    grayscale, include_original: includeOriginal
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
                <div className="flex flex-col">
                    <label>Q Min: {qmin}</label>
                    <input type="range" min="0" max="100" value={qmin} onChange={e => setQmin(Number(e.target.value))} />
                </div>
                <div className="flex flex-col">
                    <label>Q Max: {qmax}</label>
                    <input type="range" min="0" max="100" value={qmax} onChange={e => setQmax(Number(e.target.value))} />
                </div>
                <div className="flex flex-col">
                    <label>Step: {qstep}</label>
                    <input type="number" className="w-12 bg-[#444] rounded px-1" value={qstep} onChange={e => setQstep(Number(e.target.value))} />
                </div>

                <div className="flex flex-col">
                    <label>Offset X: {xoffset}</label>
                    <input type="number" className="w-10 bg-[#444] rounded px-1" value={xoffset} onChange={e => setXoffset(Number(e.target.value))} />
                </div>
                <div className="flex flex-col">
                    <label>Offset Y: {yoffset}</label>
                    <input type="number" className="w-10 bg-[#444] rounded px-1" value={yoffset} onChange={e => setYoffset(Number(e.target.value))} />
                </div>

                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={grayscale} onChange={e => setGrayscale(e.target.checked)} />
                        Grayscale
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={includeOriginal} onChange={e => setIncludeOriginal(e.target.checked)} />
                        Orig
                    </label>
                </div>

                <button
                    onClick={processGhost}
                    className="ml-auto px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded font-bold"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Calculate Maps"}
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-auto bg-[#222] p-4">
                {resultUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={resultUrl} alt="Ghost Result" className="max-w-full max-h-full object-contain" />
                )}
                {!resultUrl && !loading && <span className="text-gray-500">Click Calculate Maps</span>}
            </div>
        </div>
    );
};
