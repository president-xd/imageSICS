"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const MetadataPanel = ({ image }: { image: any }) => {
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!image) return;

        const fetchMeta = async () => {
            setLoading(true);
            try {
                // Assuming internal path is needed, typically we use ID. 
                // But for now sticking to the simple pattern.
                const res = await axios.get(`/api/forensic/metadata/exif?path=${encodeURIComponent(image.fullPath)}`);
                setMetadata(res.data);
            } catch (err) {
                console.error(err);
                setMetadata({ error: "Failed to load metadata" });
            } finally {
                setLoading(false);
            }
        };
        fetchMeta();
    }, [image]);

    return (
        <div className="flex flex-col h-full bg-[#323232]">
            <div className="p-2 bg-[#252525] border-b border-gray-600 text-xs font-bold text-gray-300">
                EXIF / Metadata
            </div>

            <div className="flex-1 overflow-auto bg-[#222] p-0">
                {loading && <div className="p-4"><Loader2 className="w-4 h-4 animate-spin text-white" /></div>}

                {!loading && metadata && (
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#333] text-gray-400">
                            <tr>
                                <th className="p-2 border-b border-gray-600">Tag</th>
                                <th className="p-2 border-b border-gray-600">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {Object.entries(metadata).map(([key, value]) => (
                                <tr key={key} className="hover:bg-white/5">
                                    <td className="p-2 font-semibold text-accent truncate max-w-[150px]">{key}</td>
                                    <td className="p-2 text-gray-300 break-all">{String(value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
