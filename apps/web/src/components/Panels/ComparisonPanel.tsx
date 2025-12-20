"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle, Upload } from 'lucide-react';

export const ComparisonPanel = ({ image }: { image: any }) => {
    const [refPath, setRefPath] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const run = async () => {
        if (!image) return;
        if (!refPath) {
            setError("Please provide a path for the reference image.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await axios.post('/api/forensic/comparison/metrics', {
                image_path: image.fullPath,
                // Pass as param or body? API code used `req.params.get("reference_path")` which looks at "params" dict in body
                params: { reference_path: refPath }
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
        <div className="flex flex-col h-full bg-[#323232] p-4 text-xs">
            <h3 className="text-gray-300 font-bold border-b border-gray-600 pb-2 mb-2">Image Comparison</h3>

            <div className="mb-4">
                <label className="block text-gray-400 mb-1">Evidence:</label>
                <div className="bg-[#444] p-2 rounded text-gray-300 truncate">
                    {image?.name}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-gray-400 mb-1">Reference Path (server-side):</label>
                <input
                    type="text"
                    value={refPath}
                    onChange={(e) => setRefPath(e.target.value)}
                    placeholder="/path/to/reference.jpg"
                    className="w-full bg-[#222] border border-gray-600 p-2 rounded text-white"
                />
                <div className="text-[10px] text-gray-500 mt-1">
                    Enter the absolute or relative path to the original verification image on the server.
                </div>
            </div>

            <button
                onClick={run}
                className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded flex items-center justify-center gap-2 mb-4"
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin" /> : "Compare Images"}
            </button>

            {error && (
                <div className="bg-red-900/50 text-red-200 p-3 rounded border border-red-700 flex items-start gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>{error}</div>
                </div>
            )}

            {result && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(result).map(([key, val]) => (
                        <div key={key} className="bg-[#444] p-2 rounded flex justify-between">
                            <span className="text-gray-400">{key}:</span>
                            <span className="text-accent font-bold">
                                {typeof val === 'number' ?
                                    (val > 1000 ? val.toFixed(0) : val.toFixed(4))
                                    : val as string}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
