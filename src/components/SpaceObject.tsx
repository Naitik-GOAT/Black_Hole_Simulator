import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import type { SpaceObjectData } from '../store/simulationStore';
import { GRAVITATIONAL_CONSTANT, schwarzschildRadius } from '../physics/constants';

interface Props {
    data: SpaceObjectData;
}

export const SpaceObject: React.FC<Props> = ({ data }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { mass: blackHoleMass, timeScale, isPaused, removeObject } = useSimulationStore();

    // Local state for physics integration
    const position = useRef(new THREE.Vector3(...data.position));
    const velocity = useRef(new THREE.Vector3(...data.velocity));

    useFrame((_, delta) => {
        if (isPaused || !meshRef.current) return;

        const dt = delta * timeScale;
        const rVector = position.current.clone();
        const r = rVector.length();

        // Check Event Horizon Collision
        const rs = schwarzschildRadius(blackHoleMass);
        if (r < rs) {
            removeObject(data.id);
            return;
        }

        // Gravity: a = -GM / r^3 * r_vector
        const forceMagnitude = (GRAVITATIONAL_CONSTANT * blackHoleMass) / (r * r);
        const acceleration = rVector.normalize().multiplyScalar(-forceMagnitude);

        // Verlet Integration (Simplified to Euler for demo)
        velocity.current.add(acceleration.multiplyScalar(dt));
        position.current.add(velocity.current.clone().multiplyScalar(dt));

        // Update Mesh
        meshRef.current.position.copy(position.current);

        // Tidal Forces (Spaghettification) Visual
        // Stretch along the radial vector
        // Stretch factor increases as r decreases
        const stretchFactor = 1.0 + (rs * 5.0) / (r * r);
        meshRef.current.scale.set(1 / Math.sqrt(stretchFactor), 1 / Math.sqrt(stretchFactor), stretchFactor);
        meshRef.current.lookAt(0, 0, 0);
    });

    return (
        <Trail
            width={1.2} // Width of the line
            color={data.color} // Color of the line
            length={20} // Length of the line
            decay={1} // How fast the line fades away
            local={false} // Wether to use the target's world or local positions
            stride={0} // Min distance between points
            interval={1} // Number of frames to wait before next calculation
            target={meshRef} // Optional target. This object will produce the trail.
        >
            <mesh ref={meshRef} position={data.position}>
                <sphereGeometry args={[data.radius, 16, 16]} />
                <meshStandardMaterial color={data.color} roughness={0.4} metalness={0.6} emissive={data.color} emissiveIntensity={0.5} />
            </mesh>
        </Trail>
    );
};
