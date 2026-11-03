export function getFloorPosition(index, totalFloors, expanded, selected) {
  return {
    x: expanded && !selected ? -17 : 0,
    y: expanded ? (selected ? 2 : index * 0.95 + (index > totalFloors / 2 ? 2 : 0)) : index * 0.8,
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
