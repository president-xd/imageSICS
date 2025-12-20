"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const CloningPanel = ({ image }: { image: any }) => {
    const [algorithm, setAlgorithm] = useState("BRISK");
    const [response, setResponse] = useState(90);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const processCloning = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const res = await axios.post('/api/forensic/cloning', {
                image_path: image.fullPath,
                params: {
                    algorithm,
                    response_threshold: response
                }
            });
            setResultUrl(res.data.result_url);
            setStats(res.data.stats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#323232]">
            <div className="flex items-center p-2 bg-[#252525] border-b border-gray-600 gap-4 text-xs">
                <select
                    value={algorithm}
                    onChange={e => setAlgorithm(e.target.value)}
                    className="bg-[#444] text-white p-1 rounded"
                >
                    <option value="BRISK">BRISK</option>
                    <option value="ORB">ORB</option>
                    <option value="AKAZE">AKAZE</option>
                </select>

                <div className="flex flex-col">
                    <label>Response: {response}</label>
                    <input type="range" min="0" max="100" value={response} onChange={e => setResponse(Number(e.target.value))} />
                </div>

                <button
                    onClick={processCloning}
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded font-bold"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Analysis"}
                </button>
            </div>

            <div className="flex-1 flex flex-row overflow-hidden">
                <div className="flex-1 overflow-auto bg-[#222] p-4 flex items-center justify-center">
                    {resultUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={resultUrl} alt="Cloning Result" className="max-w-full max-h-full object-contain" />
                    )}
                </div>
                {stats && (
                    <div className="w-64 bg-[#252525] p-4 text-xs space-y-2 border-l border-gray-600">
                        <h3 className="font-bold text-lg mb-4">Results</h3>
                        <div className="flex justify-between">
                            <span>Keypoints:</span>
                            <span>{stats.keypoints_count}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Filtered:</span>
                            <span>{stats.filtered_count}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Matches:</span>
                            <span>{stats.matches_count}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Clusters:</span>
                            <span>{stats.clusters_count}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
