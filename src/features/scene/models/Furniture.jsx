/**
 * @file Furniture.jsx
 * @description 室内家具模型：办公椅、桌台与绿植。
 */

import React from 'react';
import { RoundedBox } from '@react-three/drei';
import Box from '../primitives/Box.jsx';

/**
 * 渲染办公椅：坐垫、椅背、气杆与五爪底座。
 * @param {number[]} [position=[0,0,0]] - 椅子位置坐标 [x, y(高度), z]
 * @param {number} [rotation=0] - 绕 Y 轴旋转角度（弧度）
 */
export function Chair({ position = [0, 0, 0], rotation = 0 }) {
  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
      name="office-chair"
    >
      <RoundedBox
        position={[0, 0.28, 0]}
        args={[0.3, 0.055, 0.3]}
        radius={0.025}
        smoothness={1}
        castShadow
      >
        <meshStandardMaterial
          color="#7eafb0"
          roughness={0.65}
        />
      </RoundedBox>
      <Box
        position={[0, 0.46, 0.13]}
        size={[0.3, 0.31, 0.045]}
        color="#6b9ea3"
      />
      <Box
        position={[0, 0.14, 0]}
        size={[0.035, 0.25, 0.035]}
        color="#6a8088"
      />
      <Box
        position={[0, 0.025, 0]}
        size={[0.29, 0.025, 0.045]}
        color="#4f6971"
      />
      <Box
        position={[0, 0.025, 0]}
        size={[0.045, 0.025, 0.29]}
        color="#4f6971"
      />
    </group>
  );
}
/**
 * 渲染显示器：屏幕、屏面、支杆与底座。
 * @param {number[]} [position=[0,0,0]] - 显示器位置坐标 [x, y(高度), z]
 */
export function Monitor({ position = [0, 0, 0] }) {
  return (
    <group
      position={position}
      name="workstation-monitor"
    >
      <Box
        position={[0, 0.13, 0]}
        size={[0.33, 0.22, 0.025]}
        color="#153440"
      />
      <Box
        position={[0, 0.135, 0.016]}
        size={[0.29, 0.18, 0.008]}
        color="#356f83"
        material={{ emissive: '#245362', emissiveIntensity: 0.2 }}
      />
      <Box
        position={[0, -0.02, 0]}
        size={[0.035, 0.12, 0.035]}
        color="#567680"
      />
      <Box
        position={[0, -0.075, 0.015]}
        size={[0.15, 0.015, 0.1]}
        color="#6b8890"
      />
    </group>
  );
}
/**
 * 渲染办公桌工位：桌板、侧桌腿、显示器与办公椅。
 * @param {number[]} [position=[0,0,0]] - 工位位置坐标 [x, y(高度), z]
 * @param {number} [rotation=0] - 绕 Y 轴旋转角度（弧度）
 */
export function Desk({ position = [0, 0, 0], rotation = 0 }) {
  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
      name="workstation"
    >
      <Box
        position={[0, 0.47, 0]}
        size={[0.88, 0.055, 0.51]}
        color="#c0d4ce"
      />
      {[-0.35, 0.35].map((x) => (
        <Box
          key={x}
          position={[x, 0.24, 0]}
          size={[0.04, 0.46, 0.43]}
          color="#95b7ba"
        />
      ))}
      <Monitor position={[0, 0.56, -0.1]} />
      <Box
        position={[0, 0.51, 0.13]}
        size={[0.26, 0.014, 0.11]}
        color="#758e96"
      />
      <Chair position={[0, 0, 0.46]} />
    </group>
  );
}
/**
 * 渲染室内绿植：花盆与三片错落摆放的球形叶片。
 * @param {number[]} [position=[0,0,0]] - 绿植位置坐标 [x, y(高度), z]
 */
export function Plant({ position = [0, 0, 0] }) {
  return (
    <group
      position={position}
      name="indoor-plant"
    >
      <mesh
        position={[0, 0.13, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.14, 0.1, 0.26, 12]} />
        <meshStandardMaterial color="#b6c9c6" />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh
          key={i}
          position={[i * 0.055, 0.36 + Math.abs(i) * 0.035, 0]}
          rotation={[0, 0, i * 0.28]}
          scale={[0.1, 0.25, 0.09]}
          castShadow
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#377c68" />
        </mesh>
      ))}
    </group>
  );
}
/**
 * 渲染服务器机柜：柜体、前门与 9 层服务器指示灯。
 * @param {number[]} position - 机柜位置坐标 [x, y(高度), z]（必传）
 */
