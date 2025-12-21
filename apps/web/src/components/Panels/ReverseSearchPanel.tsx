"use client";

import React from 'react';
import { Search, Info } from 'lucide-react';
import { ResultGrid, SearchResult } from './ResultGrid';

// Mock data to simulate the "Same Search" look from the user's request
const MOCK_RESULTS: SearchResult[] = [
    {
        id: '1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
        pageUrl: 'https://shutterstock.com',
        domain: 'shutterstock.com',
        title: 'image-photo/pretty-student-girl-with-ginger-hair-knot',
        fileSize: '8.3 MB',
        dimensions: '3674x5511',
        date: 'May 14, 2022',
        similarity: 0.98
    },
    {
        id: '1b',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
        pageUrl: 'https://medium.com',
        domain: 'medium.com',
        title: 'the-shortform/why-i-absolutely-would-never-dye-my-hair',
        fileSize: '109.7 KB',
        dimensions: '1400x933',
        date: 'Sep 25, 2022',
        similarity: 0.95
    },
    {
        id: '2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
        pageUrl: 'https://freepik.com',
        domain: 'freepik.com',
        title: 'free-photo/pretty-student-girl-with-ginger-hair',
        fileSize: '30.2 KB',
        dimensions: '626x417',
        date: 'Oct 24, 2020',
        similarity: 0.92
    },
    {
        id: '3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
        pageUrl: 'https://adobe.com',
        domain: 'adobe.com',
        title: 'Stock photo of smiling woman in white shirt',
        fileSize: '12.1 MB',
        dimensions: '4000x3000',
        date: 'Jan 10, 2023',
        similarity: 0.85
    },
    {
        id: '4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?w=800&q=80',
        pageUrl: 'https://gettyimages.com',
        domain: 'gettyimages.com',
        title: 'Portrait of young redhead woman',
        fileSize: '5.6 MB',
        dimensions: '2500x1800',
        date: 'Mar 15, 2021',
        similarity: 0.78
    },
    {
        id: '5',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
        pageUrl: 'https://pinterest.com',
        domain: 'pinterest.com',
        title: 'Ginger hair inspiration board',
        fileSize: '45 KB',
        dimensions: '500x700',
        date: 'Dec 05, 2023',
        similarity: 0.75
    },
    // Adding more duplicates to show scrolling
    {
        id: '6',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
        pageUrl: 'https://shutterstock.com',
        domain: 'shutterstock.com',
        title: 'Another variation found on Shutterstock',
        fileSize: '2.1 MB',
        dimensions: '1920x1080',
        date: 'Feb 20, 2022',
        similarity: 0.98
    },
    {
        id: '7',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
        pageUrl: 'https://medium.com',
        domain: 'medium.com',
        title: 'Reposted article image',
        fileSize: '98 KB',
        dimensions: '800x600',
        date: 'Nov 12, 2022',
        similarity: 0.95
    }
];

export const ReverseSearchPanel = ({ image }: { image: any }) => {
    return (
        <div className="flex flex-col h-full bg-[var(--bg-panel)] overflow-hidden">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)] bg-[var(--bg-panel)]">
                <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)] bg-[var(--accent)]/10 p-1.5 rounded-md">
                        <Search className="w-4 h-4" />
                    </span>
                    <h3 className="text-[var(--text-primary)] font-bold text-sm tracking-wide">Similar Search</h3>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-2 bg-[var(--bg-input)] px-2 py-1 rounded border border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)]">Open External:</span>
                        <div className="flex gap-2">
                            <a href={`https://tineye.com/search?url=${encodeURIComponent(image?.url || '')}`} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#ff6b00] transition-colors font-medium">TinEye</a>
                            <span className="text-[var(--border-color)]">|</span>
                            <a href={`https://lens.google.com/upload?url=${encodeURIComponent(image?.url || '')}`} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#4285f4] transition-colors font-medium">Google</a>
                            <span className="text-[var(--border-color)]">|</span>
                            <a href={`https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIHMP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(image?.url || '')}`} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#008080] transition-colors font-medium">Bing</a>
                            <span className="text-[var(--border-color)]">|</span>
                            <a href={`https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(image?.url || '')}`} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#ff0000] transition-colors font-medium">Yandex</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <ResultGrid results={MOCK_RESULTS} />

            {/* Footer Status */}
            <div className="p-2 bg-[var(--bg-app)] border-t border-[var(--border-color)] flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                <Info className="w-3 h-3" />
                <span>Found {MOCK_RESULTS.length} results in 0.45s</span>
            </div>
        </div>
    );
};
