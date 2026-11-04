/**
 * @file serializeModel.js
 * @description 将 Three.js 场景组序列化为 GLB 二进制模型文件。
 */

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// 仅导出几何模型，不包含场景中的 DOM 标签及外围 React 界面。
/**
 * 将 Three.js 场景组序列化为 GLB 二进制数据（ArrayBuffer），供下载为 .glb 模型文件。
 * 导出前强制刷新世界矩阵，仅导出可见对象。
 * @param {import('three').Object3D} group - 待导出的 Three.js 场景组根节点
 * @returns {Promise<ArrayBuffer>} 序列化后的 GLB 二进制数据
 */
export async function serializeModel(group) {
  // 确保所有子节点矩阵已更新到最新状态
  group.updateMatrixWorld(true);
  return new GLTFExporter().parseAsync(group, { binary: true, onlyVisible: true });
}
