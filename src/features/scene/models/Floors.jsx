/**
 * @file Floors.jsx
 * @description 楼层组模型：渲染建筑全部楼层与屋顶，协调炸楼展开状态。
 */

import React from 'react';
import { getFloorElevation } from '../config/layout.js';
import Floor from './Floor.jsx';
import Rooftop from './Rooftop.jsx';

/**
 * 楼层组模型：渲染建筑全部楼层（Floor）与屋顶（Rooftop），并依据下钻层级控制展开状态。
 * @param {object} building - 建筑数据对象（含 id、code、floors 等）
 * @param {number} floor - 当前选中的楼层号（1 起），0/未选为无
 * @param {number} level - 当前下钻层级：2 楼栋层（含屋顶）、3 楼层展开、4 房间层
 * @param {function} onFloor - 楼层被点选时的回调，参数为楼层号
 * @param {function} onRoom - 房间被点选时的回调，参数为房间数据对象
 * @param {object|null} room - 当前选中的房间数据对象
 * @param {Array<object>} rooms - 该建筑全部房间数据数组
 * @param {boolean} labels - 是否显示 HTML 标签（房间层 level 4 时隐藏楼层标签）
 * @param {string} layer - 当前图层模式，如 'energy' 能耗图层
 */
export default function Floors({
  building,
  floor,
  level,
  onFloor,
  onRoom,
  room,
  rooms,
  labels,
  layer,
}) {
  return (
    <group>
      {/* 楼栋层级（level 2）时渲染屋顶，抬升至顶层上方 */}
      {level === 2 && (
        <group position={[0, getFloorElevation(building.floors + 1), 0]}>
          <Rooftop
            width={12.4}
            depth={7.7}
          />
        </group>
      )}
      {/* 逐层渲染楼层：level >= 3 时楼层展开，labels 在房间层（level 4）关闭 */}
      {Array.from({ length: building.floors }, (_, i) => (
        <Floor
          key={`${building.id}-${i}`}
          index={i + 1}
          selected={floor === i + 1}
          expanded={level >= 3}
          onFloor={onFloor}
          onRoom={onRoom}
          room={room}
          rooms={rooms}
          labels={labels && level !== 4}
          building={building}
          layer={layer}
        />
      ))}
    </group>
  );
}
