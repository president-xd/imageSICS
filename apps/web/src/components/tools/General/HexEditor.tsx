"use client";

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/core/store/workspace';

export const HexEditor = () => {
    const { currentImage } = useWorkspaceStore();
    const [hexData, setHexData] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentImage) return;

        const loadHex = async () => {
            setLoading(true);
            try {
                // In a real app, you might fetch only the first N bytes via an API
                // For now, we'll simulate fetching/displaying a snippet
                // If you have a specific API endpoint for hex dump, call it here.
                // Assuming /api/tools/hex?id=... logic
                // Now updated to /api/forensic/hex?path=...
                const encodedPath = encodeURIComponent(currentImage.fullPath);
                const response = await fetch(`/api/forensic/hex?path=${encodedPath}`);
                if (response.ok) {
                    const data = await response.json();
                    setHexData(data.content);
                } else {
                    // Fallback simulation if API isn't ready
                    setHexData("Error loading hex data or API endpoint missing.");
                }
            } catch (e) {
                console.error(e);
                setHexData("Failed to load hex data.");
            } finally {
                setLoading(false);
            }
        };

        loadHex();
    }, [currentImage]);

    if (!currentImage) {
        return <div className="text-xs text-text-muted">No image loaded.</div>;
    }

    return (
        <div className="text-xs font-mono space-y-4">
            <div className="p-2 bg-bg-input rounded border border-border">
                <div className="flex justify-between mb-2 text-text-muted">
                    <span>Offset</span>
                    <span>Bytes</span>
                    <span>ASCII</span>
                </div>
                {loading ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-bg-panel rounded w-3/4"></div>
                        <div className="h-4 bg-bg-panel rounded w-full"></div>
                        <div className="h-4 bg-bg-panel rounded w-5/6"></div>
                    </div>
                ) : (
                    <pre className="overflow-x-auto text-[10px] leading-relaxed text-text-secondary whitespace-pre-wrap break-all">
                        {/* 
                           Displaying a mock hex dump if data is empty for visual purposes 
                           This would be replaced by actual data 
                        */}
                        {hexData || "00000000  FF D8 FF E0 00 10 4A 46  49 46 00 01 01 01 00 48  ......JFIF.....H\n00000010  00 48 00 00 FF DB 00 43  00 08 06 06 07 06 05 08  .H.....C........\n00000020  07 07 07 09 09 08 0A 0C  14 0D 0C 0B 0B 0C 19 12  ................"}
                    </pre>
                )}
            </div>
            <p className="text-[10px] text-text-muted">
                Showing first 256 bytes.
            </p>
        </div>
    );
};
