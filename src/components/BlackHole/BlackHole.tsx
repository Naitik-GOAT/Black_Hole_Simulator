import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';
import { schwarzschildRadius } from '../../physics/constants';
import { LensingShader } from './LensingShader';

export const BlackHole: React.FC = () => {
    // We use 'any' cast for material ref because ShaderMaterial structure is dynamic in TS
    const meshRef = useRef<THREE.Mesh>(null);
    const { mass, showEventHorizon, enableLensing } = useSimulationStore();

    // Calculate Schwarzschild radius
    const rs = useMemo(() => schwarzschildRadius(mass), [mass]);

    // Create shader material
    const material = useMemo(() => {
        const mat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(LensingShader.uniforms),
            vertexShader: LensingShader.vertexShader,
            fragmentShader: LensingShader.fragmentShader,
            side: THREE.FrontSide,
            transparent: true,
            blending: THREE.AdditiveBlending, // Just for the glow effect for now
            depthWrite: false,
        });
        return mat;
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial;
            mat.uniforms.uTime.value = state.clock.elapsedTime;
            mat.uniforms.uMass.value = mass;
            mat.uniforms.uCamPos.value = state.camera.position;
        }
    });

    return (
        <group>
            {/* Event Horizon: The point of no return. Pure black. */}
            {showEventHorizon && (
                <mesh>
                    <sphereGeometry args={[rs, 64, 64]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>
            )}

            {/* Accretion Disk Placeholder (Will be separate component) */}

            {/* Lensing / Photon Sphere Effect */}
            {enableLensing && (
                <mesh ref={meshRef}>
                    {/* Render a sphere slightly larger than Rs to show the warping effect */}
                    <sphereGeometry args={[rs * 1.5, 64, 64]} />
                    <primitive object={material} attach="material" />
                </mesh>
            )}
        </group>
    );
};
