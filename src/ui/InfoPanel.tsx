import React from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { GRAVITATIONAL_CONSTANT, LIGHT_SPEED_SQ, schwarzschildRadius, orbitalVelocity } from '../physics/constants';

export const InfoPanel: React.FC = () => {
    const { mass } = useSimulationStore();

    const rs = schwarzschildRadius(mass);
    // Example Calculation for display (at r = 2*Rs)
    const r_example = rs * 3;
    const v_orbit = orbitalVelocity(mass, r_example);

    return (
        <div className="absolute top-20 right-4 w-72 max-h-[80vh] overflow-y-auto bg-space-dark/80 backdrop-blur-md border border-cyan-900/50 p-5 rounded-lg text-cyan-100 font-mono shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all hover:bg-space-dark/95 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
            <h3 className="text-md font-bold text-cyan-400 mb-4 mt-0 uppercase tracking-wider flex items-center border-b border-cyan-500/30 pb-2">
                <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                TELEMETRY
            </h3>

            <div className="flex flex-col gap-6 text-xs">

                {/* Schwarzschild Radius */}
                <div className="bg-black/20 p-2 rounded">
                    <h4 className="text-[10px] text-gray-400 mb-1 tracking-widest">SCHWARZSCHILD RADIUS (Rs)</h4>
                    <p className="text-lg font-bold text-white">{rs.toFixed(2)} <span className="text-[10px] font-normal opacity-50">units</span></p>
                </div>

                {/* Orbital Physics */}
                <div className="bg-black/20 p-2 rounded">
                    <h4 className="text-[10px] text-gray-400 mb-1 tracking-widest">ORBIT VELOCITY (at 3Rs)</h4>
                    <p className="text-lg font-bold text-white">{v_orbit.toFixed(2)} <span className="text-[10px] font-normal opacity-50">u/s</span></p>
                </div>

                {/* Constants */}
                <div className="bg-black/20 p-2 rounded">
                    <h4 className="text-[10px] text-gray-400 mb-1 tracking-widest">CONSTANTS</h4>
                    <div className="space-y-1 opacity-60 font-mono text-[10px]">
                        <p>G = {GRAVITATIONAL_CONSTANT}.0</p>
                        <p>c = {Math.sqrt(LIGHT_SPEED_SQ)}.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
