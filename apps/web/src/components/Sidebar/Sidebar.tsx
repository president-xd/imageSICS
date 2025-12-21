"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, ImageIcon, UploadCloud } from 'lucide-react';
import { useWorkspaceStore } from '@/core/store/workspace';

const TOOLS = [
    {
        name: "General",
        items: ["Original Image", "File Digest", "Hex Editor", "Similar Search"]
    },
    {
        name: "Metadata",
        items: ["Header Structure", "EXIF Full Dump", "Thumbnail Analysis", "Geolocation Data"]
    },
    {
        name: "Inspection",
        items: ["Enhancing Magnifier", "Channel Histogram", "Global Adjustments", "Reference Comparison"]
    },
    {
        name: "Detail",
        items: ["Luminance Gradient", "Echo Edge Filter", "Wavelet Threshold", "Frequency Split"]
    },
    {
        name: "Colors",
        items: ["RGB/HSV Plots", "Space Conversion", "PCA Projection", "Pixel Statistics"]
    },
    {
        name: "Noise",
        items: ["Signal Separation", "Min/Max Deviation", "Bit Plane Values", "Wavelet Blocking", "PRNU Identification"]
    },
    {
        name: "JPEG",
        items: ["Quality Estimation"]
    }
];

export const Sidebar = () => {
    const { currentImage, setLoading, setCurrentImage } = useWorkspaceStore();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/uploads/', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setCurrentImage({
                id: data.id,
                filename: data.filename,
                url: data.url,
                fullPath: data.path
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-panel)] border-r border-[var(--border-color)]">
            <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-panel)]">
                <h1 className="text-base font-bold tracking-wide text-[var(--accent)] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    imageSICS
                </h1>

                <label className="flex items-center justify-center w-full px-3 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded cursor-pointer transition-all shadow-lg shadow-blue-500/20 text-xs font-semibold">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    <span>Load Image</span>
                    <input type='file' className="hidden" onChange={handleUpload} />
                </label>

                {currentImage && (
                    <div className="mt-3 p-2 bg-[var(--bg-input)] rounded border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] truncate flex items-center gap-2">
                        <ImageIcon className="w-3 h-3 flex-shrink-0" />
                        {currentImage.filename}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                {TOOLS.map(group => (
                    <ToolGroup key={group.name} name={group.name} items={group.items} />
                ))}
            </div>
        </div>
    );
};

const ToolGroup = ({ name, items }: { name: string, items: string[] }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="mb-1 rounded overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center w-full px-2 py-1.5 text-left font-medium text-xs transition-colors ${open ? 'text-[var(--text-primary)] bg-[var(--bg-input)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'}`}
            >
                {open ? <ChevronDown className="w-3.5 h-3.5 mr-2 text-[var(--text-muted)]" /> : <ChevronRight className="w-3.5 h-3.5 mr-2 text-[var(--text-muted)]" />}
                <span>{name}</span>
            </button>

            {open && (
                <div className="ml-2 pl-2 border-l border-[var(--border-highlight)] space-y-0.5 mt-1 mb-2">
                    {items.map(item => (
                        <button
                            key={item}
                            onClick={() => window.dispatchEvent(new CustomEvent('open-tool', { detail: { name: item } }))}
                            className="block w-full text-left px-2 py-1 text-[11px] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-input)] rounded transition-colors"
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
