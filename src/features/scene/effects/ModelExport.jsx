import { useEffect } from 'react';
import { downloadBlob } from '../../../infrastructure/browser/download.js';
export default function ModelExport({ request, modelRef, onComplete }) {
  useEffect(() => {
    if (!request || !modelRef.current) return;
    let cancelled = false;
    async function save() {
      try {
        const { serializeModel } = await import('../../../infrastructure/export/serializeModel.js');
        const buffer = await serializeModel(modelRef.current);
        if (cancelled) return;
        downloadBlob(new Blob([buffer], { type: 'model/gltf-binary' }), 'haixu-digital-campus.glb');
        onComplete('当前场景已导出 GLB，可导入 Blender 二次编辑');
      } catch (error) {
        if (!cancelled) onComplete(`导出失败：${error.message}`);
      }
    }
    save();
    return () => {
      cancelled = true;
    };
  }, [request, modelRef, onComplete]);
  return null;
}
