/**
 * @file StageNavigation.jsx
 * @description 阶段导航条，按「城市-园区-楼宇-楼层-房间」五个层级切换视角。
 */

import React from 'react';
// 五个层级的名称常量（城市 - 园区 - 楼宇 - 楼层 - 房间）
import { stageNames } from '../../domain/campus/constants.js';

/**
 * 阶段导航条组件：渲染五个层级按钮，点击切换视角
 * @param {number} level - 当前层级索引 0-4
 * @param {(level: number) => void} onNavigate - 层级跳转回调，参数为目标层级索引
 * @returns {JSX.Element} 阶段导航条
 */
export default function StageNavigation({ level, onNavigate: go }) {
  return (
    <div className="steps">
      {/* 当前层级高亮 active，已过层级标记 done，其余为待进入状态 */}
      {stageNames.map((name, i) => (
        <button
          key={name}
          className={level === i ? 'active' : i < level ? 'done' : ''}
          onClick={() => go(i)}
        >
          <span>0{i + 1}</span>
          {name}
          {i < 4 && <span className="step-line" />}
        </button>
      ))}
    </div>
  );
}
