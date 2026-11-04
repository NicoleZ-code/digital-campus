/**
 * @file FacadeBand.jsx
 * @description 幕墙组件：基于程序化参数批量渲染窗格与框架。
 */

import React, { useMemo } from 'react';
import BatchBoxes from '../primitives/BatchBoxes.jsx';
import { createFacade } from '../config/architecture.js';

/**
 * 幕墙组件：调用 createFacade 程序化生成窗格与框架数据并批量渲染。
 * @param {number} width - 幕墙宽度（x 横向）
 * @param {number} depth - 幕墙深度（z 纵深）
 * @param {number} [height=0.8] - 幕墙带高度（y 轴）
 * @param {number} [seed=0] - 随机种子（通常传楼层号，使各层窗格布局略有差异）
 */
export default function FacadeBand({ width, depth, height = 0.8, seed = 0 }) {
  // panes 为玻璃窗格数组、frames 为金属框架数组，元素均为 BatchBoxes 的 item（position/size/color）。
  const { frames, panes } = useMemo(
    () => createFacade(width, depth, height, seed),
    [width, depth, height, seed],
  );
  return (
    <group name="curtain-wall">
      {/* 玻璃窗格：高金属度、低粗糙度，模拟镜面玻璃 */}
      <BatchBoxes
        items={panes}
        roughness={0.19}
        metalness={0.65}
      />
      {/* 金属框架 */}
      <BatchBoxes
        items={frames}
        metalness={0.7}
        roughness={0.33}
      />
    </group>
  );
}
