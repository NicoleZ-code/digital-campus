/**
 * @file SceneControls.jsx
 * @description 场景控制工具条，提供图层切换、标签显隐、自动旋转、视角重置与模型导出入口。
 */

import React from 'react';
import {
  ArrowUpRight,
  ArrowLeft,
  Layers,
  RotateCcw,
  Orbit,
  Eye,
  EyeOff,
  ChevronDown,
  LocateFixed,
  Download,
} from 'lucide-react';

/**
 * 场景控制工具条：图层切换、标签显隐、自动环绕、视角重置、层级返回与模型导出
 * @param {number} level - 当前空间层级索引 0-4
 * @param {object} options - 场景开关状态 { layer: 'standard'|'energy', labels: boolean, autoRotate: boolean }
 * @param {boolean} exportBusy - 是否正在导出 GLB（导出期间禁用导出按钮）
 * @param {() => void} onExport - 请求导出当前场景 GLB 的回调
 * @param {(level: number) => void} onNavigate - 层级跳转回调（返回上一级时传 level - 1）
 * @param {() => void} onReset - 重置回园区总览的回调
 * @param {() => void} onAdvance - 主按钮：进入下一层级的回调
 * @param {() => void} onResetView - 重置当前层级相机视角的回调
 * @param {() => void} onToggleLayer - 切换标准 / 能耗图层的回调
 * @param {() => void} onToggleLabels - 切换空间标签显隐的回调
 * @param {() => void} onToggleRotate - 切换自动环绕旋转的回调
 * @param {object} view - 当前层级的展示文案 { caption, primaryLabel }
 * @returns {JSX.Element} 场景控制相关 UI 集合
 */
export default function SceneControls({
  level,
  options,
  exportBusy,
  onExport: requestExport,
  onNavigate: go,
  onReset: reset,
  onAdvance: advance,
  onResetView: resetView,
  onToggleLayer,
  onToggleLabels,
  onToggleRotate,
  view,
}) {
  const { layer, labels, autoRotate } = options;

  return (
    <>
      {/* 右侧竖排视角工具：导出 / 标签 / 环绕 / 复位 */}
      <div className="view-tools">
        <button
          disabled={exportBusy}
          onClick={requestExport}
          title={exportBusy ? '正在导出…' : '导出当前场景 GLB'}
          aria-label="导出当前场景 GLB"
        >
          <Download size={18} />
        </button>
        <button
          className={labels ? 'active' : ''}
          onClick={onToggleLabels}
          title="显示或隐藏空间标签"
        >
          {labels ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button
          className={autoRotate ? 'active' : ''}
          onClick={onToggleRotate}
          title="自动环绕"
        >
          <Orbit size={18} />
        </button>
        <button
          onClick={resetView}
          title="重置当前视角"
        >
          <LocateFixed size={18} />
        </button>
      </div>
      <div className="scene-caption">
        <span className="crosshair">＋</span>
        <span>{view.caption}</span>
        <small>{level === 0 ? 'SCHEMATIC CITY MAP' : 'DIGITAL TWIN / LIVE VIEW'}</small>
      </div>
      <div className="bottom-controls">
        <button
          className="back"
          disabled={level === 0}
          onClick={() => go(level - 1)}
          title="返回上一级"
        >
          <ArrowLeft size={17} />
        </button>
        <button
          onClick={reset}
          title="返回园区总览"
        >
          <RotateCcw size={16} />
        </button>
        <span className="controls-divider" />
        <span className="mouse-hint">拖动旋转 · 滚轮缩放</span>
        <button
          className={`layer-button ${layer === 'energy' ? 'active' : ''}`}
          onClick={onToggleLayer}
        >
          <Layers size={15} />
          {layer === 'energy' ? '能耗图层' : '标准图层'}
          <ChevronDown size={13} />
        </button>
        <button
          className="primary"
          onClick={advance}
        >
          {view.primaryLabel}
          <ArrowUpRight size={17} />
        </button>
      </div>
      {layer === 'energy' && (
        <div className="heat-legend">
          {/* 能耗图层开启时展示的热力图例 */}
          <span>模拟能耗</span>
          <i />
          <span>低 → 高</span>
        </div>
      )}
    </>
  );
}
