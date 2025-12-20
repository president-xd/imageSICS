"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const HexEditorPanel = ({ image }: { image: any }) => {
    const [hexData, setHexData] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!image) return;

        const fetchHeader = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/forensic/metadata/header?path=${encodeURIComponent(image.fullPath)}`);
                // Format hex dump
                const match = res.data.hex.match(/.{1,32}/g);
                setHexData(match ? match.join('\n') : "");
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHeader();
    }, [image]);

    return (
        <div className="flex flex-col h-full bg-[#323232]">
            <div className="p-2 bg-[#252525] border-b border-gray-600 text-xs font-bold text-gray-300">
                First 512 bytes (Read-Only)
            </div>

            <div className="flex-1 overflow-auto bg-[#1e1e1e] p-4 font-mono text-xs text-green-500">
                {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                {!loading && !image && <span className="text-gray-500">No image loaded</span>}
                {!loading && image && <pre>{hexData}</pre>}
            </div>
        </div>
    );
};
