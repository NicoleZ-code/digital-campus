import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// 仅导出几何模型，不包含场景中的 DOM 标签及外围 React 界面。
export async function serializeModel(group) {
  group.updateMatrixWorld(true);
  return new GLTFExporter().parseAsync(group, { binary: true, onlyVisible: true });
}
