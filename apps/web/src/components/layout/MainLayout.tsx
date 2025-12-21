"use client";

import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { DockManager } from '../Dock/DockManager';
import { TopMenuBar } from './TopMenuBar';
import { StatusBar } from './StatusBar';

export const MainLayout = () => {
    return (
        <div className="flex flex-col h-full w-full">
            <TopMenuBar />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-64 flex-none border-r border-[var(--border-color)] bg-[var(--bg-panel)]">
                    <Sidebar />
                </div>
                <div className="flex-1 overflow-hidden relative bg-[var(--bg-app)]">
                    <DockManager />
                </div>
            </div>
            <StatusBar />
        </div>
    );
};
