"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export const DigestPanel = ({ image }: { image: any }) => {
    const [report, setReport] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!image) return;
        const fetchDigest = async () => {
            setLoading(true);
            try {
                const res = await axios.post('/api/forensic/digest', {
                    image_path: image.fullPath
                });
                // Format the response as JSON string for display
                setReport(JSON.stringify(res.data, null, 2));
            } catch (err) {
                console.error(err);
                setReport("Failed to generate digest.");
            } finally {
                setLoading(false);
            }
        };
        fetchDigest();
    }, [image]);

    return (
        <div className="flex flex-col h-full bg-[#323232] p-4 text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-auto">
            <h3 className="text-gray-300 font-bold font-sans border-b border-gray-600 pb-2 mb-2">File Digest</h3>
            {loading ? <Loader2 className="animate-spin text-accent" /> : report}
        </div>
    );
};
