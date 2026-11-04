import { FLOOR_HEIGHT } from './architecture.js';

export function getFloorElevation(floor) {
  return floor * FLOOR_HEIGHT;
}

export function getFloorPosition(index, expanded, selected) {
  return {
    x: expanded && !selected ? -17 : 0,
    // 抽离只改变横向位置，保留楼层在建筑中的标高。
    y: getFloorElevation(index),
  };
}

export const roads = [
  [-14, 0, 2, 28],
  [14, 0, 2, 28],
  [0, -11, 28, 2],
  [0, 12, 28, 2],
  [0, 1, 26, 2],
];

export const treePositions = [];
for (let i = -16; i <= 16; i += 1.7)
  treePositions.push([i, -14], [i, 14], [-17, i * 0.78], [17, i * 0.78]);
for (let i = -10; i < 0; i += 1.7) treePositions.push([i, 4], [i, 9]);
