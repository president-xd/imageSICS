"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const DigestPanel = ({ image }: { image: any }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!image) return;
        const fetchDigest = async () => {
            setLoading(true);
            try {
                const res = await axios.post('/api/forensic/digest', {
                    image_path: image.fullPath
                });
                setData(res.data);
            } catch (err) {
                console.error(err);
                setData({ error: "Failed to generate digest." });
            } finally {
                setLoading(false);
            }
        };
        fetchDigest();
    }, [image]);

    return (
        <div className="flex flex-col h-full bg-white border border-gray-300">
            <div className="p-2 bg-gray-100 border-b border-gray-300 text-xs font-bold text-gray-800">
                File Digest
            </div>

            <div className="flex-1 overflow-auto bg-gray-50 p-0">
                {loading && <div className="p-4"><Loader2 className="w-4 h-4 animate-spin text-[#4A90E2]" /></div>}

                {!loading && data && (
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="p-2 border-b border-gray-300 font-semibold">Property</th>
                                <th className="p-2 border-b border-gray-300 font-semibold">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.file_hashes && Object.entries(data.file_hashes).map(([key, value]) => (
                                <tr key={`file_${key}`} className="hover:bg-gray-100">
                                    <td className="p-2 font-semibold text-[#4A90E2]">{key}</td>
                                    <td className="p-2 text-gray-700 font-mono text-[10px]">{String(value)}</td>
                                </tr>
                            ))}
                            {data.image_hashes && Object.entries(data.image_hashes).map(([key, value]) => (
                                <tr key={`image_${key}`} className="hover:bg-gray-100">
                                    <td className="p-2 font-semibold text-[#4A90E2]">{key}</td>
                                    <td className="p-2 text-gray-700 font-mono text-[10px]">{String(value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
