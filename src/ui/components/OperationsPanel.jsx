/**
 * @file OperationsPanel.jsx
 * @description 右侧运行监控面板，展示环境读数、能耗对比图表与告警列表。
 */

import React from 'react';
import { ChevronRight, ArrowUpRight, TriangleAlert, Check, Clock3 } from 'lucide-react';
import Chart from '../charts/EnergyChart.jsx';
import { environmentReadings, energyComparison } from '../config/presentation.js';
import { formatNumber as fmt } from '../../shared/format.js';

/**
 * 右侧运行监控面板：资产在线率、能耗趋势图表、告警列表与环境读数
 * @param {object} metrics - 汇总指标 { online: number }，online 为资产在线率百分比
 * @param {'24h'|'7d'} period - 能耗图当前统计周期
 * @param {(period: '24h'|'7d') => void} onPeriod - 切换统计周期的回调
 * @param {'overview'|'alerts'} tab - 当前激活的标签页（关注事项 / 告警记录）
 * @param {(tab: 'overview'|'alerts') => void} onTab - 切换标签页的回调
 * @param {Array<object>} alerts - 告警列表，元素含 id/title/summary/detail/time/buildingId/floor 等
 * @param {(alert: object) => void} onLocateAlert - 点击告警后定位到对应房间的回调
 * @param {object} view - 当前层级的展示文案与派生值 { onlineCount, warningCount, offlineCount, energy, energyScope }
 * @returns {JSX.Element} 右侧面板
 */
export default function OperationsPanel({
  metrics,
  period,
  onPeriod: setPeriod,
  tab,
  onTab: setTab,
  alerts,
  onLocateAlert: locateAlert,
  view,
}) {
  return (
    <aside className="right">
      <section className="panel operations">
        <div className="section-title">
          <h2>空间资产运行</h2>
          <small>OPERATIONS</small>
        </div>
        <div className="operation-stats">
          {/* 在线率百分比 × 3.6 换算为角度，供 donut 的 CSS 圆锥渐变变量 --percent 使用 */}
          <div
            className="donut"
            style={{ '--percent': `${Number(metrics.online) * 3.6}deg` }}
          >
            <div>
              <b>
                {metrics.online}
                <small>%</small>
              </b>
              <span>资产在线率</span>
            </div>
          </div>
          <div className="status-list">
            <div>
              <i />
              <span>在线</span>
              <b>{view.onlineCount}</b>
            </div>
            <div>
              <i className="amber" />
              <span>告警</span>
              <b>{view.warningCount}</b>
            </div>
            <div>
              <i className="gray" />
              <span>离线</span>
              <b>{view.offlineCount}</b>
            </div>
          </div>
        </div>
        <div className="rule" />
        <div className="section-title">
          <h2>用能趋势</h2>
          <div className="segmented">
            <button
              onClick={() => setPeriod('24h')}
              className={period === '24h' ? 'active' : ''}
            >
              24h
            </button>
            <button
              onClick={() => setPeriod('7d')}
              className={period === '7d' ? 'active' : ''}
            >
              7d
            </button>
          </div>
        </div>
        <div className="energy-total">
          <b>{fmt(view.energy)}</b>
          <span>kWh</span>
          <small>
            较上期 <em>↓ {energyComparison.decrease}</em>
          </small>
        </div>
        <Chart
          energy={view.energy}
          period={period}
        />
        <div className="legend">
          <i /> {view.energyScope}
          模拟用能
        </div>
        <div className="rule" />
        <div className="tabs">
          <button
            className={tab === 'overview' ? 'active' : ''}
            onClick={() => setTab('overview')}
          >
            关注事项 <span>{String(alerts.length).padStart(2, '0')}</span>
          </button>
          <button
            className={tab === 'alerts' ? 'active' : ''}
            onClick={() => setTab('alerts')}
          >
            告警记录
          </button>
        </div>
        {tab === 'overview' ? (
          <>
            {/* 关注事项页：置顶展示最新一条告警，可点击定位房间 */}
            {alerts[0] && (
              <button
                className="alert-card"
                onClick={() => locateAlert(alerts[0])}
              >
                <TriangleAlert size={17} />
                <span>
                  <b>{alerts[0].title}</b>
                  <small>{alerts[0].summary}</small>
                  <em>
                    {alerts[0].time} · 点击定位房间 <ArrowUpRight size={11} />
                  </em>
                </span>
              </button>
            )}
            <div className="health">
              <Check size={14} />
              <span>{alerts.length ? '其余空间运行平稳' : '暂无未处理告警'}</span>
              <span>正常</span>
            </div>
          </>
        ) : (
          <div className="alert-log">
            {/* 告警记录页：完整告警时间线 */}
            <span className="muted">本次演示 · {alerts.length} 条未处理</span>
            {alerts.map((a) => (
              <button
                key={a.id}
                onClick={() => locateAlert(a)}
              >
                <Clock3 size={14} />
                <span>
                  {a.time} {a.title}
                  <small>{a.detail}</small>
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        )}
        <div className="environment">
          {environmentReadings.map((reading) => (
            <div key={reading.label}>
              <span>{reading.label}</span>
              <b className={reading.className}>
                {reading.value}
                {reading.unit && <small>{reading.unit}</small>}
              </b>
            </div>
          ))}
        </div>
        <div className="data-status">
          <i />
          演示状态<span>本地模拟数据</span>
        </div>
      </section>
    </aside>
  );
}
