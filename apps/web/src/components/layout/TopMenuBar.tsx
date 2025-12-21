"use client";

import React from 'react';
import { Upload, Eye, ChevronRight, Hash, Code, Layers, X } from 'lucide-react';

export const TopMenuBar = () => {
    return (
        <div className="flex flex-col bg-[var(--bg-panel)] border-b border-[var(--border-color)]">
            {/* Menu Bar */}
            <div className="flex items-center h-8 px-2 text-[11px] border-b border-[var(--border-color)] bg-[var(--bg-panel)]">
                <MenuButton title="File">File</MenuButton>
                <MenuButton title="View">View</MenuButton>
                <MenuButton title="Window">Window</MenuButton>
                <MenuButton title="Help">Help</MenuButton>
            </div>

            {/* Toolbar */}
            <div className="flex items-center h-10 px-2 gap-1 bg-[var(--bg-panel)]">
                <ToolbarButton title="Load Image">
                    <Upload className="w-4 h-4" />
                    <span>Load Image</span>
                </ToolbarButton>

                <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

                <ToolbarButton title="Show Tools">
                    <Eye className="w-4 h-4" />
                    <span>Show Tools</span>
                </ToolbarButton>

                <ToolbarButton title="Previous" iconOnly>
                    <ChevronRight className="w-4 h-4 rotate-180" />
                </ToolbarButton>

                <ToolbarButton title="Next" iconOnly>
                    <ChevronRight className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

                <ToolbarButton title="Hex Editor">
                    <Hash className="w-4 h-4" />
                    <span>Hex</span>
                </ToolbarButton>

                <ToolbarButton title="Decode">
                    <Code className="w-4 h-4" />
                    <span>Decode</span>
                </ToolbarButton>

                <ToolbarButton title="Tabbed View">
                    <Layers className="w-4 h-4" />
                    <span>Tabbed</span>
                </ToolbarButton>

                <ToolbarButton title="Close All">
                    <X className="w-4 h-4" />
                    <span>Close All</span>
                </ToolbarButton>
            </div>
        </div>
    );
};

export const MenuButton = ({ children, title, iconOnly, onClick, active }: { children?: React.ReactNode, title: string, iconOnly?: boolean, onClick?: () => void, active?: boolean }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 ${iconOnly ? 'p-1.5' : 'px-3 py-1.5'} rounded border text-[11px] font-medium transition-all
        ${active
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-white hover:border-[var(--border-highlight)]'
            }`}
        title={title}
    >
        {children}
    </button>
);

const ToolbarButton = ({ children, title, iconOnly }: { children: React.ReactNode, title: string, iconOnly?: boolean }) => (
    <button
        className={`flex items-center gap-2 ${iconOnly ? 'p-1.5' : 'px-3 py-1.5'} hover:bg-[var(--bg-input)] hover:text-white rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] text-[11px] font-medium transition-all hover:border-[var(--border-highlight)]`}
        title={title}
    >
        {children}
    </button>
);
