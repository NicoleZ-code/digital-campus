/**
 * @file traffic.js
 * @description 园区车辆轨迹配置：定义环形路线曲线并计算车辆随时间变化的循环位置。
 */

import { CatmullRomCurve3, Vector3 } from 'three';

/**
 * 园区车辆环形路线（Catmull-Rom 三维曲线）。
 * 路径点为 [x, y, z] 坐标：x 横向、y 高度（固定 0.18，即路面高度）、z 纵深。
 * 闭合曲线，使用向心参数化避免自交与过度弯曲。
 * @type {CatmullRomCurve3}
 */
export const trafficRoute = new CatmullRomCurve3(
  [
    [-12.9, 0.18, 10.2],
    [-11.2, 0.18, 11.65],
    [11.3, 0.18, 11.65],
    [13.6, 0.18, 10.1],
    [13.6, 0.18, -9.4],
    [11.5, 0.18, -10.8],
    [-11.7, 0.18, -10.8],
    [-13.8, 0.18, -9.2],
    [-13.8, 0.18, 8.7],
  ].map((p) => new Vector3(...p)),
  true, // 闭合曲线
  'centripetal', // 使用向心 Catmull-Rom 曲线以避免自交和过度弯曲
);

/**
 * 根据运行时间与相位偏移量计算车辆沿路线的循环进度。
 * 车速恒定：每秒前进 0.018（约 55 秒一圈）；偏移量用于多车错开位置。
 * 结果经双重取模保证落在 [0, 1) 区间，负数时间也安全。
 * @param {number} seconds - 场景运行时间（单位：秒）。
 * @param {number} offset - 车辆相位偏移量（0~100 对应 0%~100% 的路线位置）。
 * @returns {number} 归一化进度 t ∈ [0, 1)，可直接传入 trafficRoute.getPointAt(t)。
 */
export function trafficProgress(seconds, offset) {
  return (((seconds * 0.018 + offset / 100) % 1) + 1) % 1;
}
