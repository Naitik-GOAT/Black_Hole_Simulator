import React from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { GRAVITATIONAL_CONSTANT } from '../physics/constants';
import clsx from 'clsx';

export const Controls: React.FC = () => {
    const {
        mass, setMass,
        timeScale, setTimeScale,
        showEventHorizon, setShowEventHorizon,
        showAccretionDisk, setShowAccretionDisk,
        enableLensing, setEnableLensing,
        isPaused, togglePause,
        addObject
    } = useSimulationStore();

    const spawnAsteroid = () => {
        const id = Math.random().toString(36).substring(2, 9);
        const r = 25 + Math.random() * 10;
        const angle = Math.random() * Math.PI * 2;
        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle);

        // Calculate Circular Orbital Velocity v = sqrt(GM/r) for stable orbit
        const vMag = Math.sqrt((GRAVITATIONAL_CONSTANT * mass) / r);
        const vx = -vMag * Math.sin(angle);
        const vz = vMag * Math.cos(angle);

        addObject({
            id,
            position: [x, (Math.random() - 0.5) * 2, z], // slight y variation
            velocity: [vx, 0, vz],
            mass: 0.1,
            color: '#cccccc',
            radius: 0.2 + Math.random() * 0.3
        });
    };

    return (
        <div className="absolute top-20 left-4 w-72 bg-space-dark/90 backdrop-blur-md border border-white/10 p-5 rounded-lg text-white font-mono shadow-xl">
            <h2 className="text-md font-bold text-cyan-400 border-b border-white/10 pb-2 mb-4 tracking-widest">
                CONTROLS //
            </h2>

            {/* Mass Slider */}
            <div className="mb-6">
                <label className="flex justify-between text-xs text-cyan-200 mb-2">
                    <span>Black Hole Mass (M)</span>
                    <span>{mass.toFixed(1)}</span>
                </label>
                <input
                    type="range"
                    min="1" max="50" step="0.1"
                    value={mass}
                    onChange={(e) => setMass(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-cyan-900 transition-colors accent-cyan-500"
                />
            </div>

            {/* Time Scale Slider */}
            <div className="mb-6">
                <label className="flex justify-between text-xs text-cyan-200 mb-2">
                    <span>Time Dilation (Speed)</span>
                    <span>{timeScale.toFixed(1)}x</span>
                </label>
                <input
                    type="range"
                    min="0" max="5" step="0.1"
                    value={timeScale}
                    onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-orange-900 transition-colors accent-orange-500"
                />
            </div>

            {/* Toggles */}
            <div className="space-y-3 mb-6">
                <Toggle label="Event Horizon" checked={showEventHorizon} onChange={setShowEventHorizon} color="cyan" />
                <Toggle label="Accretion Disk" checked={showAccretionDisk} onChange={setShowAccretionDisk} color="orange" />
                <Toggle label="Gravitational Lensing" checked={enableLensing} onChange={setEnableLensing} color="purple" />
            </div>

            {/* Spawn Button */}
            <div className="mb-6">
                <button
                    onClick={spawnAsteroid}
                    className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded shadow-lg hover:from-cyan-500 hover:to-blue-500 transition-all border border-cyan-400/30"
                >
                    SPAWN ASTEROID
                </button>
            </div>

            {/* Pause Button */}
            <button
                onClick={togglePause}
                className={clsx(
                    "w-full py-2 rounded text-xs font-bold tracking-widest border transition-all duration-300",
                    isPaused
                        ? "bg-red-500/20 border-red-500 text-red-100 hover:bg-red-500/40"
                        : "bg-cyan-500/20 border-cyan-500 text-cyan-100 hover:bg-cyan-500/40"
                )}
            >
                {isPaused ? "RESUME SIMULATION" : "PAUSE SIMULATION"}
            </button>
        </div>
    );
};

// Helper Toggle Component
const Toggle = ({ label, checked, onChange, color }: { label: string, checked: boolean, onChange: (v: boolean) => void, color?: string }) => (
    <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!checked)}>
        <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{label}</span>
        <div className={clsx(
            "w-8 h-4 rounded-full relative transition-colors duration-300",
            checked ? `bg-${color || 'cyan'}-600` : "bg-gray-700"
        )}>
            <div className={clsx(
                "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300",
                checked ? "translate-x-4" : "translate-x-0"
            )} />
        </div>
    </div>
);
