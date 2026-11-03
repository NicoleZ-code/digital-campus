import React from 'react';
import {
  Boxes,
  ArrowUpRight,
  Layers,
  DoorOpen,
  Activity,
  Wind,
  Lightbulb,
  LocateFixed,
} from 'lucide-react';
import { campusLocation } from '../config/presentation.js';
import { formatNumber as fmt } from '../../shared/format.js';

export default function SpatialPanel({
  selection,
  data,
  view,
  onNavigate: go,
  onBuilding: selectBuilding,
  onFloor: selectFloor,
  onRoom: selectRoom,
  onAsset: setAsset,
}) {
  const { level, buildingId, floor, asset } = selection;
  const { buildings, alerts, building, rooms, metrics, assets } = data;

  const { title, subtitle: sub } = view;
  return (
    <aside className="left">
      <div className="intro">
        <span className="eyebrow">HAIXU DIGITAL CAMPUS</span>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      <section className="panel spatial">
        <div className="section-title">
          <h2>{view.spatialTitle}</h2>
          <Boxes size={17} />
        </div>
        <div className="big-stat">
          {fmt(metrics.assets)}
          <span>件</span>
        </div>
        <p className="muted">{level === 4 ? '房间关联资产' : '空间数字资产'}</p>
        <div className="mini-stats">
          <div>
            <b>{view.count}</b>
            <span>{view.countLabel}</span>
          </div>
          <div>
            <b>{fmt(metrics.area)}</b>
            <span>{level < 2 ? '园区用地 / m²' : '空间面积 / m²'}</span>
          </div>
        </div>
        <div className="rule" />
        <div className="section-title">
          <h2>{view.indexTitle}</h2>
          <small>{view.indexCount}</small>
        </div>
        <div className="index-list">
          {level < 2 ? (
            buildings.map((b) => (
              <button
                key={b.id}
                className={`index-item ${buildingId === b.id ? 'selected' : ''}`}
                onClick={() => selectBuilding(b.id)}
              >
                <b
                  className="code"
                  style={{ color: b.color }}
                >
                  {b.code}
                </b>
                <span>
                  {b.name}
                  <small>
                    {b.use} · {b.floors} 层
                  </small>
                </span>
                <ArrowUpRight size={14} />
              </button>
            ))
          ) : level === 2 ? (
            <div className="floor-grid">
              {Array.from({ length: building.floors }, (_, i) => building.floors - i).map((f) => (
                <button
                  key={f}
                  onClick={() => selectFloor(f)}
                  className={floor === f ? 'selected' : ''}
                >
                  <Layers size={13} />
                  {String(f).padStart(2, '0')}F
                  {alerts.some(
                    (alert) => alert.buildingId === building.id && alert.floor === f,
                  ) && <i />}
                </button>
              ))}
            </div>
          ) : level === 3 ? (
            rooms.map((r) => (
              <button
                key={r.id}
                className="index-item"
                onClick={() => selectRoom(r)}
              >
                <DoorOpen size={18} />
                <span>
                  {r.number} · {r.name}
                  <small>
                    {r.area} m² · {r.warning ? '1 项告警' : '运行正常'}
                  </small>
                </span>
                <ArrowUpRight size={14} />
              </button>
            ))
          ) : (
            assets.map((a, i) => (
              <button
                key={a.id}
                className={`index-item ${asset?.id === a.id ? 'selected' : ''}`}
                onClick={() => setAsset(a)}
              >
                {i === 0 ? (
                  <Wind size={18} />
                ) : i === 1 ? (
                  <Activity size={18} />
                ) : (
                  <Lightbulb size={18} />
                )}
                <span>
                  {a.name}
                  <small>
                    {a.type} · {a.status}
                  </small>
                </span>
                <i className={`status-dot ${a.status === '告警' ? 'warn' : ''}`} />
              </button>
            ))
          )}
        </div>
        <p className="panel-hint">{view.hint}</p>
      </section>
      <button
        className="location-card"
        onClick={() => go(0)}
      >
        <LocateFixed size={19} />
        <span>
          {campusLocation.name}
          <small>{campusLocation.coordinates}</small>
        </span>
        <ArrowUpRight size={14} />
      </button>
    </aside>
  );
}
