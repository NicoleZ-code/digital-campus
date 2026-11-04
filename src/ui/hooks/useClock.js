/**
 * @file useClock.js
 * @description 每秒刷新当前时间的 React Hook，供顶栏时钟显示。
 */

import { useEffect, useState } from 'react';

/**
 * 每秒刷新一次当前时间的 Hook。
 * @returns {Date} 当前时间对象（每秒更新，供时钟组件渲染）
 */
export default function useClock() {
  // 惰性初始化当前时间
  const [time, setTime] = useState(() => new Date());
  // 每秒同步一次时间，卸载时清理定时器
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
