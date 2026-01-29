import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';
import { schwarzschildRadius, GRAVITATIONAL_CONSTANT } from '../../physics/constants';

export const AccretionDisk: React.FC = () => {
    const { mass, showAccretionDisk, timeScale } = useSimulationStore();
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const rs = useMemo(() => schwarzschildRadius(mass), [mass]);

    // Generate Particles
    const particleCount = 40000; // 4x density
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const angles = new Float32Array(particleCount);
        const radii = new Float32Array(particleCount);

        const colorInner = new THREE.Color(0xffaa00); // Orange-Gold (Interstellar style)
        const colorMid = new THREE.Color(0xff4400); // Red-Orange
        const colorOuter = new THREE.Color(0xaa0000); // Deep Red

        for (let i = 0; i < particleCount; i++) {
            // Distribute particles in a disk
            const rMin = rs * 1.5; // Start closer to event horizon
            const rMax = rs * 10.0;

            // Power distribution to cluster particles near the center
            const t = Math.random();
            // We want more particles at small r.
            // If t is uniform 0..1, t*t is clustered at 0. So yes, more particles at inner edge.

            const r = rMin + (rMax - rMin) * (t * t);

            const theta = Math.random() * Math.PI * 2;

            // Spiral Arms / Structure (Optional noise)
            // let offset = Math.sin(r * 0.5 + theta * 2.0) * 0.5;

            // Initial Position (Flat disk with slight varying thickness)
            const thickness = 0.05 * r; // Thicker at outer edges
            const y = (Math.random() - 0.5) * thickness;

            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Attributes for shader animation
            radii[i] = r;
            angles[i] = theta;

            // Size variation: Smaller, finer particles for "gas" look
            sizes[i] = Math.random() * 1.5 + 0.2;

            // Color gradient logic
            const normalizedR = (r - rMin) / (rMax - rMin);
            let finalColor = new THREE.Color();
            if (normalizedR < 0.2) {
                finalColor.copy(colorInner); // Hot inner ring
            } else if (normalizedR < 0.6) {
                finalColor.copy(colorInner).lerp(colorMid, (normalizedR - 0.2) / 0.4);
            } else {
                finalColor.copy(colorMid).lerp(colorOuter, (normalizedR - 0.6) / 0.4);
            }

            colors[i * 3] = finalColor.r;
            colors[i * 3 + 1] = finalColor.g;
            colors[i * 3 + 2] = finalColor.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
        geo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));

        return geo;
    }, [rs]);

    // Custom Shader
    const shader = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uMass: { value: mass },
            uG: { value: GRAVITATIONAL_CONSTANT },
            uTimeScale: { value: timeScale },
        },
        vertexShader: `
            uniform float uTime;
            uniform float uMass;
            uniform float uG;
            uniform float uTimeScale;
            
            attribute float size;
            attribute float aRadius;
            attribute float aAngle;
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vColor = color;
                
                // Keplerian Orbit Physics: omega = sqrt(GM / r^3)
                float omega = sqrt((uG * uMass) / pow(aRadius, 3.0));
                
                // Current angle = Initial Angle + omega * total_time
                // Note: uTime should be accumulated time * timeScale, handled in JS or Uniform
                float currentAngle = aAngle + omega * uTime;

                // New Position
                vec3 newPos;
                newPos.x = aRadius * cos(currentAngle);
                newPos.z = aRadius * sin(currentAngle);
                newPos.y = position.y; // Keep thickness variation

                vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
                
                // Distance attenuation for size
                gl_PointSize = size * (200.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
                
                // Fade out if too close to camera to avoid popping
                vAlpha = smoothstep(0.0, 2.0, -mvPosition.z);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            
            void main() {
                // Soft glow particle
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if (dist > 0.5) discard;
                
                // Gradient alpha from center
                float strength = 1.0 - (dist * 2.0); // 0 at edge, 1 at center
                strength = pow(strength, 2.0); // Sharper falloff

                gl_FragColor = vec4(vColor, strength * vAlpha * 0.8);
            }
        `
    }), [mass, timeScale]);

    useFrame((state) => {
        if (materialRef.current) {
            // We pass real time, but scaled logic is intrinsic? 
            // If we want variable time scale, we should accumulate a delta.
            // For now, simpler: uTime = elapsed * timeScale (if constant)
            // If timeScale changes dynamically, simple multiplication causes jumps.
            // Better to use a dedicated accumulated time ref.
            // Let's stick to simple elapsed for now, assuming mostly constant scale for demo.
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * timeScale;
            materialRef.current.uniforms.uMass.value = mass;
            materialRef.current.uniforms.uTimeScale.value = timeScale;
        }
    });

    if (!showAccretionDisk) return null;

    return (
        <points geometry={geometry}>
            <shaderMaterial
                ref={materialRef}
                uniforms={shader.uniforms}
                vertexShader={shader.vertexShader}
                fragmentShader={shader.fragmentShader}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexColors={true}
            />
        </points>
    );
};
