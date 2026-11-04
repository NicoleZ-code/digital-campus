/**
 * @file City.jsx
 * @description 城市场景模型：按城市 GeoJSON 渲染行政区界，并标注该城市下辖的各个园区落点。
 */

import React, { useMemo } from 'react';
import { Edges, Html, Line } from '@react-three/drei';
import { Shape, Path, CatmullRomCurve3, Vector3, DoubleSide } from 'three';
import { projectShanghai, huangpuRiver, parkCoordinate } from '../config/geography.js';
import BatchBoxes from '../primitives/BatchBoxes.jsx';
import Box from '../primitives/Box.jsx';

/**
 * 单个行政区模型：将 GeoJSON 多边形转为 Shape 后挤出成体块并描边。
 * @param {object} feature - GeoJSON 地图要素（geometry.coordinates 为多边形环数组）
 * @param {number} index - 行政区序号，用于颜色轮换
 */
function District({ feature, index }) {
  // 每个多边形（外环 + 内环洞）投影为 three.js 的 Shape 对象。
  const shapes = useMemo(
    () =>
      feature.geometry.coordinates.map((polygon) => {
        const shape = new Shape(
          polygon[0].map((p) => {
            const [x, y] = projectShanghai(p);
            return { x, y };
          }),
        );
        polygon.slice(1).forEach((ring) =>
          shape.holes.push(
            new Path(
              ring.map((p) => {
                const [x, y] = projectShanghai(p);
                return { x, y };
              }),
            ),
          ),
        );
        return shape;
      }),
    [feature],
  );
  return (
    <group name={feature.properties.name}>
      <mesh
        castShadow
        receiveShadow
      >
        <extrudeGeometry
          args={[
            shapes,
            {
              depth: 0.65,
              bevelEnabled: true,
              bevelSegments: 1,
              steps: 1,
              bevelSize: 0.015,
              bevelThickness: 0.02,
            },
          ]}
        />
        <meshStandardMaterial
          color={index % 3 === 0 ? '#205460' : index % 3 === 1 ? '#19434f' : '#285864'}
          metalness={0.4}
          roughness={0.45}
        />
        <Edges
          color="#51919e"
          threshold={30}
        />
      </mesh>
      {shapes.map((shape, i) => (
        <Line
          key={i}
          points={shape.getPoints().map((p) => [p.x, p.y, 0.68])}
          color="#69aab6"
          lineWidth={0.65}
        />
      ))}
    </group>
  );
}

/**
 * 插画风城市天际线：程序化生成的 130 栋背景建筑群与东方明珠等标志物。
 */
