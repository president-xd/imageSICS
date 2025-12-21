"use client";

import React from 'react';
import { useWorkspaceStore } from '@/core/store/workspace';

export const StatusBar = () => {
    const { currentImage } = useWorkspaceStore();

    return (
        <div className="flex items-center justify-between h-6 px-3 bg-[var(--bg-panel)] border-t border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] font-medium">
            {/* Left: Zoom level */}
            <div className="flex items-center gap-2">
                <span>Zoom: 12.44%</span>
            </div>

            {/* Center: File details */}
            <div className="flex items-center gap-3">
                {currentImage && (
                    <>
                        <span className="text-[var(--text-primary)]">[Det:44331 px]</span>
                    </>
                )}
            </div>

            {/* Right: Coordinates */}
            <div className="flex items-center gap-2">
                <span>X: 0 Y: 0</span>
            </div>
        </div>
    );
};
