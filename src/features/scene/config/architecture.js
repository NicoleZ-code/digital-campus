export const FLOOR_HEIGHT = 0.8;
export function createFacade(width, depth, height, seed = 0) {
  const frames = [],
    panes = [];
  const add = (list, position, size, color) => list.push({ position, size, color });
  const palette = ['#244f60', '#306a78', '#3f7785', '#225366', '#568b93', '#285464'];
  for (const face of [-1, 1]) {
    const columns = Math.round(width / 0.45);
    for (let i = 0; i <= columns; i++) {
      const x = -width / 2 + (i * width) / columns;
      add(frames, [x, height / 2, face * (depth / 2 + 0.015)], [0.026, height, 0.045], '#87aeb6');
      if (i < columns)
        add(
          panes,
          [x + width / columns / 2, height / 2, (face * depth) / 2],
          [width / columns - 0.035, height - 0.08, 0.035],
          palette[(i * 7 + seed) % palette.length],
        );
    }
    const rows = Math.round(depth / 0.45);
    for (let i = 0; i <= rows; i++) {
      const z = -depth / 2 + (i * depth) / rows;
      add(frames, [face * (width / 2 + 0.015), height / 2, z], [0.045, height, 0.026], '#87aeb6');
      if (i < rows)
        add(
          panes,
          [(face * width) / 2, height / 2, z + depth / rows / 2],
          [0.035, height - 0.08, depth / rows - 0.035],
          palette[(i * 3 + seed + 1) % palette.length],
        );
    }
  }
  add(frames, [0, height, 0], [width + 0.08, 0.055, depth + 0.08], '#afc9cc');
  return { frames, panes };
}
