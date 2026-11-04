/**
 * @file Building.jsx
 * @description 单栋建筑模型：渲染楼体、幕墙与屋顶，支持悬停、点选与能耗图层着色。
 */

import React, { useState } from 'react';
import { useCursor, Html } from '@react-three/drei';
import Box from '../primitives/Box.jsx';
import FacadeBand from './FacadeBand.jsx';
import Rooftop from './Rooftop.jsx';
import { FLOOR_HEIGHT } from '../config/architecture.js';

/**
 * 单栋建筑模型：渲染台基、入口台阶、楼体、幕墙、屋顶与选中/悬停高亮。
 * @param {object} data - 建筑数据对象（含 id、name、code、use、position、size、floors、color、energy 等字段）
 * @param {boolean} selected - 是否为当前选中建筑（显示高亮描边与标签选中态）
 * @param {string} layer - 当前图层模式，'energy' 表示能耗图层（高能耗建筑换色显示）
 * @param {function} onSelect - 建筑被点选时的回调，参数为建筑 id
 * @param {boolean} labels - 是否显示建筑 HTML 标签
 */
export default function Building({ data, selected, layer, onSelect, labels }) {
  const [hover, setHover] = useState(false);
  useCursor(hover);
  // 楼体尺寸：size 为 [宽(x 横向), 深(z 纵深)]，height 由楼层数 × 单层高度得出（y 轴）。
  const [width, depth] = data.size;
  const height = data.floors * FLOOR_HEIGHT;
  // 能耗图层下高能耗建筑（>9000）改用暖色强调，否则使用建筑原色。
  const accent = layer === 'energy' ? (data.energy > 9000 ? '#dba66b' : data.color) : data.color;
  return (
    <group
      name={data.id}
      userData={{ buildingId: data.id }}
      position={data.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id);
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* 建筑台基（略大于楼体） */}
      <Box
        position={[0, 0.1, 0]}
        size={[width + 1.6, 0.2, depth + 1.6]}
        color="#819b9f"
      />
      {/* 正入口三级台阶，沿 z 轴正方向逐级抬升并内缩 */}
      {[0, 1, 2].map((step) => (
        <Box
          key={step}
          position={[0, 0.16 + step * 0.07, depth / 2 + 0.45 - step * 0.15]}
          size={[width * 0.48, 0.12, 0.9 - step * 0.2]}
          color="#a8bfc0"
        />
      ))}
      {/* 楼体主体体块 */}
      <Box
        position={[0, height / 2 + 0.3, 0]}
        size={[width - 0.07, height, depth - 0.07]}
        color="#163843"
        material={{ roughness: 0.28, metalness: 0.48 }}
      />
      {/* 逐层渲染幕墙（FacadeBand），seed 传层号使各层窗格略有差异 */}
      {Array.from({ length: data.floors }, (_, i) => (
        <group
          key={i}
          position={[0, 0.3 + i * FLOOR_HEIGHT, 0]}
        >
          <FacadeBand
            width={width}
            depth={depth}
            seed={i}
          />
        </group>
      ))}
      <group position={[0, 0.3 + height, 0]}>
        <Rooftop
          width={width}
          depth={depth}
        />
      </group>
      {/* 入口玻璃门 */}
      <Box
        position={[0, 0.85, depth / 2 + 0.035]}
        size={[1.4, 1.05, 0.08]}
        color="#3d8e9b"
        material={{ metalness: 0.65, roughness: 0.12 }}
      />
      {/* 门中缝 */}
      <Box
        position={[0, 0.85, depth / 2 + 0.09]}
        size={[0.04, 1.05, 0.04]}
        color="#b0cece"
      />
      {/* 入口雨棚 */}
      <Box
        position={[0, 1.45, depth / 2 + 0.4]}
        size={[2.3, 0.07, 0.9]}
        color="#81bac1"
        material={{ roughness: 0.15, metalness: 0.7 }}
      />
      {/* 雨棚两侧支撑柱 */}
      {[-1, 1].map((side) => (
        <Box
          key={side}
          position={[side * 1.02, 0.85, depth / 2 + 0.72]}
          size={[0.045, 1.2, 0.045]}
          color="#96b7bd"
        />
      ))}
      {/* 选中或悬停时，沿台基四周绘制高亮描边 */}
      {(selected || hover) && (
        <group>
          {[-1, 1].map((side) => (
            <React.Fragment key={side}>
              <Box
                position={[0, 0.24, side * (depth / 2 + 0.6)]}
                size={[width + 1.2, 0.025, 0.025]}
                color={accent}
                material={{ emissive: accent, emissiveIntensity: 0.7 }}
              />
              <Box
                position={[side * (width / 2 + 0.6), 0.24, 0]}
                size={[0.025, 0.025, depth + 1.2]}
                color={accent}
                material={{ emissive: accent, emissiveIntensity: 0.7 }}
              />
            </React.Fragment>
          ))}
        </group>
      )}
      {labels && (
        <Html
          position={[0, height + 2, 0]}
          center
          distanceFactor={48}
        >
          <button
            className={`building-label ${selected ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(data.id);
            }}
          >
            <b style={{ color: data.color }}>{data.code}</b>
            <span>
              {data.name}
              <small>
                {data.floors}F · {data.use}
              </small>
            </span>
            <span>↗</span>
          </button>
        </Html>
      )}
    </group>
  );
}
