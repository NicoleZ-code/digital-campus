/**
 * @file Scene.jsx
 * @description 三维场景根组件：组装 Canvas、地面、建筑群、城市背景、相机与环境效果。
 */

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import Box from './primitives/Box.jsx';
import Ground from './models/Ground.jsx';
import Car from './models/Car.jsx';
import Building from './models/Building.jsx';
import Floors from './models/Floors.jsx';
import City from './models/City.jsx';
import ModelExport from './effects/ModelExport.jsx';
import { getFloorElevation } from './config/layout.js';
import CameraRig from './controls/CameraRig.jsx';
import { canvasCamera } from './config/camera.js';
import SceneEnvironment from './effects/SceneEnvironment.jsx';

/**
 * 三维场景根组件：按导航层级（城市/园区/楼层）切换渲染内容，
 * 并挂载导出、资产标记与相机控制等副作用组件。
 *
 * @param {number} level - 导航层级：0 城市视图、1 园区视图、2 楼层视图、3 楼层俯视、4 房间/资产视图。
 * @param {Object} city - 当前城市实体（含 id、name、geojson 区界数据），仅 level 0 渲染城市地图。
 * @param {Array<Object>} campuses - 城市下辖全部园区（含 id、name、location 经纬度），level 0 渲染园区落点。
 * @param {Array<Object>} buildings - 园区建筑数据列表（含 id 等字段），仅在 level 1 渲染。
 * @param {Object} building - 当前选中建筑对象（含 id、楼层数等），用于高亮比对。
 * @param {number} floor - 当前楼层索引，用于计算楼层标高与相机高度。
 * @param {Array<Object>} rooms - 当前楼层的房间列表。
 * @param {Object} room - 当前选中房间对象，position 为房间平面坐标 [x, z]。
 * @param {Array<Object>} assets - 当前房间内的资产列表（含 id、name、health 等字段），level 4 时渲染标记点。
 * @param {Function} onBuilding - 选中建筑的回调，参数为建筑对象。
 * @param {Function} onFloor - 选中楼层的回调，参数为楼层索引。
 * @param {Function} onRoom - 选中房间的回调，参数为房间对象。
 * @param {Function} onEnter - 城市视图中点击进入园区的回调。
 * @param {boolean} labels - 是否显示场景标签。
 * @param {string} layer - 图层显示模式标识（如建筑/管线等图层开关），透传给 Building/Floors。
 * @param {number} revision - 相机视图刷新版本号，变化时触发相机重新对位。
 * @param {boolean} autoRotate - 是否开启相机自动旋转。
 * @param {Object} [props.exportRequest] - 导出请求对象，变化时触发 GLB 导出。
 * @param {boolean} [props.assetOpen] - 资产面板是否已打开，打开时隐藏 3D 场景中的资产标记点。
 * @param {Function} [props.onAsset] - 点击资产标记点的回调，参数为资产对象。
 * @param {Function} [props.onExportComplete] - 导出结束回调，参数为结果提示文案。
 * @returns {JSX.Element} 渲染 R3F Canvas 场景。
 */
export default function Scene(props) {
  // 场景根 group 引用，导出 GLB 时序列化该节点。
  const modelRef = useRef();
  const {
    level,
    city,
    campuses,
    buildings,
    building,
    floor,
    rooms,
    assets,
    room,
    onBuilding,
    onFloor,
    onRoom,
    onEnter,
    labels,
    layer,
    revision,
    autoRotate,
  } = props;
  return (
    <Canvas
      shadows
      dpr={[1, 1.7]}
      camera={canvasCamera}
      gl={{ antialias: true }}
    >
      <SceneEnvironment />
      <group ref={modelRef}>
        {level === 0 ? (
          // 层级 0（城市层）：渲染城市 GeoJSON 区界与下辖园区落点，点击落点进入园区。
          <City
            geojson={city?.geojson}
            campuses={campuses}
            onEnter={onEnter}
            labels={labels}
          />
        ) : level === 1 ? (
          // 层级 1：园区视图，渲染地面、全部建筑与巡游车辆。
          <>
            <Ground />
            {buildings.map((b) => (
              <Building
                key={b.id}
                data={b}
                selected={building.id === b.id}
                layer={layer}
                onSelect={onBuilding}
                labels={labels}
              />
            ))}
            {/* 三辆偏移量与配色不同的巡游车，错开沿环形路线行驶。 */}
            <Car />
            <Car
              offset={35}
              color="#7ba6b4"
            />
            <Car
              offset={68}
              color="#345d70"
            />
          </>
        ) : (
          // 层级 2/3/4：单栋建筑内部视图，渲染基座与楼层结构。
          <>
            {/* 基座平台：中心位于场景原点，顶部贴齐 y=0。 */}
            <Box
              position={[0, -0.5, 0]}
              size={[15, 0.5, 13]}
              color="#173e49"
              edge
            />
            <Floors
              building={building}
              floor={floor}
              level={level}
              onFloor={onFloor}
              onRoom={onRoom}
              room={room}
              rooms={rooms}
              labels={labels}
              layer={layer}
            />
          </>
        )}
      </group>
      <ModelExport
        request={props.exportRequest}
        modelRef={modelRef}
        onComplete={props.onExportComplete}
      />
      {/* 层级 4 且资产面板未打开时，在房间内渲染资产标记按钮；三组固定偏移保证标记点分散分布。 */}
      {level === 4 &&
        !props.assetOpen &&
        assets.map((a, i) => (
          <Html
            zIndexRange={[10, 1]}
            key={a.id}
            position={[
              // 房间平面坐标加上按资产序号循环的横向偏移。
              room.position[0] + [-1.1, 1.25, 1.77][i % 3],
              // 楼层标高上方 1.7 个场景单位，保证标记悬浮在房间内。
              getFloorElevation(floor) + 1.7,
              room.position[1] + [-1.4, -1.34, 0.85][i % 3],
            ]}
            center
          >
            <button
              className={`asset-pin ${a.health === 'warning' ? 'warning' : ''}`}
              onClick={() => props.onAsset(a)}
              title={a.name}
            >
              {/* 标记点序号，与资产列表顺序对应。 */}
              {i + 1}
            </button>
          </Html>
        ))}
      <CameraRig
        level={level}
        floor={floor}
        room={room}
        revision={revision}
        autoRotate={autoRotate}
      />
    </Canvas>
  );
}
