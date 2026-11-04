/**
 * @file roomLayouts.js
 * @description 房间平面布局：按楼栋与楼层计算房间在三维空间中的稳定坐标。
 */

/**
 * 房间平面布局槽位：按楼栋和楼层分配独立的演示平面，每个元素为 [x, z] 平面偏移坐标；
 * 房间 ID、用途及告警索引保持稳定。
 */
const slots = [
  [-4.1, -1.7],
  [0, -1.7],
  [4.1, -1.7],
  [-4.1, 1.7],
  [0, 1.7],
  [4.1, 1.7],
];

/**
 * 根据楼宇、楼层和房间序号计算稳定的三维平面坐标。
 * 通过楼栋偏移 + 楼层轮转 + 方向翻转保证不同楼栋/楼层的布局互不重叠且可复现。
 * @param {string} buildingId - 楼宇 ID（'b-a' / 'b-b' / 'b-c'，未知 ID 偏移取 0）。
 * @param {number} floor - 楼层号（从 1 开始）。
 * @param {number} roomIndex - 房间序号（从 0 开始）。
 * @returns {Array<number>} 房间的 [x, z] 平面坐标。
 */
export function getRoomPosition(buildingId, floor, roomIndex) {
  const buildingOffset = { 'b-a': 0, 'b-b': 2, 'b-c': 4 }[buildingId] ?? 0;
  const shift = (floor - 1 + buildingOffset) % slots.length;
  const direction = Math.floor((floor - 1) / slots.length) % 2 === 0 ? 1 : -1;
  const slotIndex = (shift + direction * roomIndex + slots.length) % slots.length;
  return [...slots[slotIndex]];
}
