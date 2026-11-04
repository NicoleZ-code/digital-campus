/**
 * @file useModelExport.js
 * @description 管理模型导出状态（忙碌标记、导出请求、完成回调）的 Hook。
 */

import { useState, useCallback } from 'react';

/**
 * 管理模型导出流程状态的 Hook。
 * 通过 request 计数器通知场景组件发起导出，由 complete 回调标记结束并提示。
 * @param {(message: string) => void} notify - 导出完成后展示的提示消息回调
 * @returns {object} 导出状态与操作
 * @returns {boolean} returns.busy - 是否正在导出（用于禁用按钮）
 * @returns {number} returns.request - 导出请求计数，自增一次触发一次导出
 * @returns {() => void} returns.start - 发起一次导出请求（忙碌中时忽略）
 * @returns {(message: string) => void} returns.complete - 标记导出结束并发出提示消息
 */
export default function useModelExport(notify) {
  // 是否正在导出
  const [busy, setBusy] = useState(false);
  // 导出请求计数：场景组件监听其变化执行导出
  const [request, setRequest] = useState(0);
  /**
   * 导出完成回调：结束忙碌状态并展示结果消息。
   * @param {string} message - 展示给用户的完成提示文本
   * @returns {void}
   */
  const complete = useCallback(
    (message) => {
      setBusy(false);
      notify(message);
    },
    [notify],
  );

  /** 发起一次导出：忙碌中直接忽略，否则置忙碌并自增请求计数。 */
  function start() {
    if (busy) {
      return;
    }
    setBusy(true);
    setRequest((value) => value + 1);
  }

  return { busy, request, start, complete };
}
