import { create } from 'zustand';

interface ImageMetadata {
    id: string;
    filename: string;
    url: string;
    fullPath: string;
}

interface WorkspaceState {
    currentImage: ImageMetadata | null;
    setCurrentImage: (img: ImageMetadata) => void;
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    currentImage: null,
    setCurrentImage: (img) => set({ currentImage: img }),
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
}));
