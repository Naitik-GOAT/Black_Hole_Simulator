import { create } from 'zustand';

interface SimulationState {
    mass: number;
    setMass: (mass: number) => void;
    timeScale: number;
    setTimeScale: (scale: number) => void;
    showEventHorizon: boolean;
    setShowEventHorizon: (show: boolean) => void;
    showAccretionDisk: boolean;
    setShowAccretionDisk: (show: boolean) => void;
    enableLensing: boolean;
    setEnableLensing: (enable: boolean) => void;
    isPaused: boolean;
    togglePause: () => void;
    // Object Storing
    objects: SpaceObjectData[];
    addObject: (obj: SpaceObjectData) => void;
    removeObject: (id: string) => void;
}

export interface SpaceObjectData {
    id: string;
    position: [number, number, number];
    velocity: [number, number, number];
    mass: number;
    color: string;
    radius: number;
}

export const useSimulationStore = create<SimulationState>((set) => ({
    mass: 10.0, // Default mass
    setMass: (mass) => set({ mass }),
    timeScale: 1.0,
    setTimeScale: (timeScale) => set({ timeScale }),
    showEventHorizon: true,
    setShowEventHorizon: (showEventHorizon) => set({ showEventHorizon }),
    showAccretionDisk: true,
    setShowAccretionDisk: (showAccretionDisk) => set({ showAccretionDisk }),
    enableLensing: true,
    setEnableLensing: (enableLensing) => set({ enableLensing }),
    isPaused: false,
    togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
    objects: [],
    addObject: (obj) => set((state) => ({ objects: [...state.objects, obj] })),
    removeObject: (id) => set((state) => ({ objects: state.objects.filter(o => o.id !== id) })),
}));
