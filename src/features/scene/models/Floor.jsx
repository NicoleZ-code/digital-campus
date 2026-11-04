/**
 * @file Floor.jsx
 * @description 单层楼层模型：渲染楼板、房间与立面，支持选中与展开动画。
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { MathUtils } from 'three';
import Box from '../primitives/Box.jsx';
import Room from './Room.jsx';
import FacadeBand from './FacadeBand.jsx';
import { getFloorPosition } from '../config/layout.js';

/**
 * 单层楼层模型：渲染楼板、幕墙、房间与标签，选中/展开时有平滑位移动画。
 * @param {number} index - 楼层号（从 1 开始）
 * @param {boolean} selected - 是否为当前选中楼层（高亮并展示房间）
 * @param {boolean} expanded - 楼层是否处于炸开展开状态（level >= 3）
 * @param {function} onFloor - 楼层被点选时的回调，参数为楼层号
 * @param {function} onRoom - 房间被点选时的回调，参数为房间数据对象
 * @param {object|null} room - 当前选中的房间数据对象
 * @param {Array<object>} rooms - 该建筑全部房间数据数组（按 floor 字段过滤本层）
 * @param {boolean} labels - 是否显示楼层/房间 HTML 标签
 * @param {object} building - 所属建筑数据对象（含 id、code）
 * @param {string} layer - 当前图层模式，如 'energy' 能耗图层
 */
export default function Floor({
  index,
  selected,
  expanded,
  onFloor,
  onRoom,
  room,
  rooms,
  labels,
  building,
  layer,
}) {
  const ref = useRef();
  // 楼层动画目标位置：target 为 y 高度，targetX 为 x 横向偏移（展开/选中时位移）。
  const { x: targetX, y: target } = getFloorPosition(index, expanded, selected);
  // 楼层展开后，仅选中的楼层保持可交互。
  useFrame((_, dt) => {
    ref.current.position.y = MathUtils.damp(ref.current.position.y, target, 5, dt);
    ref.current.position.x = MathUtils.damp(ref.current.position.x, targetX, 5, dt);
  });
  return (
    <group
      ref={ref}
      name={`${building.id}-f${index}`}
      userData={{ buildingId: building.id, floorId: `${building.id}-f${index}` }}
      onClick={(e) => {
        if (!expanded || !selected) {
          e.stopPropagation();
          onFloor(index);
        }
      }}
    >
      {/* 楼板：展开且非选中时近乎透明以突出选中层 */}
      <Box
        position={[0, 0, 0]}
        size={[12.5, 0.16, 7.8]}
        color={selected ? '#a2d8cc' : '#789ba4'}
        opacity={expanded && !selected ? 0.065 : 1}
        castShadow={!expanded || selected}
        edge
      />
      {/* 未展开时：渲染幕墙、选中高亮层与楼层标签 */}
      {!expanded && (
        <>
          <FacadeBand
            width={12.4}
            depth={7.7}
            seed={index}
          />
          {selected && (
            <Box
              position={[0, 0.09, 0]}
              size={[12.4, 0.08, 7.7]}
              color="#7cdfc3"
              material={{ emissive: '#62bda8', emissiveIntensity: 0.2 }}
            />
          )}
          {labels && (
            <Html
              position={[6.9, 0.25, 0]}
              center
            >
              <button
                className={`floor-label ${selected ? 'active' : ''}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onFloor(index);
                }}
              >
                {String(index).padStart(2, '0')}F
              </button>
            </Html>
          )}
        </>
      )}
      {/* 展开且选中时：渲染房间、楼层大标签与中轴线 */}
      {expanded && selected && (
        <>
          {labels && (
            <Html
              position={[-6, 1, 4]}
              center
              zIndexRange={[10, 1]}
            >
              <span className="floor-label active">
                {building.code} 座 · {index}F
              </span>
            </Html>
          )}
          {rooms
            .filter((r) => r.floor === index)
            .map((r) => (
              <Room
                key={r.id}
                data={r}
                selected={room?.id === r.id}
                layer={layer}
                labels={labels}
                onSelect={onRoom}
              />
            ))}
          <Line
            points={[
              [-6.1, 0.2, 0],
              [6.1, 0.2, 0],
            ]}
            color="#83ffe2"
            lineWidth={1}
          />
        </>
      )}
    </group>
  );
}
