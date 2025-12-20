"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle } from 'lucide-react';

export const TruForPanel = ({ image }: { image: any }) => {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const run = async () => {
        if (!image) return;
        setLoading(true);
        setError("");
        try {
            const res = await axios.post('/api/forensic/splicing/trufor', {
                image_path: image.fullPath
            });
            if (res.data.error) setError(res.data.error);
            else setResult(res.data);
        } catch (err: any) {
            setError(err.message || "Request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#323232] p-4">
            <h3 className="text-gray-300 font-bold border-b border-gray-600 pb-2 mb-2">TruFor Analysis</h3>

            <button
                onClick={run}
                className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded flex items-center justify-center gap-2 mb-4"
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin" /> : "Run TruFor"}
            </button>

            {error && (
                <div className="bg-red-900/50 text-red-200 p-3 rounded border border-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div className="text-xs">{error}</div>
                </div>
            )}

            {result && (
                <div className="flex-1 text-gray-300 text-xs whitespace-pre-wrap">
                    {/* Placeholder for real result logic */}
                    {JSON.stringify(result, null, 2)}
                </div>
            )}
        </div>
    );
};
