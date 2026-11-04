/**
 * @file geography.js
 * @description 地理坐标工具：将上海经纬度投影为场景平面坐标，内置黄浦江与公园点位数据。
 */

/**
 * 投影中心点经纬度 [经度, 纬度]，取上海市域中部，
 * 场景平面坐标以该点为原点（0, 0）。
 */
export const MAP_CENTER = [121.5, 31.25];

/**
 * 将上海地区经纬度投影为场景平面坐标（等距圆柱近似投影）。
 * 每差 1° 纬度约合 25 个场景单位；经度方向再乘以纬度余弦修正。
 * @param {number[]} coordinates - 经纬度坐标 [经度, 纬度]，单位：度。
 * @returns {number[]} 场景平面坐标 [x, z]，x 为东西向（东为正）、z 为南北向（北为正）。
 */
export function projectShanghai([longitude, latitude]) {
  return [
    (longitude - MAP_CENTER[0]) * 25 * Math.cos((MAP_CENTER[1] * Math.PI) / 180),
    (latitude - MAP_CENTER[1]) * 25,
  ];
}

/**
 * 黄浦江中心线采样点，原始数据为经纬度，经 projectShanghai
 * 投影后转为场景平面坐标 [x, z]，用于在城市场景中绘制江面走向。
 */
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

/** 公园（复兴公园一带）的经纬度坐标 [经度, 纬度]，未投影，按需经 projectShanghai 转换。 */
export const parkCoordinate = [121.4737, 31.2304];
