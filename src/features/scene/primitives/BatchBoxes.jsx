import React, { useLayoutEffect, useRef } from 'react';
import { Color, Object3D } from 'three';

// 重复的建筑细节共用几何体和材质，并合并为一次绘制调用。
export default function BatchBoxes({
  items,
  roughness = 0.55,
  metalness = 0.25,
  opacity = 1,
  ...props
}) {
  const ref = useRef();
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
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
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
