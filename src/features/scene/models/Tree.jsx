/**
 * @file Tree.jsx
 * @description 景观树木模型，由树干与树冠组成。
 */

import React from 'react';

/**
 * 景观树木模型：圆柱树干 + 4 颗错落堆叠的球形树冠。
 * @param {number} x - 树的 x 横向坐标
 * @param {number} z - 树的 z 纵深坐标
 * @param {number} [i=0] - 树序号，用于树冠颜色轮换
 * @param {number} [scale=1] - 整体缩放倍数
 */
export default function Tree({ x, z, i = 0, scale = 1 }) {
  return (
    <group
      position={[x, 0, z]}
      scale={scale}
      name="landscape-tree"
    >
      {/* 树干（上细下粗的圆柱） */}
      <mesh
        position={[0, 0.42, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.055, 0.085, 0.85, 8]} />
        <meshStandardMaterial
          color="#53665b"
          roughness={1}
        />
      </mesh>
      {/* 4 颗球形树冠：每项为 [x, y(高度), z, 半径] */}
      {[
        [0, 1, 0, 0.47],
        [-0.21, 0.88, 0.08, 0.34],
        [0.22, 0.94, -0.05, 0.37],
        [0.04, 1.27, 0, 0.31],
      ].map(([a, b, c, r], j) => (
        <mesh
          key={j}
          position={[a, b, c]}
          scale={[1, 1.2, 0.95]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[r, 10, 8]} />
          <meshStandardMaterial
            color={['#3b7763', '#49846b', '#37715f'][(i + j) % 3]}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}
