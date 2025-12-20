"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Sliders } from 'lucide-react';

interface FilterConfig {
    name: string;
    endpoint: string;
    controls: Control[];
}

interface Control {
    id: string;
    type: 'slider' | 'select';
    label: string;
    min?: number;
    max?: number;
    step?: number;
    default: number | string;
    options?: { label: string; value: string }[];
}

export const GenericResultPanel = ({ image, config }: { image: any, config: FilterConfig }) => {
    const [params, setParams] = useState<Record<string, any>>({});
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Init default params
    useEffect(() => {
        const defaults: Record<string, any> = {};
        config.controls.forEach(c => defaults[c.id] = c.default);
        setParams(defaults);
    }, [config]);

    const run = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const res = await axios.post(`/api/forensic${config.endpoint}`, {
                image_path: image.fullPath,
                params: params
            });
            setResultUrl(res.data.result_url);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (id: string, val: any) => {
        setParams(p => ({ ...p, [id]: val }));
    };

    return (
        <div className="flex flex-col h-full bg-[#323232]">
            <div className="flex flex-wrap items-center p-2 bg-[#252525] border-b border-gray-600 gap-4 text-xs">
                {config.controls.map(c => (
                    <div key={c.id} className="flex flex-col min-w-[60px]">
                        <label className="text-gray-400 mb-1">{c.label}</label>
                        {c.type === 'slider' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min={c.min} max={c.max} step={c.step}
                                    value={params[c.id] || c.default}
                                    onChange={e => handleChange(c.id, Number(e.target.value))}
                                    className="w-20"
                                />
                                <span className="text-[10px] w-6">{params[c.id]}</span>
                            </div>
                        )}
                        {c.type === 'select' && (
                            <select
                                className="bg-[#444] rounded px-1 py-1"
                                value={params[c.id] || c.default}
                                onChange={e => handleChange(c.id, e.target.value)}
                            >
                                {c.options?.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        )}
                    </div>
                ))}

                <button
                    onClick={run}
                    className="ml-auto px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded font-bold flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Process"}
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-auto bg-[#222] p-4 relative">
                {resultUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={resultUrl} alt="Result" className="max-w-full max-h-full object-contain shadow-lg" />
                ) : (
                    <div className="text-gray-600 flex flex-col items-center">
                        <Sliders className="w-12 h-12 mb-2 opacity-20" />
                        <span>Ready to process</span>
                    </div>
                )}
            </div>
        </div>
    );
};
