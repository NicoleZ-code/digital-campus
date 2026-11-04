// 按楼栋和楼层分配独立的演示平面；房间 ID、用途及告警索引保持稳定。
const slots = [
  [-4.1, -1.7],
  [0, -1.7],
  [4.1, -1.7],
  [-4.1, 1.7],
  [0, 1.7],
  [4.1, 1.7],
];

export function getRoomPosition(buildingId, floor, roomIndex) {
  const buildingOffset = { 'b-a': 0, 'b-b': 2, 'b-c': 4 }[buildingId] ?? 0;
  const shift = (floor - 1 + buildingOffset) % slots.length;
  const direction = Math.floor((floor - 1) / slots.length) % 2 === 0 ? 1 : -1;
  const slotIndex = (shift + direction * roomIndex + slots.length) % slots.length;
  return [...slots[slotIndex]];
}
