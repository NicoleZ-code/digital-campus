import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, X, TriangleAlert, Box } from 'lucide-react';
import { assetWarningMessage, getAssetDetails } from '../config/presentation.js';

export default function AssetModal({ asset, building, floor, room, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!asset) return;
    const previous = document.activeElement;
    const modal = dialogRef.current;
    const focusable = () => Array.from(modal?.querySelectorAll('button') || []);
    focusable()[0]?.focus();
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
  }, [asset, onClose]);

  return (
    <div
      className="modal-scrim"
      onClick={() => onClose()}
    >
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
        <span className={`asset-status ${asset.status === '告警' ? 'warning' : ''}`}>
          ● {asset.status}
        </span>
        <div className="asset-reading">
          <b>{asset.value}</b>
          <span>{asset.unit}</span>
        </div>
        {asset.status === '告警' && (
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
