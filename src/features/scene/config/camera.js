export const canvasCamera = { position: [36, 31, 40], fov: 40, near: 0.1, far: 250 };

const presets = [
  { position: [30, 34, 38], target: [0, 0, 0] },
  { position: [36, 31, 40], target: [0, 1, 0] },
  { position: [22, 16, 27], target: [0, 4, 0] },
  { position: [15, 16, 20], target: [0, 2, 0] },
];

export function getCameraPreset(level, roomPosition) {
  if (level < 4) return presets[level];
  return {
    position: [roomPosition[0] + 7, 10, roomPosition[1] + 10],
    target: [roomPosition[0], 2, roomPosition[1]],
  };
}
