"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Layout, Model, TabNode, IJsonModel, Actions, DockLocation } from 'flexlayout-react';
import 'flexlayout-react/style/dark.css';
import { useWorkspaceStore } from '@/core/store/workspace';

// Panels
import { OriginalImagePanel } from '../Panels/OriginalImagePanel';
import { ElaPanel } from '../Panels/ElaPanel';
import { CloningPanel } from '../Panels/CloningPanel';
import { GhostMapPanel } from '../Panels/GhostMapPanel';
import { ResamplingPanel } from '../Panels/ResamplingPanel';
import { MetadataPanel } from '../Panels/MetadataPanel';
import { HexEditorPanel } from '../Panels/HexEditorPanel';
import { GenericResultPanel } from '../Panels/GenericResultPanel';
import { StatsPanel } from '../Panels/StatsPanel';
import { ReverseSearchPanel } from '../Panels/ReverseSearchPanel';
import { LocationPanel } from '../Panels/LocationPanel';
import { SplicingPanel } from '../Panels/SplicingPanel';
import { TruForPanel } from '../Panels/TruForPanel';
import { ComparisonPanel } from '../Panels/ComparisonPanel';
import { HistogramPanel } from '../Panels/HistogramPanel';
import { DigestPanel } from '../Panels/DigestPanel';

