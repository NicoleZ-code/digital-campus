/**
 * @file AppHeader.jsx
 * @description 页面顶部导航栏，包含品牌入口、层级面包屑、实时时钟与全局操作。
 */

import React from 'react';
import { Boxes, ChevronRight, Map, Maximize, CodeXml, Database } from 'lucide-react';
import useClock from '../hooks/useClock.js';

/**
 * 页面顶部导航栏组件
 * @param {number} level - 当前空间层级索引 0-4（0 城市 / 1 园区 / 2 楼宇 / 3 楼层 / 4 房间）
 * @param {object} building - 当前选中楼宇对象（含 name 等字段），level >= 2 时展示
 * @param {number} floor - 当前选中楼层号，level >= 3 时展示
 * @param {(level: number) => void} onNavigate - 层级跳转回调，参数为目标层级索引（用于面包屑点击）
 * @param {() => void} onReset - 重置回初始层级的回调（点击品牌按钮触发）
 * @param {(msg: string) => void} onNotice - 全局提示回调，用于上报全屏切换失败等消息
 */
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
      {/* 面包屑：按当前层级逐级显示可回跳的入口 */}
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
        {/* 文档入口固定显示，确保下钻到任意层级后仍可访问分析文档。 */}
        <div className="documentation-links">
          <a
            className="analysis-link"
            href={`${import.meta.env.BASE_URL}sdoc/index.html#analysis`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CodeXml size={16} />
            分析代码
          </a>
          <a
            className="analysis-link"
            href={`${import.meta.env.BASE_URL}sdoc/index.html#data`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Database size={16} />
            数据结构
          </a>
        </div>
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
