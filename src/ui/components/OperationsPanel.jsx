import React from 'react';
import { ChevronRight, ArrowUpRight, TriangleAlert, Check, Clock3 } from 'lucide-react';
import Chart from '../charts/EnergyChart.jsx';
import { environmentReadings, energyComparison } from '../config/presentation.js';
import { formatNumber as fmt } from '../../shared/format.js';

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
              <b>0</b>
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
            <div className="health">
              <Check size={14} />
              <span>其余空间运行平稳</span>
              <span>正常</span>
            </div>
          </>
        ) : (
          <div className="alert-log">
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
