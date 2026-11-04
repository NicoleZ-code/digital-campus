import { getFloorElevation } from './layout.js';

export const canvasCamera = { position: [36, 31, 40], fov: 40, near: 0.1, far: 250 };

const presets = [
  { position: [24, 28, 31], target: [0, 0, 0] },
  { position: [36, 31, 40], target: [0, 1, 0] },
  { position: [22, 16, 27], target: [0, 4, 0] },
];

export function getCameraPreset(level, roomPosition, floor) {
  if (level < 3) return presets[level];
  const elevation = getFloorElevation(floor);
  if (level === 3) {
    return { position: [15, elevation + 14, 20], target: [0, elevation, 0] };
  }
  return {
    position: [roomPosition[0] + 7, elevation + 8, roomPosition[1] + 10],
    target: [roomPosition[0], elevation, roomPosition[1]],
  };
}
