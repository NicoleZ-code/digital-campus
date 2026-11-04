/**
 * @file Ground.jsx
 * @description 园区地面模型：渲染道路标线、树木、车辆与路灯长椅等景观元素。
 */

import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import Box from '../primitives/Box.jsx';
import BatchBoxes from '../primitives/BatchBoxes.jsx';
import Tree from './Tree.jsx';
import { Vehicle } from './Car.jsx';
import { Bench, Lamp, Pedestrian } from './StreetFurniture.jsx';
import { roads, treePositions } from '../config/layout.js';

/**
 * 园区地面模型：渲染地台、道路标线、生态花园、入口大门及树木、车辆、
 * 长椅、路灯、行人等景观元素。
 */
export default function Ground() {
  // 道路细节图元数组（BatchBoxes item）：车道虚线、路缘石、斑马线、停车场标线。
  const roadDetails = useMemo(() => {
    const items = [];
    // 每条道路生成 12 段车道虚线（按 w>d 判断道路走向：横向沿 x、纵向沿 z）
    for (const [x, z, w, d] of roads) {
      for (let j = 0; j < 12; j++) {
        items.push({
          position: w > d ? [-12 + j * 2, 0.165, z] : [x, 0.165, -12 + j * 2],
          size: w > d ? [0.7, 0.012, 0.045] : [0.045, 0.012, 0.7],
          color: '#a1b7b4',
        });
      }
      // 道路两侧路缘石
      for (const side of [-1, 1]) {
        items.push({
          position: [x + (w < d ? (side * w) / 2 : 0), 0.16, z + (w > d ? (side * d) / 2 : 0)],
          size: w > d ? [w, 0.12, 0.09] : [0.09, 0.12, d],
          color: '#91a7a9',
        });
      }
    }
    // 入口斑马线（8 条白色条块，位于南侧 z=12）
    for (let i = 0; i < 8; i++) {
      items.push({
        position: [-1.1 + i * 0.32, 0.18, 12],
        size: [0.17, 0.012, 1.7],
        color: '#b8c9c7',
      });
    }
    // 东侧停车场：12 个车位标线（边缘线 + 分隔线）
    for (let i = 0; i < 12; i++) {
      const z = -8.8 + i * 1.45;
      for (const edge of [-0.5, 0.5]) {
        items.push({
          position: [10.7, 0.17, z + edge],
          size: [1.55, 0.012, 0.035],
          color: '#b2c4c3',
        });
      }
      items.push({ position: [11.45, 0.17, z], size: [0.035, 0.012, 1], color: '#b2c4c3' });
    }
    return items;
  }, []);
  // 生态花园铺装石板：20×4 网格，颜色按 (i+j)%3 交错。
  const paving = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) =>
        Array.from({ length: 4 }, (_, j) => ({
          position: [-11 + i * 0.45, 0.22, 6 + j * 0.45],
          size: [0.42, 0.025, 0.42],
          color: (i + j) % 3 ? '#839e9b' : '#a8b9b1',
        })),
      ).flat(),
    [],
  );
  return (
    <group name="campus-landscape">
      {/* 地块基座（含描边）与地表 */}
      <Box
        position={[0, -0.55, 0]}
        size={[37, 0.9, 32]}
        color="#123340"
        edge
      />
      <Box
        position={[0, -0.03, 0]}
        size={[35.5, 0.22, 30.5]}
        color="#48636a"
      />
      {/* 道路面：roads 每项为 [x 中心, z 中心, 宽, 深] */}
      {roads.map(([x, z, w, d], i) => (
        <Box
          key={i}
          position={[x, 0.12, z]}
          size={[w, 0.04, d]}
          color="#1b303c"
          material={{ roughness: 0.95, metalness: 0 }}
        />
      ))}
      <BatchBoxes
        items={roadDetails}
        roughness={0.9}
        metalness={0}
      />
      {/* 生态花园草坪 */}
      <Box
        position={[-7, 0.12, 6.5]}
        size={[9, 0.2, 6.5]}
        color="#356b55"
        material={{ roughness: 1, metalness: 0 }}
      />
      <BatchBoxes
        items={paving}
        roughness={0.95}
        metalness={0}
      />
      {/* 花园汀步小路 */}
      <Box
        position={[-7, 0.23, 6.5]}
        size={[1.25, 0.05, 6.4]}
        color="#98ada7"
      />
      {/* 圆形喷泉池：池座、水面、塔身与顶部水球 */}
      <mesh
        position={[-7, 0.3, 6.5]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1.25, 1.32, 0.25, 48]} />
        <meshStandardMaterial
          color="#9bb5b7"
          roughness={0.6}
        />
      </mesh>
      <mesh
        position={[-7, 0.44, 6.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.13, 48]} />
        <meshPhysicalMaterial
          color="#4c939c"
          metalness={0.5}
          roughness={0.12}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[-7, 0.64, 6.5]}>
        <cylinderGeometry args={[0.22, 0.38, 0.4, 24]} />
        <meshStandardMaterial color="#9bb4b9" />
      </mesh>
      <mesh position={[-7, 0.92, 6.5]}>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshStandardMaterial
          color="#a5e2e2"
          emissive="#427c82"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* 外围行道树（坐标来自布局配置，每 3 棵缩小一档） */}
      {treePositions.map(([x, z], i) => (
        <Tree
          key={i}
          x={x}
          z={z}
          i={i}
          scale={i % 3 === 0 ? 0.88 : 1}
        />
      ))}
      {/* 园区内绿化树（较小尺寸） */}
      {[
        [-10.5, 4],
        [-3.5, 4],
        [-10.5, 9],
        [-3.5, 9],
        [1, -8],
        [9, -8],
        [1, -2],
        [9, -2],
        [-10, -9],
        [-4, -9],
      ].map(([x, z], i) => (
        <Tree
          key={`inner-${i}`}
          x={x}
          z={z}
          i={i}
          scale={0.8}
        />
      ))}
      {/* 东侧停车场车辆：10 辆，奇偶行朝向相反，颜色循环 */}
      {Array.from({ length: 10 }, (_, i) => (
        <group
          key={i}
          position={[10.7, 0.18, -8.8 + i * 1.45]}
          rotation={[0, i % 2 ? Math.PI : 0, 0]}
        >
          <Vehicle color={['#97b4bc', '#e0e7e3', '#376b7e', '#526d79'][i % 4]} />
        </group>
      ))}
      {/* 花园周边 4 张长椅（后两张反向） */}
      {[
        [-9.5, 0.15, 5],
        [-4.5, 0.15, 5],
        [-9.5, 0.15, 8.4],
        [-4.5, 0.15, 8.4],
      ].map((p, i) => (
        <Bench
          key={i}
          position={p}
          rotation={i > 1 ? Math.PI : 0}
        />
      ))}
      {/* 路灯：x 取 -11/0/11 三列 × z 取 ±13.5 两排，共 6 盏 */}
      {[-11, 0, 11]
        .flatMap((x) => [-13.5, 13.5].map((z) => [x, 0.15, z]))
        .map((p, i) => (
          <Lamp
            key={i}
            position={p}
          />
        ))}
      {/* 花园与路侧的 5 名行人，朝向与衣服颜色各异 */}
      {[
        [-7, 0.25, -1.3],
        [-6.5, 0.25, -1.2],
        [2, 0.25, 3.1],
        [-4.3, 0.25, 7.4],
        [0.6, 0.25, 13.5],
      ].map((p, i) => (
        <Pedestrian
          key={i}
          position={p}
          rotation={i * 0.6}
          color={i % 2 ? '#a2babc' : '#638f89'}
        />
      ))}
      {/* 园区南门：门柱、门梁、岗亭与门禁闸机 */}
      <group
        position={[0, 0.2, 14.4]}
        name="entrance-gate"
      >
        {/* 门柱 */}
        {[-2.1, 2.1].map((x) => (
          <Box
            key={x}
            position={[x, 0.75, 0]}
            size={[0.3, 1.5, 0.55]}
            color="#acc2c1"
          />
        ))}
        {/* 门楣横梁 */}
        <Box
          position={[0, 1.55, 0]}
          size={[4.6, 0.2, 0.75]}
          color="#adc6c7"
        />
        {/* 门禁立柱与横杆 */}
        <Box
          position={[-1.5, 0.55, 0.2]}
          size={[0.2, 1, 0.2]}
          color="#d2dbd5"
        />
        <Box
          position={[-0.6, 0.9, 0.2]}
          size={[1.8, 0.06, 0.06]}
          color="#d3c3a2"
        />
        {/* 门卫岗亭主体与玻璃窗 */}
        <Box
          position={[2.7, 0.55, 0]}
          size={[0.9, 1.1, 1]}
          color="#294e5b"
        />
        <Box
          position={[2.7, 0.9, 0.51]}
          size={[0.7, 0.5, 0.025]}
          color="#86b7bd"
        />
      </group>
      {/* 地面标注：生态花园、园区南门 */}
      <Html
        position={[-7, 0.6, 10]}
        center
      >
        <span className="ground-label">生态花园</span>
      </Html>
      <Html
        position={[0, 2, 14.5]}
        center
      >
        <span className="ground-label">园区南门</span>
      </Html>
    </group>
  );
}
