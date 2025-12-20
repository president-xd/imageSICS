"use client";

import React from 'react';
import { Search } from 'lucide-react';

export const ReverseSearchPanel = ({ image }: { image: any }) => {
    // TinEye, Google, Bing, Yandex
    // Need public URL or upload. For local dev, we can't easily push local image to these services without a public proxy.
    // Sherloq uses local path? No, standard browsers need URLs.
    // Sherloq Qt WebEngine loading "https://www.google.com/imghp" is just the page.
    // To automating searching, we need to upload.
    // For now, we replicate Sherloq's "Web View" approach: just load the search engine page in an iframe or open new tab.

    // Actually Sherloq provides buttons.
    // Let's provide links to open in new tab for now, as iframes are blocked by X-Frame-Options for these sites (Google/Bing).

    return (
        <div className="flex flex-col h-full bg-[#323232] p-4 gap-4">
            <h3 className="text-gray-300 font-bold border-b border-gray-600 pb-2">Reverse Image Search</h3>
            <div className="grid grid-cols-1 gap-2">
                <a
                    href="https://tineye.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-3 bg-[#444] hover:bg-[#555] rounded text-white"
                >
                    <Search className="w-4 h-4 text-orange-400" /> TinEye
                </a>
                <a
                    href="https://images.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-3 bg-[#444] hover:bg-[#555] rounded text-white"
                >
                    <Search className="w-4 h-4 text-blue-400" /> Google Images
                </a>
                <a
                    href="https://www.bing.com/visualsearch"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-3 bg-[#444] hover:bg-[#555] rounded text-white"
                >
                    <Search className="w-4 h-4 text-teal-400" /> Bing Visual Search
                </a>
                <a
                    href="https://yandex.com/images/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-3 bg-[#444] hover:bg-[#555] rounded text-white"
                >
                    <Search className="w-4 h-4 text-red-500" /> Yandex Images
                </a>
            </div>

            <div className="text-xs text-gray-500 mt-4">
                Note: Since your image is local, you must manually upload it to these services after opening them.
            </div>
        </div>
    );
};
