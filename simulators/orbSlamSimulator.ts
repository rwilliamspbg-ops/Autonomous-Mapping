export interface TelemetryData {
  pose: number[];
  keyframes: number;
  voxels: number;
  stability: number;
}

export interface FeaturePoint {
  x: number;
  y: number;
  life: number;
  color: string;
}

export const startOrbSlamSimulation = (onUpdate: (data: any) => void) => {
  let keyframes = 42;
  let voxels = 12400;

  const interval = setInterval(() => {
    onUpdate({
      tracking: true,
      pose: [Math.sin(Date.now() / 800) * 0.02, Math.cos(Date.now() / 900) * 0.02, 0.15],
      keyframes: keyframes += (Math.random() > 0.9 ? 1 : 0),
      voxels: voxels += Math.floor(Math.random() * 50),
      points: Array.from({ length: 20 }).map(() => ({
        x: Math.random(),
        y: Math.random(),
        life: Math.random()
      }))
    });
  }, 100);

  return () => clearInterval(interval);
};

export const generateFeaturePoints = (width: number, height: number): FeaturePoint[] => {
  return Array.from({ length: 20 }).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    life: Math.random(),
    color: Math.random() > 0.5 ? '#3b82f6' : '#10b981'
  }));
};

export const updateTelemetry = (prev: TelemetryData): TelemetryData => {
  return {
    pose: [Math.sin(Date.now() / 800) * 0.02, Math.cos(Date.now() / 900) * 0.02, 0.15],
    keyframes: prev.keyframes + (Math.random() > 0.9 ? 1 : 0),
    voxels: prev.voxels + Math.floor(Math.random() * 50),
    stability: 98 + Math.random() * 2
  };
};
