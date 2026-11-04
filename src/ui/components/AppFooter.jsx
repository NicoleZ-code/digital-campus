/**
 * @file AppFooter.jsx
 * @description 页面底部状态栏，展示当前空间层级、数据来源与系统运行状态。
 */

import React from 'react';

/**
 * 页面底部状态栏组件
 * @param {number} level - 当前空间层级索引 0-4，用于展示「0X / 05」进度
 * @returns {JSX.Element} 底部状态栏
 */
export default function AppFooter({ level }) {
  return (
    <footer>
      <span>
        空间资产 <b>/ 0{level + 1} / 05</b>
      </span>
      <span>程序化演示模型 · 上海区界源自 DataV</span>
      <span>
        <i /> SYSTEM ONLINE <b>HAIXU © 2026</b>
      </span>
    </footer>
  );
}
