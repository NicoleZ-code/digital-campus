/**
 * @file BatchBoxes.jsx
 * @description 批量立方体组件，将重复建筑细节合并为单次实例化绘制。
 */

import React, { useLayoutEffect, useRef } from 'react';
import { Color, Object3D } from 'three';

// 重复的建筑细节共用几何体和材质，并合并为一次绘制调用。
/**
 * 批量立方体组件：基于 instancedMesh 将大量同几何体的立方体
 * 合并为单次绘制调用，用于高效渲染幕墙框架、玻璃等重复细节。
 *
 * @param {Array<Object>} items - 实例描述列表，每项包含：
 *   position 三维坐标 [x, y, z]（必填，场景单位）；
 *   size 尺寸 [宽(x), 高(y), 深(z)]（必填，作为缩放值）；
 *   rotation 欧拉角 [rx, ry, rz]（可选，默认 [0, 0, 0]）；
 *   color 颜色（可选，CSS 色值，默认 '#b0c7c8'）。
 * @param {number} [roughness=0.55] - 材质粗糙度，0~1。
 * @param {number} [metalness=0.25] - 材质金属度，0~1。
 * @param {number} [opacity=1] - 不透明度 0~1，小于 1 时自动开启透明模式。
 * @param {Object} props - 其余属性透传给 instancedMesh。
 * @returns {JSX.Element} 渲染包含 items.length 个实例的 instancedMesh。
 */
export default function BatchBoxes({
  items,
  roughness = 0.55,
  metalness = 0.25,
  opacity = 1,
  ...props
}) {
  const ref = useRef();
  // 用临时 Object3D 组合位置/缩放/旋转，逐实例写入变换矩阵与颜色。
  useLayoutEffect(() => {
    const transform = new Object3D();
    const color = new Color();
    items.forEach((item, index) => {
      transform.position.set(...item.position);
      transform.scale.set(...item.size);
      transform.rotation.set(...(item.rotation || [0, 0, 0]));
      transform.updateMatrix();
      ref.current.setMatrixAt(index, transform.matrix);
      ref.current.setColorAt(index, color.set(item.color || '#b0c7c8'));
    });
    // 标记实例数据需重新上传 GPU，并更新包围球供视锥剔除使用。
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) {
      ref.current.instanceColor.needsUpdate = true;
    }
    ref.current.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh
      ref={ref}
      args={[null, null, items.length]}
      castShadow
      receiveShadow
      {...props}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        roughness={roughness}
        metalness={metalness}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </instancedMesh>
  );
}
