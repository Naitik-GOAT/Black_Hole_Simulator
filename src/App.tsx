import React from 'react';
import { Scene } from './components/Scene';
import { HUD } from './ui/HUD';

function App() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black text-white">
      <Scene />
      <HUD />

      {/* Temporary Overlay Title */}
      <div className="absolute top-6 left-8 pointer-events-none z-10 mix-blend-difference">
        <h1 className="text-4xl font-bold tracking-[0.2em] font-mono">SINGULARITY</h1>
        <p className="text-sm opacity-60 font-mono mt-1">SIMULATION V1.0</p>
      </div>

      {/* Placeholder for UI Controls */}
    </div>
  );
}

export default App;
