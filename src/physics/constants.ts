// Physical constants
// We use scaled units for visual demonstration purposes.
// Real values would be too extreme for standard float precision in shaders and rendering.

export const GRAVITATIONAL_CONSTANT = 1.0; // G
export const LIGHT_SPEED = 10.0; // c (Reduced so relativistic effects are visible)
export const LIGHT_SPEED_SQ = LIGHT_SPEED * LIGHT_SPEED;

// Calculation helpers
export const schwarzschildRadius = (mass: number): number => {
  return (2 * GRAVITATIONAL_CONSTANT * mass) / LIGHT_SPEED_SQ;
};

export const orbitalVelocity = (mass: number, radius: number): number => {
  return Math.sqrt((GRAVITATIONAL_CONSTANT * mass) / radius);
};

export const timeDilationFactor = (mass: number, radius: number): number => {
  const rs = schwarzschildRadius(mass);
  if (radius <= rs) return 0;
  return Math.sqrt(1 - rs / radius);
};
