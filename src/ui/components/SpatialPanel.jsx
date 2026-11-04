/**
 * @file SpatialPanel.jsx
 * @description 左侧空间资产面板，提供楼宇、楼层、房间的层级导航与设备状态列表。
 */

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
import { campusLocation, getAssetStatus } from '../config/presentation.js';
import { formatNumber as fmt } from '../../shared/format.js';

/**
 * 左侧空间资产面板：按层级展示园区 / 楼宇 / 楼层 / 房间 / 资产索引列表
 * @param {object} selection - 当前选中状态 { level, buildingId, floor, selectedAssetId }
 * @param {object} data - 面板数据 { city, campus, campuses, buildings, alerts, building, rooms, metrics, assets }
 * @param {object} view - 当前层级的展示文案与派生值 { title, subtitle, spatialTitle, count, countLabel, indexTitle, indexCount, hint }
 * @param {(level: number) => void} onNavigate - 层级跳转回调（定位卡片点击后返回城市层）
 * @param {(campusId: string) => void} onCampus - 城市层选中园区并下钻到园区层的回调
 * @param {(buildingId: string) => void} onBuilding - 选中楼宇并下钻到楼宇层的回调
 * @param {(floor: number) => void} onFloor - 选中楼层并下钻到楼层层的回调
 * @param {(room: object) => void} onRoom - 选中房间并下钻到房间层的回调
 * @param {(asset: object) => void} onAsset - 选中资产（打开详情弹窗）的回调
 * @returns {JSX.Element} 左侧面板
 */
export default function SpatialPanel({
  selection,
  data,
  view,
  onNavigate: go,
  onBuilding: selectBuilding,
  onFloor: selectFloor,
  onRoom: selectRoom,
  onAsset: setAsset,
  onCampus: selectCampus,
}) {
  const { level, buildingId, floor, selectedAssetId } = selection;
  const { buildings, campuses = [], alerts, building, rooms, metrics, assets } = data;

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
            <span>房间使用面积 / m²</span>
          </div>
        </div>
        <div className="rule" />
        <div className="section-title">
          <h2>{view.indexTitle}</h2>
          <small>{view.indexCount}</small>
        </div>
        <div className="index-list">
          {/* level 0：城市层按园区索引，点击进入对应园区 */}
          {level === 0 ? (
            campuses.map((c) => (
              <button
                key={c.id}
                className="index-item"
                onClick={() => selectCampus(c.id)}
              >
                <Boxes size={18} />
                <span>
                  {c.name}
                  <small>
                    {c.district} · {c.buildingCount ?? 0} 栋楼宇
                  </small>
                </span>
                <ArrowUpRight size={14} />
              </button>
            ))
          ) : level === 1 ? (
            // level 1：园区层按楼宇索引，选中项高亮
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
              {/* level 2：楼层网格，自顶层向下排列，含告警标记 */}
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
                className={`index-item ${selectedAssetId === a.id ? 'selected' : ''}`}
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
                    {a.type} · {getAssetStatus(a)}
                  </small>
                </span>
                <i className={`status-dot ${a.health === 'warning' ? 'warn' : ''}`} />
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
          {data.campus?.name ?? campusLocation.name}
          <small>
            {data.city?.name ? `${data.city.name} · ` : ''}
            {data.campus?.location
              ? `${data.campus.location.latitude.toFixed(4)}° N / ${data.campus.location.longitude.toFixed(4)}° E`
              : campusLocation.coordinates}
          </small>
        </span>
        <ArrowUpRight size={14} />
      </button>
    </aside>
  );
}
