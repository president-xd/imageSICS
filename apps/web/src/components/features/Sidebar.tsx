"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, UploadCloud, Search } from 'lucide-react';
import { useWorkspaceStore } from '@/core/store/workspace';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

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
        items: ["Enhancing Magnifier", "Channel Histogram", "Global Adjustments", "Reference Comparison", "Contrast Enhancement"]
    },
    {
        name: "Detail",
        items: ["Luminance Gradient", "Echo Edge Filter", "Wavelet Threshold", "Frequency Split", "Stereogram Solver"]
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
        items: ["Quality Estimation", "Error Level Analysis", "JPEG Ghost Map", "Multiple Compression"]
    },
    {
        name: "Tampering",
        items: ["Copy-Move Forgery", "Image Splicing", "Image Resampling"]
    }
];

export const Sidebar = () => {
    const { setCurrentImage, setLoading } = useWorkspaceStore();

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
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setCurrentImage({
                id: data.id,
                filename: data.filename,
                url: data.url,
                fullPath: data.path
            });
        } catch (err) {
            console.error(err);
            alert("Failed to upload image. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-bg-panel text-text-primary">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                    <h1 className="font-bold tracking-wider text-base">imageSICS</h1>
                </div>

                <label className="flex items-center justify-center w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white rounded-md cursor-pointer transition-all shadow-lg hover:shadow-accent/20 text-xs font-semibold uppercase tracking-wide">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Load Evidence
                    <input type='file' className="hidden" onChange={handleUpload} />
                </label>
            </div>

            {/* Search (Optional Polish) */}
            <div className="px-3 py-2">
                <div className="relative">
                    <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Filter tools..."
                        className="w-full bg-bg-input border border-border rounded pl-8 pr-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
                    />
                </div>
            </div>

            {/* Tool List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
                {TOOLS.map((group) => (
                    <ToolGroup key={group.name} name={group.name} items={group.items} />
                ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border text-[10px] text-text-muted text-center">
                v2.0.0 • Next.js Edition
            </div>
        </div>
    );
};

const ToolGroup = ({ name, items }: { name: string, items: string[] }) => {
    const [isOpen, setIsOpen] = useState(true);
    const { activeTool, setActiveTool } = useWorkspaceStore();

    return (
        <div className="mb-0.5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center w-full px-2 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors hover:bg-bg-input rounded-sm"
            >
                {isOpen ? (
                    <ChevronDown className="w-3 h-3 mr-2 opacity-70" />
                ) : (
                    <ChevronRight className="w-3 h-3 mr-2 opacity-70" />
                )}
                {name}
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pl-4 pr-1 space-y-0.5 pb-2">
                            {items.map(item => (
                                <button
                                    key={item}
                                    onClick={() => setActiveTool(item)}
                                    className={clsx(
                                        "block w-full text-left px-3 py-1.5 text-[11px] rounded-md transition-all duration-200 border border-transparent",
                                        activeTool === item
                                            ? "bg-accent/10 text-accent border-accent/20 font-medium"
                                            : "text-text-muted hover:text-text-primary hover:bg-bg-input"
                                    )}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
