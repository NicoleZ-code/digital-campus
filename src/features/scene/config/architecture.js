/**
 * @file architecture.js
 * @description 建筑参数与程序化立面生成：按尺寸和种子产出可重复的幕墙窗格与框架数据。
 */

/** 建筑物单层楼高度（单位：场景单位，作为楼层标高的换算基数）。 */
export const FLOOR_HEIGHT = 0.8;

/**
 * 按建筑尺寸与随机种子程序化生成幕墙立面数据。
 * 在前后、左右四个立面上按约 0.45 的模数排列竖向框架与玻璃面板，
 * 并在 34%、68% 高度处各加一圈横向腰线，顶部加出挑的檐口压顶。
 * @param {number} width - 建筑沿 x 轴的宽度（场景单位）。
 * @param {number} depth - 建筑沿 z 轴的进深（场景单位）。
 * @param {number} height - 建筑总高度，即沿 y 轴高度（场景单位）。
 * @param {number} [seed=0] - 颜色种子，同尺寸下同种子可生成可重复的立面配色。
 * @returns {{frames: Array, panes: Array}} frames 为框架（竖梃/腰线/压顶）元素列表，
 * panes 为玻璃面板元素列表；每项含 position 三维坐标 [x, y, z]、
 * size 尺寸 [宽, 高, 深]（宽 x、高 y、深 z）与 color 颜色。
 */
export function createFacade(width, depth, height, seed = 0) {
  const frames = [],
    panes = [];
  // add() 函数用于将立面元素添加到列表中。
  const add = (list, position, size, color) => list.push({ position, size, color });
  // 立面元素的颜色调色板，便于生成不同的立面风格。
  const palette = ['#244f60', '#306a78', '#3f7785', '#225366', '#568b93', '#285464'];
  // face 取 -1 / +1，分别处理建筑在 x、z 两个方向上的对侧立面。
  for (const face of [-1, 1]) {
    // 前/后立面（沿 x 轴展开）：按 0.45 模数计算竖向框架列数。
    const columns = Math.round(width / 0.45);
    for (let i = 0; i <= columns; i++) {
      const x = -width / 2 + (i * width) / columns;
      // 竖梃：整楼高的细高框架，z 向略突出立面。
      add(frames, [x, height / 2, face * (depth / 2 + 0.015)], [0.026, height, 0.045], '#87aeb6');
      // 相邻竖梃之间填入玻璃面板，颜色由列号与种子决定。
      if (i < columns) {
        add(
          panes,
          [x + width / columns / 2, height / 2, (face * depth) / 2],
          [width / columns - 0.035, height - 0.08, 0.035],
          palette[(i * 7 + seed) % palette.length],
        );
      }
    }
    // 左/右立面（沿 z 轴展开）：同理按 0.45 模数计算行数。
    const rows = Math.round(depth / 0.45);
    for (let i = 0; i <= rows; i++) {
      const z = -depth / 2 + (i * depth) / rows;
      add(frames, [face * (width / 2 + 0.015), height / 2, z], [0.045, height, 0.026], '#87aeb6');
      if (i < rows) {
        add(
          panes,
          [(face * width) / 2, height / 2, z + depth / rows / 2],
          [0.035, height - 0.08, depth / rows - 0.035],
          palette[(i * 3 + seed + 1) % palette.length],
        );
      }
    }
    // 在 34% 与 68% 高度处沿前后、左右立面各加一圈横向腰线。
    for (const ratio of [0.34, 0.68]) {
      const y = height * ratio;
      add(frames, [0, y, face * (depth / 2 + 0.025)], [width, 0.026, 0.055], '#9bbec2');
      add(frames, [face * (width / 2 + 0.025), y, 0], [0.055, 0.026, depth], '#9bbec2');
    }
  }
  // 顶部檐口压顶：沿 x/z 略出挑的水平盖板。
  add(frames, [0, height, 0], [width + 0.08, 0.055, depth + 0.08], '#afc9cc');
  return { frames, panes };
}
