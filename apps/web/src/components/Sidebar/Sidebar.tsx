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
        items: ["Header Structure", "EXIF Dump", "Thumbnail Analysis", "Geolocation"]
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
        items: ["Signal Separation", "Min/Max Deviation", "Bit Plane Values", "PRNU Identification"]
    },
    {
        name: "JPEG",
        items: ["Quality Estimation", "Error Level Analysis", "Multiple Compression", "JPEG Ghost Map"]
    },
    {
        name: "Tampering",
        items: ["Contrast Enhancement", "Copy-Move Forgery", "Image Splicing", "Image Resampling"]
    },
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
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700">
                <h1 className="text-xl font-bold tracking-wider text-accent mb-4">imageSICS</h1>

                <label className="flex items-center justify-center w-full px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded cursor-pointer transition-colors">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Load Image</span>
                    <input type='file' className="hidden" onChange={handleUpload} />
                </label>

                {currentImage && (
                    <div className="mt-2 text-xs text-gray-400 truncate">
                        {currentImage.filename}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
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
        <div className="mb-1">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center w-full p-2 text-gray-300 hover:bg-white/5 rounded text-left"
            >
                {open ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                <span className="font-semibold text-sm">{name}</span>
            </button>

            {open && (
                <div className="ml-4 pl-2 border-l border-gray-600 space-y-1 mt-1">
                    {items.map(item => (
                        <button
                            key={item}
                            // On click: Open specific panel in DockManager
                            onClick={() => window.dispatchEvent(new CustomEvent('open-tool', { detail: { name: item } }))}
                            className="block w-full text-left px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded"
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
