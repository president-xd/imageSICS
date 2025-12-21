"use client";

import React from 'react';
import {
    FileText,
    Settings,
    Layout,
    ChevronDown,
    Hash,
    Layers,
    Globe,
    Save,
    RefreshCcw
} from 'lucide-react';
import { clsx } from 'clsx';
import { useWorkspaceStore } from '@/core/store/workspace';

export const TopMenuBar = () => {
    const { currentImage, setActiveTool } = useWorkspaceStore();

    return (
        <div className="flex flex-col bg-bg-panel border-b border-border z-20 relative">
            {/* File Menu Row */}
            <div className="flex items-center h-8 px-2 border-b border-border space-x-1">
                <MenuButton label="File" />
                <MenuButton label="Edit" />
                <MenuButton label="View" />
                <MenuButton label="Window" />
                <MenuButton label="Help" />
            </div>

            {/* Toolbar Row */}
            <div className="flex items-center h-10 px-3 gap-2 bg-bg-panel/50 backdrop-blur-sm">
                <div className="flex items-center space-x-1 pr-3 border-r border-border/50">
                    <ToolbarAction
                        icon={<Hash className="w-4 h-4" />}
                        label="Hex"
                        onClick={() => setActiveTool("Hex Editor")}
                    />
                    <ToolbarAction
                        icon={<Globe className="w-4 h-4" />}
                        label="Search"
                        onClick={() => setActiveTool("Similar Search")}
                    />
                </div>

                <div className="flex items-center space-x-1 pl-1">
                    <ToolbarAction
                        icon={<Layers className="w-4 h-4" />}
                        label="Layers"
                    />
                    <ToolbarAction
                        icon={<Settings className="w-4 h-4" />}
                        label="Settings"
                    />
                </div>

                <div className="ml-auto flex items-center space-x-2">
                    {currentImage && (
                        <div className="flex items-center text-[10px] text-text-muted px-2 py-1 bg-bg-input rounded border border-border">
                            <FileText className="w-3 h-3 mr-1.5" />
                            {currentImage.filename}
                        </div>
                    )}
                    <button className="p-1.5 hover:bg-bg-input rounded text-text-muted hover:text-text-primary transition-colors">
                        <RefreshCcw className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-bg-input rounded text-text-muted hover:text-text-primary transition-colors">
                        <Save className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const MenuButton = ({ label }: { label: string }) => (
    <button className="px-3 py-1 text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-input rounded-sm transition-colors">
        {label}
    </button>
);

const ToolbarAction = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-input rounded-md transition-all group"
        title={label}
    >
        <span className="opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
        <span className="font-medium">{label}</span>
    </button>
);
