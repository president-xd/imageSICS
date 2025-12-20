"use client";

import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { DockManager } from '../Dock/DockManager';

export const MainLayout = () => {
    return (
        <div className="flex h-full w-full flex-row">
            <div className="w-64 flex-none border-r border-gray-700 bg-[var(--panel-bg)]">
                <Sidebar />
            </div>
            <div className="flex-1 overflow-hidden relative">
                <DockManager />
            </div>
        </div>
    );
};
