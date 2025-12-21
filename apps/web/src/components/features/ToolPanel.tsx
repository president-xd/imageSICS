"use client";

import React from 'react';
import { useWorkspaceStore } from '@/core/store/workspace';
import { HexEditor } from '../tools/General/HexEditor';
import { SimilarSearch } from '../tools/General/SimilarSearch';
import { X } from 'lucide-react';

export const ToolPanel = () => {
    const { activeTool, setActiveTool } = useWorkspaceStore();

    if (!activeTool) return null;

    const renderTool = () => {
        switch (activeTool) {
            case "Hex Editor":
                return <HexEditor />;
            case "Similar Search":
                return <SimilarSearch />;
            default:
                return (
                    <div className="flex items-center justify-center h-full text-text-muted">
                        <div className="text-center">
                            <p className="mb-2">Tool not yet implemented</p>
                            <code className="bg-bg-input px-2 py-1 rounded text-xs">{activeTool}</code>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col bg-bg-panel border-l border-border w-96 shadow-xl absolute right-0 top-0 z-10">
            <div className="flex items-center justify-between p-3 border-b border-border bg-bg-panel">
                <h3 className="font-semibold text-sm text-text-primary">{activeTool}</h3>
                <button
                    onClick={() => setActiveTool(null)}
                    className="p-1 hover:bg-bg-input rounded text-text-secondary hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-bg-card">
                {renderTool()}
            </div>
        </div>
    );
};
