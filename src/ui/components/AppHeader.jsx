import React from 'react';
import { Boxes, ChevronRight, Map, Maximize, CodeXml } from 'lucide-react';
import useClock from '../hooks/useClock.js';

export default function AppHeader({
  level,
  building,
  floor,
  onNavigate: go,
  onReset: reset,
  onNotice: setNotice,
}) {
  const time = useClock();
  return (
    <header>
      <button
        className="brand"
        onClick={reset}
      >
        <Boxes
          size={31}
          strokeWidth={1.3}
        />
        <span>
          海序空间<small>HAIXU SPATIAL</small>
        </span>
      </button>
      <div className="header-divider" />
      <nav className="breadcrumb">
        <button onClick={() => go(0)}>
          <Map size={14} />
          上海市
        </button>
        <ChevronRight size={12} />
        <button onClick={() => go(1)}>海序数字园区</button>
        {level >= 2 && (
          <>
            <ChevronRight size={12} />
            <button onClick={() => go(2)}>{building.name}</button>
          </>
        )}
        {level >= 3 && (
          <>
            <ChevronRight size={12} />
            <button onClick={() => go(3)}>{floor}F</button>
          </>
        )}
      </nav>
      <div className="header-right">
        {level === 1 && (
          <a
            className="analysis-link"
            href={`${import.meta.env.BASE_URL}sdoc/下钻与楼层展开技术分析.html`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CodeXml size={16} />
            分析代码
          </a>
        )}
        <span className="live">
          <i />
          模拟数据
        </span>
        <span className="date">
          {time.toLocaleDateString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
          <b>{time.toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}</b>
        </span>
        <button
          className="icon-button"
          title="切换全屏"
          onClick={() => {
            const p = document.fullscreenElement
              ? document.exitFullscreen()
              : document.documentElement.requestFullscreen();
            p?.catch(() => setNotice('当前浏览器暂不支持全屏'));
          }}
        >
          <Maximize size={17} />
        </button>
      </div>
    </header>
  );
}