function Skyline() {
  // 背景建筑块数组：13 列 × 10 行网格排布，高度（z 向）随序号变化，颜色每 4 栋点缀一栋亮色。
  const blocks = useMemo(
    () =>
      Array.from({ length: 130 }, (_, i) => {
        const x = ((i % 13) - 6) * 0.32,
          y = (Math.floor(i / 13) - 5) * 0.32;
        return {
          position: [x, y, 0.78 + (i % 7) * 0.055],
          size: [0.13 + (i % 3) * 0.025, 0.16, 0.2 + (i % 7) * 0.11],
          color: i % 4 ? '#52848e' : '#76c8c7',
        };
      }),
    [],
  );
  return (
    <group name="illustrative-city-skyline">
      <BatchBoxes items={blocks} />
      {/* 东方明珠地标：球体塔、双球与塔身 */}
      <group position={[0.75, -0.2, 0.7]}>
        <mesh
          position={[0, 0, 1.2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.075, 0.13, 2.4, 20]} />
          <meshStandardMaterial
            color="#7cc4c5"
            metalness={0.7}
            roughness={0.22}
          />
        </mesh>
        {[0.65, 1.6].map((z, i) => (
          <mesh
            key={z}
            position={[0, 0, z]}
          >
            <sphereGeometry args={[i ? 0.16 : 0.26, 20, 16]} />
            <meshStandardMaterial
              color="#a3dddd"
              metalness={0.6}
              roughness={0.2}
            />
          </mesh>
        ))}
        <Box
          position={[0.5, 0, 0.9]}
          size={[0.23, 0.23, 1.8]}
          color="#659ba6"
        />
        {/* 另一座锥形高塔建筑 */}
        <mesh
          position={[1, 0.15, 1.1]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.08, 0.22, 2.2, 6]} />
          <meshStandardMaterial
            color="#8dbfc6"
            metalness={0.65}
            roughness={0.25}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 格式化园区经纬度展示文本。
 * @param {{longitude: number, latitude: number}} location - 园区经纬度（度）
 * @returns {string} 形如 `31.2453° N · 121.5057° E` 的坐标文本
 */
function formatLocation(location) {
  if (!location) {
    return '';
  }
  const { longitude, latitude } = location;
  return `${latitude.toFixed(4)}° N · ${longitude.toFixed(4)}° E`;
}

/**
 * 城市场景模型：按城市 GeoJSON 渲染行政区界，叠加黄浦江、天际线，并标注下辖园区落点。
 * @param {Object} geojson - 城市区界 GeoJSON（FeatureCollection，来自 city.geojson）
 * @param {Array<Object>} [campuses] - 城市下辖园区列表，元素需含 id、name、location.longitude/latitude
 * @param {Function} onEnter - 点击园区标记时的回调，参数为被点击的园区对象
 * @param {boolean} [labels=true] - 是否显示区名 HTML 标签
 */
export default function City({ geojson, campuses = [], onEnter, labels = true }) {
  // 区界要素：GeoJSON 缺失时退化为空数组，仍渲染江面与天际线
  const features = geojson?.features ?? [];
  // 黄浦江河道：由折线坐标构造平滑样条曲线（tubeGeometry 用）。
  const river = useMemo(
    () => new CatmullRomCurve3(huangpuRiver.map(([x, y]) => new Vector3(x, y, 0.73))),
    [],
  );
  // 园区落点：有园区数据时按其经纬度投影，否则回退到演示公园点位
  const markers = useMemo(
    () =>
      campuses.length
        ? campuses.map((item) => ({
            campus: item,
            position: projectShanghai([item.location.longitude, item.location.latitude]),
          }))
        : [{ campus: null, position: projectShanghai(parkCoordinate) }],
    [campuses],
  );
  return (
    // 整组绕 x 轴旋转 -90°，把平面坐标（xy）平铺为地面朝向
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* 各行政区体块 */}
      {features.map((feature, index) => (
        <District
          key={feature.properties.adcode}
          feature={feature}
          index={index}
        />
      ))}
      {/* 黄浦江河道 */}
      <mesh>
        <tubeGeometry args={[river, 100, 0.055, 8, false]} />
        <meshStandardMaterial
          color="#68bbcd"
          emissive="#255762"
          emissiveIntensity={0.4}
          metalness={0.4}
          roughness={0.18}
        />
      </mesh>
      <Skyline />
      {/* 以园区为中心的三圈半径标尺环 */}
      {[2.5, 4.5, 7].map((radius) => (
        <mesh
          key={radius}
          position={[0, 0, 0.76]}
        >
          <ringGeometry args={[radius, radius + 0.012, 100]} />
          <meshBasicMaterial
            color="#5796a0"
            transparent
            opacity={0.3}
            side={DoubleSide}
          />
        </mesh>
      ))}
      {/* 三组斜向连接线与节点圆点，示意园区与周边的联系 */}
      {[-3, 0, 3].map((v, i) => (
        <React.Fragment key={v}>
          <Line
            points={[
              [-8, v, 0.72],
              [7, v + 1, 0.72],
            ]}
            color="#4d919b"
            lineWidth={0.7}
            transparent
            opacity={0.45}
          />
          <Line
            points={[
              [v, -8, 0.72],
              [v + 1, 9, 0.72],
            ]}
            color="#4d919b"
            lineWidth={0.7}
            transparent
            opacity={0.45}
          />
          <mesh position={[v, v + 1, 0.76]}>
            <circleGeometry args={[0.055, 12]} />
            <meshBasicMaterial color={i % 2 ? '#80f5df' : '#4c9cac'} />
          </mesh>
        </React.Fragment>
      ))}
      {/* 园区落点标记：每个园区一组光环 + 竖向引线 + HTML 地图钉 */}
      {markers.map(({ campus: item, position }, index) => (
        <React.Fragment key={item?.id ?? `marker-${index}`}>
          <mesh position={[position[0], position[1], 0.8]}>
            <ringGeometry args={[0.28, 0.34, 48]} />
            <meshBasicMaterial
              color="#8affde"
              side={DoubleSide}
            />
          </mesh>
          <Line
            points={[
              [position[0], position[1], 0.8],
              [position[0], position[1], 3.3],
            ]}
            color="#8affe0"
            lineWidth={1.5}
          />
          <Html
            position={[position[0], position[1], 3.6]}
            center
          >
            <button
              className="map-pin"
              onClick={() => onEnter?.(item)}
            >
              <span className="pulse-dot" />
              {item?.name ?? '示例园区'}
              <small>{formatLocation(item?.location) || '演示落点'}</small>
              <b>进入园区 ↗</b>
            </button>
          </Html>
        </React.Fragment>
      ))}
      {/* 8 个郊区的区名标签（以区中心坐标定位） */}
      {labels &&
        features
          .filter((f) =>
            [
              '浦东新区',
              '崇明区',
              '嘉定区',
              '青浦区',
              '松江区',
              '奉贤区',
              '金山区',
              '宝山区',
            ].includes(f.properties.name),
          )
          .map((f) => {
            const p = projectShanghai(f.properties.centroid || f.properties.center);
            return (
              <Html
                key={f.properties.adcode}
                position={[p[0], p[1], 0.85]}
                center
              >
                <span className="district-label">{f.properties.name}</span>
              </Html>
            );
          })}
    </group>
  );
}
