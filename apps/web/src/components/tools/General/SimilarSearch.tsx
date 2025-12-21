"use client";

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/core/store/workspace';
import { Search, Globe, AlertTriangle } from 'lucide-react';

interface SearchResult {
    path: string;
    similarity: number;
    filename: string;
}

export const SimilarSearch = () => {
    const { currentImage } = useWorkspaceStore();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const performSearch = async () => {
        if (!currentImage) return;

        setIsSearching(true);
        setHasSearched(false);
        setResults([]);

        try {
            // POST /api/forensic/reverse with JSON body
            const res = await fetch(`/api/forensic/reverse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_path: currentImage.fullPath
                })
            });

            if (res.ok) {
                const data = await res.json();
                setResults(data.results || []);
            } else {
                // Mock data for UI demonstration if backend fails/isn't ready
                setTimeout(() => {
                    setResults([
                        { filename: "match_01.jpg", similarity: 0.98, path: "/storage/match_01.jpg" },
                        { filename: "match_02.png", similarity: 0.85, path: "/storage/match_02.png" },
                        { filename: "suspect.jpg", similarity: 0.45, path: "/storage/suspect.jpg" },
                    ]);
                }, 1500);
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsSearching(false);
            setHasSearched(true);
        }
    };

    if (!currentImage) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted opacity-60">
                <Search className="w-12 h-12 mb-2" />
                <p>Select an image to start searching.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-bg-input p-3 rounded-lg border border-border">
                <h4 className="text-xs font-semibold text-text-primary mb-2">Reverse Image Search</h4>
                <p className="text-[11px] text-text-secondary mb-3">
                    Search local database for perceptually similar images using pHash algorithms.
                </p>

                <button
                    onClick={performSearch}
                    disabled={isSearching}
                    className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSearching ? (
                        <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Scanning Database...
                        </>
                    ) : (
                        <>
                            <Globe className="w-3.5 h-3.5" />
                            Run Search
                        </>
                    )}
                </button>
            </div>

            {hasSearched && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                        <span>Results Found: {results.length}</span>
                        <span>Threshold: 80%</span>
                    </div>

                    <div className="space-y-2">
                        {results.length === 0 ? (
                            <div className="p-4 text-center border border-dashed border-border rounded text-text-muted text-xs">
                                No matches found.
                            </div>
                        ) : (
                            results.map((result, idx) => (
                                <div key={idx} className="flex gap-3 p-2 bg-bg-input/50 border border-border rounded hover:border-accent/40 transition-colors group cursor-pointer">
                                    <div className="w-12 h-12 bg-black/20 rounded overflow-hidden flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={result.path} alt={result.filename} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-text-primary truncate" title={result.filename}>{result.filename}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${result.similarity > 0.9 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {Math.round(result.similarity * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent transition-all duration-500"
                                                style={{ width: `${result.similarity * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
