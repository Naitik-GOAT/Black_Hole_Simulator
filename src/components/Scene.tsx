import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BlackHole } from './BlackHole/BlackHole';
import { AccretionDisk } from './BlackHole/AccretionDisk';
import { SpaceObject } from './SpaceObject';
import { useSimulationStore } from '../store/simulationStore';

export const Scene: React.FC = () => {
    return (
        <div className="w-full h-screen bg-black">
            {/* High performance standard: dpr restricted for heavy shaders if needed. */}
            <Canvas
                camera={{ position: [0, 2, 14], fov: 60 }} // Closer and wider FOV for immersion
                dpr={[1, 2]}
                gl={{ antialias: true, toneMapping: 0 }} // No tone mapping for raw colors
            >
                <color attach="background" args={['#050505']} />

                <Suspense fallback={null}>
                    {/* Minimal lighting (Space is dark) */}
                    <ambientLight intensity={0.1} />

                    {/* Background Stars */}
                    <Stars radius={300} depth={50} count={7000} factor={4} saturation={0} fade speed={0.5} />

                    {/* Core Systems */}
                    <BlackHole />
                    <AccretionDisk />
                    <ObjectManager />

                    <EffectComposer>
                        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
                    </EffectComposer>

                    <OrbitControls makeDefault enablePan={true} enableZoom={true} maxDistance={200} minDistance={1.5} />
                </Suspense>
            </Canvas>
        </div>
    );
};

const ObjectManager = () => {
    const objects = useSimulationStore(state => state.objects);
    return (
        <>
            {objects.map(obj => (
                <SpaceObject key={obj.id} data={obj} />
            ))}
        </>
    );
}
