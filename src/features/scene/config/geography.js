export const MAP_CENTER = [121.5, 31.25];
export function projectShanghai([longitude, latitude]) {
  return [
    (longitude - MAP_CENTER[0]) * 25 * Math.cos((MAP_CENTER[1] * Math.PI) / 180),
    (latitude - MAP_CENTER[1]) * 25,
  ];
}
export const huangpuRiver = [
  [121.49, 31.4],
  [121.51, 31.34],
  [121.53, 31.29],
  [121.51, 31.25],
  [121.49, 31.235],
  [121.5, 31.21],
  [121.48, 31.18],
  [121.45, 31.15],
  [121.44, 31.1],
  [121.4, 31.04],
  [121.35, 31.02],
].map(projectShanghai);
export const parkCoordinate = [121.4737, 31.2304];
