/**
 * @file camera.js
 * @description 相机预设配置，按导航层级计算相机位置与观察目标。
 */

import { getFloorElevation } from './layout.js';

/**
 * 场景画布（R3F Canvas）初始相机参数。
 * position 相机初始位置 [x, y, z]（x 横向、y 高度、z 纵深，单位：场景单位）；
 * fov 视场角（度）；near/far 近/远裁剪面距离。
 * @type {{position: number[], fov: number, near: number, far: number}}
 * @example
 * // 创建 Three.js 相机
 * const camera = new THREE.PerspectiveCamera(
 *   canvasCamera.fov,
 *   canvasWidth / canvasHeight,
 *   canvasCamera.near,
 *   canvasCamera.far
 * );
 * camera.position.set(...canvasCamera.position);
 */
export const canvasCamera = {
  position: [36, 31, 40],
  fov: 40,
  near: 0.1,
  far: 250,
};

/**
 * 相机预设机位列表，与导航层级 0~2 一一对应。
 * position 为相机位置 [x, y, z]，target 为观察目标点 [x, y, z]（单位：场景单位）。
 * 层级 0：城市俯瞰；层级 1：园区全景；层级 2：建筑近景。
 */
const presets = [
  { position: [24, 28, 31], target: [0, 0, 0] },
  { position: [36, 31, 40], target: [0, 1, 0] },
  { position: [22, 16, 27], target: [0, 4, 0] },
];

/**
 * 根据导航层级、房间坐标和楼层索引计算相机位置与观察目标。
 * 层级 0~2 直接取预设机位；层级 3 以楼层标高为观察中心；
 * 层级 4 以选中房间为观察中心，相机在其东南上方斜视。
 * @param {number} level - 导航层级（0 城市 / 1 园区 / 2 建筑 / 3 楼层 / 4 房间）。
 * @param {number[]} roomPosition - 选中房间的平面坐标 [x, z]，层级 4 生效。
 * @param {number} floor - 当前楼层索引，用于计算标高（层级 3/4 生效）。
 * @returns {{position: number[], target: number[]}} position 为相机位置 [x, y, z]，
 * target 为观察目标点 [x, y, z]，均为场景单位。
 */
export function getCameraPreset(level, roomPosition, floor) {
  if (level < 3) {
    return presets[level];
  }
  const elevation = getFloorElevation(floor);
  if (level === 3) {
    return { position: [15, elevation + 14, 20], target: [0, elevation, 0] };
  }
  return {
    position: [roomPosition[0] + 7, elevation + 8, roomPosition[1] + 10],
    target: [roomPosition[0], elevation, roomPosition[1]],
  };
}