export function ServerRack({ position }) {
  return (
    <group
      position={position}
      name="server-rack"
    >
      <Box
        position={[0, 0.59, 0]}
        size={[0.52, 1.18, 0.64]}
        color="#526d78"
      />
      <Box
        position={[0, 0.6, 0.325]}
        size={[0.44, 1.04, 0.018]}
        color="#1d3540"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i}>
          <Box
            position={[0, 0.14 + i * 0.11, 0.34]}
            size={[0.4, 0.055, 0.025]}
            color="#7c99a2"
          />
          <Box
            position={[0.15, 0.14 + i * 0.11, 0.358]}
            size={[0.025, 0.02, 0.012]}
            color={i % 3 ? '#74dbc5' : '#d6b57e'}
            material={{ emissive: '#4abfa8', emissiveIntensity: 0.4 }}
          />
        </group>
      ))}
    </group>
  );
}
/**
 * 按房间类型（kind）渲染对应的室内家具组合。
 * @param {string} kind - 房间名称/类型：'设备机房'（6 台机柜）、'智能会议室'（会议桌+8 椅）、
 *   '协作空间'（卡座+洽谈桌），其余（如办公室）渲染 6 组工位桌椅
 */
export default function Furniture({ kind }) {
  // 设备机房：3 列 × 2 排共 6 台服务器机柜
  if (kind === '设备机房') {
    return (
      <>
        {[-0.9, 0, 0.9].flatMap((x) =>
          [-0.5, 0.5].map((z) => (
            <ServerRack
              key={`${x}-${z}`}
              position={[x, 0, z]}
            />
          )),
        )}
      </>
    );
  }
  // 智能会议室：长桌、两侧支撑、两侧各 4 把椅子与桌面会议屏
  if (kind === '智能会议室') {
    return (
      <>
        <RoundedBox
          position={[0, 0.51, 0]}
          args={[2.65, 0.08, 0.8]}
          radius={0.07}
          smoothness={2}
          castShadow
        >
          <meshStandardMaterial
            color="#bdd4cf"
            roughness={0.65}
          />
        </RoundedBox>
        {[-0.85, 0.85].map((x) => (
          <Box
            key={x}
            position={[x, 0.26, 0]}
            size={[0.12, 0.5, 0.5]}
            color="#7ba4a5"
          />
        ))}
        {[-0.95, -0.32, 0.32, 0.95].flatMap((x) =>
          [-1, 1].map((side) => (
            <Chair
              key={`${x}-${side}`}
              position={[x, 0, side * 0.68]}
              rotation={side === 1 ? 0 : Math.PI}
            />
          )),
        )}
        <Box
          position={[0, 0.6, 0]}
          size={[0.45, 0.015, 0.22]}
          color="#455f67"
        />
      </>
    );
  }
  // 协作空间：卡座沙发、靠背与洽谈桌
  if (kind === '协作空间') {
    return (
      <>
        <Box
          position={[-0.6, 0.2, 0]}
          size={[1.6, 0.32, 0.5]}
          color="#719a98"
        />
        <Box
          position={[-0.6, 0.49, -0.2]}
          size={[1.6, 0.45, 0.13]}
          color="#78a2a0"
        />
        <Box
          position={[0.2, 0.22, 0.65]}
          size={[1, 0.04, 0.55]}
          color="#bdd2c7"
        />
        <Chair
          position={[1, 0.02, 0.35]}
          rotation={-Math.PI / 2}
        />
      </>
    );
  }
  // 默认（开放办公室）：3 列 × 2 排共 6 组工位
  return (
    <>
      {[-1.05, 0, 1.05].flatMap((x) =>
        [-0.8, 0.4].map((z) => (
          <Desk
            key={`${x}-${z}`}
            position={[x, 0, z]}
          />
        )),
      )}
    </>
  );
}
