/**
 * @file ModelExport.jsx
 * @description 模型导出副作用组件：将当前场景组序列化为 GLB 并触发浏览器下载。
 */

import { useEffect } from 'react';
import { downloadBlob } from '../../../infrastructure/browser/download.js';

/**
 * 模型导出副作用组件：监听导出请求，将场景根 group 序列化为 GLB
 * 并触发浏览器下载；渲染上不可见（始终返回 null）。
 *
 * @param {Object} request - 导出请求对象，每次变化（新引用）触发一次导出。
 * @param {Object} modelRef - 指向场景根 group 的 ref，导出的模型来源。
 * @param {Function} onComplete - 导出结束回调，成功时收到提示文案，失败时收到错误信息。
 * @returns {null} 不渲染任何可见内容。
 */
export default function ModelExport({ request, modelRef, onComplete }) {
  useEffect(() => {
    // 无请求或场景尚未挂载时跳过。
    if (!request || !modelRef.current) {
      return;
    }
    // 组件卸载/依赖变化时置位，防止过期异步结果继续下载或回调。
    let cancelled = false;

    async function save() {
      try {
        const { serializeModel } = await import('../../../infrastructure/export/serializeModel.js');
        const buffer = await serializeModel(modelRef.current);
        if (cancelled) {
          return;
        }
        downloadBlob(new Blob([buffer], { type: 'model/gltf-binary' }), 'haixu-digital-campus.glb');
        onComplete('当前场景已导出 GLB，可导入 Blender 二次编辑');
      } catch (error) {
        if (!cancelled) {
          onComplete(`导出失败：${error.message}`);
        }
      }
    }

    save();
    return () => {
      cancelled = true;
    };
  }, [request, modelRef, onComplete]);
  return null;
}