const INITIAL_LAYOUT: IJsonModel = {
    global: {
        tabEnableClose: true,
        tabEnableFloat: true,
        tabSetEnableMaximize: true,
    },
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "row",
                weight: 50,
                children: [
                    {
                        type: "tabset",
                        weight: 50,
                        selected: 0,
                        children: [
                            {
                                type: "tab",
                                name: "Original Image",
                                component: "Original Image",
                            }
                        ]
                    },
                    {
                        type: "tabset",
                        weight: 50,
                        selected: 0,
                        children: [
                            {
                                type: "tab",
                                name: "File Digest",
                                component: "File Digest",
                            }
                        ]
                    }
                ]
            },
            {
                type: "row",
                weight: 50,
                children: [
                    {
                        type: "tabset",
                        weight: 50,
                        selected: 0,
                        children: [
                            {
                                type: "tab",
                                name: "Hex Editor",
                                component: "Hex Editor",
                            }
                        ]
                    },
                    {
                        type: "tabset",
                        weight: 50,
                        selected: 0,
                        children: [
                            {
                                type: "tab",
                                name: "Similar Search",
                                component: "Similar Search",
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

export const DockManager = () => {
    const [model] = useState(() => Model.fromJson(INITIAL_LAYOUT));
    const { currentImage } = useWorkspaceStore();

    useEffect(() => {
        const handleOpenTool = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            const name = detail.name;

            // Check if already open?
            // For now just add to active tabset
            const activeTabset = model.getActiveTabset();
            const toNodeId = activeTabset ? activeTabset.getId() : (model.getRoot().getChildren()[0]?.getId() || "0");

            model.doAction(
                Actions.addNode(
                    {
                        type: "tab",
                        component: name,
                        name: name,
                    },
                    toNodeId,
                    DockLocation.CENTER,
                    -1
                )
            );
        };

        window.addEventListener('open-tool', handleOpenTool);
        return () => window.removeEventListener('open-tool', handleOpenTool);
    }, [model]);

    const factory = (node: TabNode) => {
        const component = node.getComponent();
        const props = { image: currentImage };

        // General ----------------------------------------------------
        if (component === "Original Image") return <OriginalImagePanel {...props} />;
        if (component === "File Digest") return <DigestPanel {...props} />;
        if (component === "Hex Editor") return <HexEditorPanel {...props} />;
        if (component === "Similar Search") return <ReverseSearchPanel {...props} />;

        // Metadata ---------------------------------------------------
        if (component === "Header Structure") return <HexEditorPanel {...props} />;
        if (component === "EXIF Dump") return <MetadataPanel {...props} />;
        if (component === "Thumbnail Analysis") return <GenericResultPanel {...props} config={{
            name: "Thumbnail", endpoint: "/metadata/thumbnail", controls: []
        }} />;
        if (component === "Geolocation") return <LocationPanel {...props} />;

        // Inspection -------------------------------------------------
        if (component === "Enhancing Magnifier") {
            return <GenericResultPanel {...props} config={{
                name: "Adjustment", endpoint: "/filter/adjust", controls: [
                    { id: "brightness", type: "slider", label: "Brightness", min: -100, max: 100, default: 0 },
                    { id: "contrast", type: "slider", label: "Contrast", min: 0, max: 200, default: 100 },
                    { id: "gamma", type: "slider", label: "Gamma", min: 10, max: 300, default: 100 }
                ]
            }} />;
        }
        if (component === "Channel Histogram") return <HistogramPanel {...props} />;
        if (component === "Global Adjustments") return <GenericResultPanel {...props} config={{
            name: "Adjustment", endpoint: "/filter/adjust", controls: [
                { id: "brightness", type: "slider", label: "Brightness", min: -100, max: 100, default: 0 },
                { id: "contrast", type: "slider", label: "Contrast", min: 0, max: 200, default: 100 },
                { id: "gamma", type: "slider", label: "Gamma", min: 10, max: 300, default: 100 }
            ]
        }} />;
        if (component === "Reference Comparison") return <ComparisonPanel {...props} />;

        // Detail -----------------------------------------------------
        if (component === "Luminance Gradient") return <GenericResultPanel {...props} config={{
            name: "Gradient", endpoint: "/filter/gradient", controls: [
                { id: "axis", type: "select", label: "Axis", default: "x", options: [{ label: "X", value: "x" }, { label: "Y", value: "y" }] }
            ]
        }} />;
        if (component === "Echo Edge Filter") return <GenericResultPanel {...props} config={{
            name: "Echo Edge", endpoint: "/filter/echo", controls: []
        }} />;
        if (component === "Wavelet Threshold") return <GenericResultPanel {...props} config={{
            name: "Wavelet", endpoint: "/transform/wavelet", controls: []
        }} />;
        if (component === "Frequency Split") return <GenericResultPanel {...props} config={{
            name: "FFT", endpoint: "/transform/frequency", controls: []
        }} />;

        // Colors -----------------------------------------------------
        if (component === "RGB/HSV Plots") return <GenericResultPanel {...props} config={{
            name: "3D Plot", endpoint: "/transform/plot", controls: []
        }} />;
        if (component === "Wavelet Blocking") return <GenericResultPanel {...props} config={{
            name: "Wavelet Blocking", endpoint: "/analysis/blocking", controls: []
        }} />;
        if (component === "Space Conversion") return <GenericResultPanel {...props} config={{
            name: "Color Space", endpoint: "/transform/space", controls: [
                { id: "space", type: "select", label: "Space", default: "HSV", options: ["HSV", "LAB", "YCrCb", "YUV", "XYZ"].map(s => ({ label: s, value: s })) },
                { id: "channel", type: "select", label: "Channel", default: "0", options: [{ label: "1", value: "0" }, { label: "2", value: "1" }, { label: "3", value: "2" }] }
            ]
        }} />;
        if (component === "PCA Projection") return <GenericResultPanel {...props} config={{
            name: "PCA", endpoint: "/transform/pca", controls: []
        }} />;
        if (component === "Pixel Statistics") return <StatsPanel {...props} />;

        // Noise ------------------------------------------------------
        if (component === "Signal Separation") return <GenericResultPanel {...props} config={{
            name: "Noise", endpoint: "/noise", controls: [
                { id: "sigma", type: "slider", label: "Sigma", min: 0, max: 50, default: 1 }
            ]
        }} />;
        if (component === "Min/Max Deviation") return <GenericResultPanel {...props} config={{
            name: "MinMax", endpoint: "/analysis/minmax", controls: []
        }} />;
        if (component === "Bit Plane Values") return <GenericResultPanel {...props} config={{
            name: "Bit Plane", endpoint: "/analysis/bitplane", controls: [
                { id: "plane", type: "select", label: "Plane", default: "0", options: [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ label: String(i), value: String(i) })) }
            ]
        }} />;
        if (component === "PRNU Identification") return <SplicingPanel {...props} />;

        // JPEG -------------------------------------------------------
        if (component === "Quality Estimation") return <GenericResultPanel {...props} config={{
            name: "JPEG Quality", endpoint: "/jpeg/quality", controls: []
        }} />;
        if (component === "Error Level Analysis") return <ElaPanel {...props} />;
        if (component === "Multiple Compression") return <GenericResultPanel {...props} config={{
            name: "Compression", endpoint: "/jpeg/quality", controls: []
        }} />;
        if (component === "JPEG Ghost Map") return <GhostMapPanel {...props} />;

        // Tampering --------------------------------------------------
        if (component === "Contrast Enhancement") return <GenericResultPanel {...props} config={{
            name: "Contrast", endpoint: "/filter/contrast", controls: [
                { id: "method", type: "select", label: "Method", default: "clahe", options: [{ label: "CLAHE", value: "clahe" }, { label: "HistEq", value: "hist" }] }
            ]
        }} />;
        if (component === "Copy-Move Forgery") return <CloningPanel {...props} />;
        if (component === "Image Splicing") return <SplicingPanel {...props} />;
        if (component === "Image Resampling") return <ResamplingPanel {...props} />;

        if (component === "Stereogram Solver") return <GenericResultPanel {...props} config={{
            name: "Stereogram", endpoint: "/stereogram", controls: [
                { id: "mode", type: "select", label: "Mode", default: "pattern", options: ["pattern", "silhouette", "depth", "shaded"].map(s => ({ label: s, value: s })) }
            ]
        }} />;

        return (
            <div className="p-4 flex items-center justify-center h-full text-gray-500">
                Panel implementation for {component} pending.
            </div>
        );
    };


    return (
        <div className="absolute inset-0">
            <Layout model={model} factory={factory} />
        </div>
    );
};
