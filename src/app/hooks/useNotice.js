/**
 * @file useNotice.js
 * @description 全局提示消息 Hook，展示 3.5 秒后自动清除。
 */

import { useState, useEffect } from 'react';

/**
 * 全局提示消息 Hook：设置消息后 3.5 秒自动清除，期间重新设置会重置计时。
 * @returns {object} 提示状态与设置函数
 * @returns {string} returns.notice - 当前提示消息文本（空字符串表示无提示）
 * @returns {(message: string) => void} returns.notify - 设置提示消息（触发自动清除计时）
 */
export default function useNotice() {
  const [notice, notify] = useState('');
  // 有消息时启动 3.5 秒定时器自动清除，消息变化或卸载时清理定时器
  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = setTimeout(() => notify(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  return { notice, notify };
}
