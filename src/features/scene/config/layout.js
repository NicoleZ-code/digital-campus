/**
 * @file layout.js
 * @description 场景布局计算：楼层标高换算、炸楼模式下的楼层/房间位移，以及道路与树木坐标。
 */

import { FLOOR_HEIGHT } from './architecture.js';

/**
 * 返回楼层对应的场景标高（y 高度，单位：场景单位）。
 * @param {number} floor - 楼层索引，从 0 开始（0 为底层）。
 * @returns {number} 该楼层底面在场景中的 y 高度。
 */
export function getFloorElevation(floor) {
  return floor * FLOOR_HEIGHT;
}

/**
 * 计算炸楼状态下指定楼层的水平与垂直位置。
 * @param {number} index - 楼层索引，从 1 开始。
 * @param {boolean} expanded - 是否处于炸楼展开状态。
 * @param {boolean} selected - 是否为当前选中楼层。
 * @returns {{x: number, y: number}} - 返回楼层的水平 (x) 和垂直 (y) 坐标。
 */
export function getFloorPosition(index, expanded, selected) {
  return {
    x: expanded && !selected ? -17 : 0,
    // 抽离只改变横向位置，保留楼层在建筑中的标高。
    y: getFloorElevation(index),
  };
}

/**
 * 园区道路矩形列表，每项格式为 [中心x, 中心z, 宽(沿x), 深(沿z)]。
 * x 为横向、z 为纵深（正南或正北向，取决于朝向约定），y 高度固定为 0 贴地。
 * 共 5 条道路：左右两条纵向路、三条横向路（含园区中部横路）。
 */
export const roads = [
  [-14, 0, 2, 28],
  [14, 0, 2, 28],
  [0, -11, 28, 2],
  [0, 12, 28, 2],
  [0, 1, 26, 2],
];

/**
 * 树木位置列表，每项为 [x, z] 平面坐标（贴地，y 高度为 0）。
 * 生成规律：沿园区上下边界（z = ±14）横向等距排列，
 * 左右边界（x = ±17）以 0.78 压缩系数纵向排列，
 * 以及中部两条绿化带（z = 4 与 z = 9，仅 x < 0 半幅）。
 */
export const treePositions = [];
for (let i = -16; i <= 16; i += 1.7) {
  treePositions.push([i, -14], [i, 14], [-17, i * 0.78], [17, i * 0.78]);
}
for (let i = -10; i < 0; i += 1.7) {
  treePositions.push([i, 4], [i, 9]);
}
