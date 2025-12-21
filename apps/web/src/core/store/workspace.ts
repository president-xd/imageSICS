import { create } from 'zustand';

interface ImageState {
    id: string;
    filename: string;
    url: string;
    fullPath: string;
}

interface WorkspaceState {
    currentImage: ImageState | null;
    activeTool: string | null;
    isLoading: boolean;

    setCurrentImage: (image: ImageState | null) => void;
    setActiveTool: (tool: string | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    currentImage: null,
    activeTool: null,
    isLoading: false,

    setCurrentImage: (image) => set({ currentImage: image }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setLoading: (loading) => set({ isLoading: loading }),
}));
