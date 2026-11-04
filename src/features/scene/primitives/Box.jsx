/**
 * @file Box.jsx
 * @description 基础立方体图元，统一封装阴影、描边与材质参数。
 */

import React from 'react';
import { Edges } from '@react-three/drei';

/**
 * 基础立方体图元：统一封装阴影投射/接收、可选描边与标准材质参数，
 * 可透传其余 mesh 属性（如 rotation、onClick 等）。
 *
 * @param {number[]} [position] - 立方体中心的三维坐标 [x, y, z]（x 横向、y 高度、z 纵深，单位：场景单位）。
 * @param {number[]} [size] - 尺寸 [宽(x), 高(y), 深(z)]，单位：场景单位。
 * @param {string} [color='#234955'] - 材质基础颜色（CSS 色值）。
 * @param {number} [opacity=1] - 不透明度，0~1；小于 1 时自动开启透明模式。
 * @param {boolean} [edge=false] - 是否显示青色描边线框。
 * @param {Object} [material={}] - 透传给 meshStandardMaterial 的额外材质参数（如 emissive、roughness 等）。
 * @param {Object} props - 其余属性透传给 mesh（如 rotation、onClick、visible 等）。
 * @returns {JSX.Element} 渲染一个带阴影的立方体 mesh。
 */
export default function Box({
  position,
  size,
  color = '#234955',
  opacity = 1,
  edge = false,
  material = {},
  ...props
}) {
  return (
    <mesh
      castShadow
      receiveShadow
      position={position}
      {...props}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        roughness={0.5}
        metalness={0.35}
        {...material}
      />
      {edge && (
        <Edges
          color="#80c9cc"
          threshold={20}
        />
      )}
    </mesh>
  );
}
