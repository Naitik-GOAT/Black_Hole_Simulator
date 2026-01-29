import * as THREE from 'three';

export const LensingShader = {
  uniforms: {
    uTime: { value: 0 },
    uMass: { value: 10.0 },
    uCamPos: { value: new THREE.Vector3() },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uMass;
    uniform vec3 uCamPos;
    
    varying vec3 vNormal;
    varying vec3 vWorldPos;

    // --- Noise Functions for Stars/Nebula ---
    float hash(float n) { return fract(sin(n) * 1e4); }
    float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

    float noise(vec3 x) {
        const vec3 step = vec3(110, 241, 171);
        vec3 i = floor(x);
        vec3 f = fract(x);
        float n = dot(i, step);
        vec3 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                       mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
                   mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                       mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
    }
    
    // Simple 3D FBM for nebula/stars
    float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100);
        for (int i = 0; i < 3; ++i) {
            v += a * noise(p);
            p = p * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    // Procedural Starfield Color
    vec3 getStarfield(vec3 dir) {
        // Nebula
        float neb = fbm(dir * 2.0);
        vec3 col = mix(vec3(0.0), vec3(0.1, 0.0, 0.2), neb);
        
        // Stars
        float s = hash(dir.xy * 100.0 + dir.z * 50.0);
        if (s > 0.99) {
            col += vec3(1.0);
        }
        return col;
    }

    void main() {
        // Calculate Ray Direction from Camera
        vec3 viewDir = normalize(vWorldPos - uCamPos);
        
        // --- GRAVITATIONAL LENSING ---
        // Basic approximation: 
        // We assume the black hole is at (0,0,0).
        // We calculate the angle between the view direction and the vector to center (-uCamPos).
        
        vec3 bhDir = normalize(vec3(0.0) - uCamPos);
        float dotProd = dot(viewDir, bhDir);
        
        // "Impact Parameter" approximation via angle
        // As dotProd approaches 1.0 (looking at BH), calculate distortion.
        // Or simpler: Calculate distance of ray to origin.
        // Ray: P(t) = CamPos + t * ViewDir
        // Closest point to origin is when (P-Origin) . ViewDir = 0
        // (CamPos + t*ViewDir) . ViewDir = 0 => CamPos.ViewDir + t = 0 => t = -dot(CamPos, ViewDir)
        float t = -dot(uCamPos, viewDir);
        vec3 closestPoint = uCamPos + t * viewDir;
        float distToCenter = length(closestPoint);
        
        // Schwarzschild Radius Rs = 2 * G * M / c^2. 
        // In our scaled units (G=1, c=10 => Rs = 2*M/100 = M/50).
        // Wait, constants.ts: G=1, c=10 => Rs = 2*1*M / 100 = 0.02 * M.
        // Let's use the uniform uMass directly or a scaled factor.
        // Actually, let's just tune it visually.
        
        float rs = 0.02 * uMass; // Consistent with constants.ts GRAVITATIONAL_CONSTANT=1, LIGHT_SPEED=10
        
        // EVENT HORIZON (Black Shadow)
        if (distToCenter < rs * 1.0) { // Slightly smaller visual event horizon for sharp edge
             gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
             return;
        }

        // PHOTON RING (Bright Ring at ~1.5 Rs)
        // Intensity peaks at 1.5 Rs and falls off
        float photonRing = 0.0;
        float prRadius = rs * 1.5;
        if (distToCenter > rs && distToCenter < rs * 3.0) {
             float d = abs(distToCenter - prRadius);
             photonRing = 1.0 / (d * 50.0 + 1.0); // Sharp peak
             photonRing *= 2.0; // Boost intensity
        }

        // --- DISTORTION ---
        // Deflection angle alpha approx 4GM / (c^2 * b) -> proportional to 1/distToCenter
        // We bend the lookup vector 'dir' towards the black hole.
        
        // Vector pointing from closest approach point to center (in plane perpendicular to view)
        // actually 'closestPoint' IS the vector from origin to the line (if origin is 0,0,0)
        // Wait, vector from line to center is -closestPoint.
        // So we want to bend 'viewDir' TOWARDS 'bhDir' (center).
        // Or simpler: We perturb the viewDir by adding a vector pointing to center.
        
        vec3 bendAxis = normalize(-closestPoint);
        float bendStrength = (rs * 5.0) / distToCenter; // Tune this factor
        
        vec3 warpedDir = normalize(viewDir + bendAxis * bendStrength * 0.5);
        
        // Sample Background with Warped Dir
        vec3 bg = getStarfield(warpedDir);
        
        // Add Photon Ring Glow
        vec3 finalColor = bg + vec3(1.0, 0.8, 0.6) * photonRing;
        
        // Alpha blending for the "Sphere" container
        // We want the sphere mesh itself to be invisible, only drawing the starfield+blackhole.
        // But we are rendering ON A SPHERE geometry.
        // We should fade out the effect at the edges of the sphere to blend with real scene?
        // Let's assume this shader REPLACES the background for the area it covers.
        // To make it blend, we can use fresnel alpha?
        // Or better: Just render it opaque. It acts as a "window" to the distorted universe.
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};
