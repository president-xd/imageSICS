"use client";

import React from 'react';
import { Sidebar } from '../features/Sidebar';
import { useWorkspaceStore } from '@/core/store/workspace';
import { UploadCloud } from 'lucide-react';
import { ToolPanel } from '../features/ToolPanel';
import { TopMenuBar } from './TopMenuBar';

export const Shell = () => {
    const { currentImage } = useWorkspaceStore();

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-bg-panel text-text-primary">
            {/* Sidebar (Fixed Width) */}
            <div className="w-64 flex-shrink-0 border-r border-border">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-bg-card">
                {/* Top Menu Bar */}
                <TopMenuBar />

                {/* Canvas / Viewport */}
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative">
                    {currentImage ? (
                        <div className="relative max-w-full max-h-full shadow-2xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={currentImage.url}
                                alt="Evidence"
                                className="max-w-full max-h-[80vh] object-contain border border-border"
                            />
                        </div>
                    ) : (
                        <div className="text-center text-text-secondary select-none">
                            <div className="mb-4 flex justify-center">
                                <div className="p-4 bg-bg-panel rounded-full border border-border">
                                    <UploadCloud className="w-8 h-8 opacity-50" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-text-primary">No Image Loaded</h3>
                            <p className="text-sm mt-1">Select an image from the sidebar to begin analysis.</p>
                        </div>
                    )}

                    <ToolPanel />
                </div>
            </div>
        </div>
    );
};
