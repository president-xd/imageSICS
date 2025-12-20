"use client";

import React from 'react';

export const OriginalImagePanel = ({ image }: { image: any }) => {
    if (!image) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 bg-[#222]">
                No image loaded
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center overflow-auto bg-[#222] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={image.url}
                alt="Original"
                className="max-w-full max-h-full object-contain shadow-lg"
            />
        </div>
    );
};
