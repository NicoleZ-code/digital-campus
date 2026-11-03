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
          <span>模拟能耗</span>
          <i />
          <span>低 → 高</span>
        </div>
      )}
    </>
  );
}
