/**
 * @file AssetModal.jsx
 * @description 资产详情弹窗，展示设备状态与告警信息，并处理焦点管理与 Esc 关闭。
 */

import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, X, TriangleAlert, Box } from 'lucide-react';
import { assetWarningMessage, getAssetDetails, getAssetStatus } from '../config/presentation.js';

/**
 * 资产详情弹窗：展示设备读数、位置与告警，并管理焦点与键盘交互
 * @param {object} asset - 当前资产对象 { id, name, type, health, value, unit, ... }
 * @param {object} building - 资产所属楼宇对象（含 name）
 * @param {number} floor - 资产所在楼层号
 * @param {object} room - 资产所在房间对象（含 number、name）
 * @param {() => void} onClose - 关闭弹窗的回调
 * @returns {JSX.Element} 资产详情弹窗
 */
export default function AssetModal({ asset, building, floor, room, onClose }) {
  const dialogRef = useRef(null);
  const assetId = asset?.id;
  // 打开弹窗时接管焦点：进入时聚焦首个按钮，关闭后归还焦点给原触发元素
  useEffect(() => {
    if (!assetId) {
      return;
    }
    const previous = document.activeElement;
    const modal = dialogRef.current;
    /**
     * 获取弹窗内全部可聚焦按钮
     * @returns {HTMLElement[]} 可聚焦元素列表
     */
    const focusable = () => Array.from(modal?.querySelectorAll('button') || []);
    focusable()[0]?.focus();

    /**
     * 键盘事件处理：Esc 关闭弹窗，Tab / Shift+Tab 在弹窗内循环聚焦（焦点陷阱）
     * @param {KeyboardEvent} e - 键盘事件对象
     */
    function key(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = focusable();
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, [assetId, onClose]);

  return (
    <div
      className="modal-scrim"
      onClick={() => onClose()}
    >
      {/* 遮罩点击关闭；弹窗内部 stopPropagation 防止误关 */}
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="资产详情"
        className="asset-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="section-title">
          <span className="eyebrow">ASSET DETAILS</span>
          <button
            className="icon-button"
            onClick={() => onClose()}
            aria-label="关闭资产详情"
          >
            <X size={20} />
          </button>
        </div>
        <Box
          size={32}
          className="mint"
        />
        <h2>{asset.name}</h2>
        <p>
          {building.name} / {floor}F / {room.number} {room.name}
        </p>
        <span className={`asset-status ${asset.health === 'warning' ? 'warning' : ''}`}>
          ● {getAssetStatus(asset)}
        </span>
        <div className="asset-reading">
          <b>{asset.value}</b>
          <span>{asset.unit}</span>
        </div>
        {asset.health === 'warning' && (
          <div className="warning-message">
            <TriangleAlert size={16} />
            {assetWarningMessage}
          </div>
        )}
        <dl>
          {getAssetDetails(asset).map((detail) => (
            <div key={detail.label}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
        <button
          className="primary"
          onClick={() => onClose()}
        >
          返回空间 <ArrowUpRight size={16} />
        </button>
      </section>
    </div>
  );
}
