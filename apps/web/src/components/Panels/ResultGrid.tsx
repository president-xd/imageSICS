
"use client";

import React from 'react';
import { ExternalLink, Calendar, HardDrive } from 'lucide-react';

export interface SearchResult {
    id: string;
    thumbnailUrl: string;
    pageUrl: string;
    domain: string;
    title: string;
    fileSize?: string;
    dimensions?: string;
    date?: string;
    similarity?: number;
}

interface ResultGridProps {
    results: SearchResult[];
}

export const ResultGrid = ({ results }: ResultGridProps) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.map((result) => (
                    <div
                        key={result.id}
                        className="glass-card rounded-lg overflow-hidden flex flex-col group relative"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-video bg-[#1a1a1a] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={result.thumbnailUrl}
                                alt={result.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <a
                                    href={result.pageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm text-white"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>

                            {/* Similarity Badge */}
                            {result.similarity && (
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded text-[10px] font-medium text-white border border-white/10">
                                    {(result.similarity * 100).toFixed(1)}% Match
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-3 flex flex-col gap-2 bg-[#252525]">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                                    {result.domain}
                                </span>
                                {result.date && (
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span>{result.date}</span>
                                    </div>
                                )}
                            </div>

                            <a
                                href={result.pageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-gray-200 line-clamp-2 hover:text-blue-400 transition-colors"
                            >
                                {result.title}
                            </a>

                            <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
                                <div className="flex items-center gap-1">
                                    <HardDrive className="w-3 h-3" />
                                    <span>{result.fileSize || 'N/A'}</span>
                                </div>
                                <span>{result.dimensions || 'Unknown size'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
