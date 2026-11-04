/**
 * @file useSceneOptions.js
 * @description 管理三维场景展示选项（图层模式、标签显隐、自动旋转、视角重置）的 Hook。
 */

import { useState, useCallback } from 'react';

/**
 * 管理三维场景展示选项的 Hook。
 * @returns {object} 场景选项集合
 * @returns {object} returns.options - 展示选项状态
 * @returns {('normal'|'energy')} returns.options.layer - 图层模式：普通 / 能耗
 * @returns {boolean} returns.options.labels - 是否显示场景标签
 * @returns {boolean} returns.options.autoRotate - 是否开启自动旋转
 * @returns {number} returns.options.revision - 视角重置版本号，自增一次触发一次视角重置
 * @returns {() => void} returns.resetView - 触发一次相机视角重置
 * @returns {() => void} returns.resetOptions - 将所有展示选项恢复默认值并重置视角
 * @returns {() => void} returns.toggleLayer - 切换普通/能耗图层
 * @returns {() => void} returns.toggleLabels - 切换标签显隐
 * @returns {() => void} returns.toggleRotate - 切换自动旋转
 */
export default function useSceneOptions() {
  // 图层模式：normal 普通视图，energy 能耗视图
  const [layer, setLayer] = useState('normal');
  // 是否显示场景中的文字标签
  const [labels, setLabels] = useState(true);
  // 是否开启相机自动旋转
  const [autoRotate, setAutoRotate] = useState(false);
  // 视角重置版本号：自增即触发场景重置相机
  const [revision, setRevision] = useState(0);
  /** 触发一次视角重置（revision 自增）。 */
  const resetView = useCallback(() => setRevision((value) => value + 1), []);

  /** 将图层、自动旋转恢复默认并重置视角。 */
  function resetOptions() {
    setLayer('normal');
    setAutoRotate(false);
    resetView();
  }

  return {
    options: { layer, labels, autoRotate, revision },
    resetView,
    resetOptions,
    // 在普通与能耗图层之间切换
    toggleLayer: () => setLayer((value) => (value === 'energy' ? 'normal' : 'energy')),
    toggleLabels: () => setLabels((value) => !value),
    toggleRotate: () => setAutoRotate((value) => !value),
  };
}
