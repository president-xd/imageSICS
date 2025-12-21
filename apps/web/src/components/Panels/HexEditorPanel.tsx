"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Save } from 'lucide-react';
import { MenuButton } from '../layout/TopMenuBar';

export const HexEditorPanel = ({ image }: { image: any }) => {
    const [data, setData] = useState<Uint8Array | null>(null);
    const [loading, setLoading] = useState(false);
    const [offset] = useState(0);
    const [selectedByte, setSelectedByte] = useState<number | null>(null);
    const [editedMap, setEditedMap] = useState<Map<number, number>>(new Map()); // index -> new value

    useEffect(() => {
        if (!image) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Try fetching the raw image file content
                const res = await axios.get(`/api/images/serve/${image.id}`, { responseType: 'arraybuffer' });
                setData(new Uint8Array(res.data));
            } catch (err) {
                console.error("Failed to load full file for hex edit, using fallback", err);
                try {
                    // Fallback to metadata header if full load fails
                    const res = await axios.get(`/api/forensic/metadata/header?path=${encodeURIComponent(image.fullPath)}`);
                    // Parse hex string to bytes
                    const hex = res.data.hex.replace(/\s/g, '');
                    const bytes = new Uint8Array(hex.length / 2);
                    for (let i = 0; i < hex.length; i += 2) {
                        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
                    }
                    setData(bytes);
                } catch (fallbackErr) {
                    console.error("Fallback failed", fallbackErr);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        setEditedMap(new Map());
    }, [image]);

    // Render helpers
    const getByte = (index: number) => {
        if (editedMap.has(index)) return editedMap.get(index)!;
        return data ? data[index] : 0;
    };

    const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
    const toAscii = (n: number) => (n >= 32 && n <= 126) ? String.fromCharCode(n) : '.';

    const handleByteClick = (index: number) => {
        setSelectedByte(index);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (selectedByte === null) return;

        // Navigation
        if (e.key === 'ArrowRight') {
            setSelectedByte(prev => (prev !== null && prev < (data?.length || 0) - 1) ? prev + 1 : prev);
            return;
        }
        if (e.key === 'ArrowLeft') {
            setSelectedByte(prev => (prev !== null && prev > 0) ? prev - 1 : prev);
            return;
        }

        // Editing
        if (/^[0-9a-fA-F]$/.test(e.key)) {
            const newVal = parseInt(e.key, 16);
            // This is a simplified "replace lower nybble" or just replace whole byte?
            // Let's implement full byte replacement: We need to know if we are typing high or low nybble.
            // Simplified: Just cycle or replace. 
            // Better: Input prompt? No, that's ugly.
            // Let's just assume replace for now or better, keep separate state for "editing".
            // Since this is a demo, let's just allow replacing the whole byte with the value if they type a char? 
            // No, hex requires 2 chars. 
            // Let's stick to "Simple replacement": If they type a digit, we could shift current value?
            // Easier: Just pop a quick prompt for now to ensure correctness.
            const current = getByte(selectedByte);
            // Very simple approach: Shift left and add new nibble (classic hex editor behavior)
            const nextVal = ((current & 0x0F) << 4) | newVal;
            setEditedMap(prev => new Map(prev).set(selectedByte, nextVal));
            // Move to next byte? No, stay to allow fixing.
        }
    };

    // Add event listener for keydown when focused
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (selectedByte !== null) {
                // We'd need to convert to React event or just duplicates logic.
                // Or better: make the hex span focusable.
            }
        };
        // window.addEventListener('keydown', handleGlobalKeyDown);
        // return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [selectedByte]);

    if (loading) return (
        <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-white">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading binary data...</span>
        </div>
    );

    if (!data) return (
        <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-gray-500">
            No file loaded.
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] font-mono text-sm">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 bg-[#2d2d2d] border-b border-[#3e3e3e]">
                <MenuButton title="Save" onClick={() => alert("Save not implemented in this demo")}>
                    <div className="flex items-center gap-1"><Save size={14} /><span>Save</span></div>
                </MenuButton>
                <div className="h-4 w-px bg-gray-600 mx-2" />
                <span className="text-xs text-gray-400">Offset: 0x{offset.toString(16).toUpperCase()}</span>
                <span className="text-xs text-gray-400 ml-4">Size: {data.length} bytes</span>
            </div>

            {/* Hex Grid */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-[80px_1fr_1fr] gap-4">
                    {/* Header */}
                    <div className="text-[var(--accent)] font-bold text-xs">Offset</div>
                    <div className="text-[var(--accent)] font-bold text-xs">00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</div>
                    <div className="text-[var(--accent)] font-bold text-xs">Decoded Text</div>

                    {/* Content - limit to first 2KB for performance since we lack virtualization */}
                    {Array.from({ length: Math.min(Math.ceil(data.length / 16), 128) }).map((_, rowIndex) => {
                        const rowOffset = rowIndex * 16;
                        const rowBytes = [];
                        for (let i = 0; i < 16; i++) {
                            if (rowOffset + i < data.length) rowBytes.push(getByte(rowOffset + i));
                        }

                        return (
                            <React.Fragment key={rowIndex}>
                                {/* Offset Column */}
                                <div className="text-blue-400 opacity-70">
                                    {rowOffset.toString(16).padStart(8, '0').toUpperCase()}
                                </div>

                                {/* Hex Column */}
                                <div className="flex gap-1">
                                    {rowBytes.map((b, i) => (
                                        <span
                                            key={i}
                                            tabIndex={0}
                                            onKeyDown={(e) => handleKeyDown(e)}
                                            className={`w-6 text-center cursor-pointer hover:bg-gray-700 rounded outline-none focus:ring-1 focus:ring-blue-500 ${selectedByte === rowOffset + i ? 'bg-blue-600 text-white' : (editedMap.has(rowOffset + i) ? 'text-yellow-400' : (b === 0 ? 'text-gray-600' : 'text-gray-300'))}`}
                                            onClick={() => handleByteClick(rowOffset + i)}
                                        >
                                            {toHex(b)}
                                        </span>
                                    ))}
                                </div>

                                {/* ASCII Column */}
                                <div className="tracking-widest text-[#cecece]">
                                    {rowBytes.map((b, i) => (
                                        <span key={i} className={b === 0 ? 'opacity-30' : ''}>
                                            {toAscii(b)}
                                        </span>
                                    ))}
                                </div>
                            </React.Fragment>
                        );
                    })}
                    {data.length > 2048 && (
                        <div className="col-span-3 text-center text-gray-500 py-4 italic">
                            ... Rendering limited to first 2KB for performance ...
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};
