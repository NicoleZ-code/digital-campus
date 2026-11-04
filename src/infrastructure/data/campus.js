/**
 * @file campus.js
 * @description 园区静态演示数据：城市（含 GeoJSON）、园区（含经纬度）、楼宇、房间、设备与告警的生成逻辑。
 */

import { DEFAULT_CAMPUS_ID, DEFAULT_CITY_ID } from '../../domain/campus/constants.js';
import cityGeoJson from './geo/shanghai-districts.json' with { type: 'json' };
import { getRoomPosition } from './roomLayouts.js';

/**
 * 城市实体：层级链的根节点，独立存在，可下挂多个园区。
 * id 使用 `city-` 前缀，与园区 ID 分离，业务通过 cityId 关联而非解析字符串。
 * geojson 为该城市的行政区界数据（FeatureCollection），供城市场景渲染与范围校验使用。
 */
export const city = {
  id: DEFAULT_CITY_ID, // 城市唯一 ID：city-shanghai
  name: '上海', // 城市名称
  center: [121.5, 31.25], // 城市中心经纬度 [经度, 纬度]
  timezone: 'Asia/Shanghai', // 时区标识
  geojson: cityGeoJson, // 城市行政区界 GeoJSON（16 个区，FeatureCollection）
};

/**
 * 园区实体：通过 cityId 归属城市，建筑通过 campusId 归属本园区。
 * id 独立于城市 ID 生成，园区迁移或同城多园区时无需改动下级 ID。
 * 经纬度用 location 表达（园区在城市地图上的落点），场景坐标由经纬度投影得到。
 */
export const campus = {
  id: DEFAULT_CAMPUS_ID, // 园区唯一 ID：campus-haixu
  cityId: city.id, // 所属城市 ID（外键）
  name: '海序数字园区', // 园区名称
  district: '浦东新区', // 所在行政区
  location: {
    longitude: 121.5057, // 园区中心经度（度，东经为正）
    latitude: 31.2453, // 园区中心纬度（度，北纬为正）
  },
};

/**
 * 城市下辖的全部园区：城市层指标按该列表聚合，园区层仅取当前园区。
 * 演示环境只配置一个园区，结构与多园区场景保持一致。
 */
export const campuses = [campus];

/**
 * 静态建筑主数据，用于演示建筑列表与建筑地图。
 * 每栋楼宇通过 campusId 归属园区。
 */
export const buildings = [
  {
    id: 'b-a', // 楼宇唯一 ID
    campusId: campus.id, // 所属园区 ID（外键）
    code: 'A', // 楼宇简称编码
    name: '海序中心', // 楼宇名称
    use: '运营办公', // 用途类型
    floors: 12, // 总层数
    position: [-7, 0, -5], // 三维空间中的基点坐标 [x, y, z]
    size: [6, 6], // 平面尺寸 [宽, 深]
    color: '#68ead5', // 展示颜色
  },
  {
    id: 'b-b', // 楼宇唯一 ID
    campusId: campus.id, // 所属园区 ID（外键）
    code: 'B', // 楼宇简称编码
    name: '北岸数据楼', // 楼宇名称
    use: '数据运维', // 用途类型
    floors: 8, // 总层数
    position: [5, 0, -5], // 三维空间中的基点坐标 [x, y, z]
    size: [7, 5], // 平面尺寸 [宽, 深]
    color: '#7bbbe8', // 展示颜色
  },
  {
    id: 'b-c', // 楼宇唯一 ID
    campusId: campus.id, // 所属园区 ID（外键）
    code: 'C', // 楼宇简称编码
    name: '云栖研发楼', // 楼宇名称
    use: '研发创新', // 用途类型
    floors: 6, // 总层数
    position: [4, 0, 7], // 三维空间中的基点坐标 [x, y, z]
    size: [8, 5], // 平面尺寸 [宽, 深]
    color: '#b1d898', // 展示颜色
  },
];

/**
 * 确定性生成指定楼宇、楼层的 6 个演示房间（同名模板），用于房间列表与房间地图。
 * @param {string} buildingId - 楼宇 ID。
 * @param {number} floor - 楼层号。
 * @returns {Array<Object>} 房间数组，含 id、campusId、buildingId、floorId、floor、name、number、area、position、energy、warning 字段。
 */
export const createMockRooms = (buildingId, floor) =>
  ['开放办公区', '智能会议室', '设备机房', '协作空间', '培训室', '值班室'].map((name, i) => ({
    id: `${buildingId}-f${floor}-r${i + 1}`,
    campusId: campus.id, // 所属园区 ID（外键）
    buildingId,
    floorId: `${buildingId}-f${floor}`,
    floor,
    name,
    number: `${floor}0${i + 1}`,
    area: [168, 56, 42, 86, 96, 64][i],
    position: getRoomPosition(buildingId, floor, i),
    energy: [128, 36, 242, 64, 78, 44][i] + floor * 3,
    warning: i === 1 && floor === 6 && buildingId === 'b-a',
  }));

/**
 * 确定性生成指定房间内的 3 个演示设备（空调、空气质量传感器、照明控制器），用于资产列表与资产地图。
 * @param {Object} room - 房间对象，需含 id、campusId、name、warning 字段。
 * @returns {Array<Object>} 设备数组，含 id、campusId、roomId、name、type、value、unit、connectivity、health、power、powerUnit 字段。
 */
export const createMockAssets = (room) => [
  {
    id: `${room.id}-a1`,
    campusId: room.campusId, // 继承所属房间的园区 ID
    roomId: room.id,
    name: room.name === '设备机房' ? '精密空调' : '智能空调',
    type: '环境设备',
    value: 24.6,
    unit: '°C',
    connectivity: 'online',
    health: 'normal',
    power: 2.4,
    powerUnit: 'kW',
  },
  {
    id: `${room.id}-a2`,
    campusId: room.campusId, // 继承所属房间的园区 ID
    roomId: room.id,
    name: '空气质量传感器',
    type: '环境感知',
    value: room.warning ? 1430 : 486,
    unit: 'ppm',
    connectivity: 'online',
    health: room.warning ? 'warning' : 'normal',
    power: 0.02,
    powerUnit: 'kW',
  },
  {
    id: `${room.id}-a3`,
    campusId: room.campusId, // 继承所属房间的园区 ID
    roomId: room.id,
    name: '智能照明控制器',
    type: '照明设备',
    value: 420,
    unit: 'lx',
    connectivity: 'online',
    health: 'normal',
    power: 0.18,
    powerUnit: 'kW',
  },
];

/**
 * 静态告警数据，用于演示告警列表与告警地图。
 * 通过 campusId + buildingId + floor + roomId + assetId 逐级关联。
 */
export const alerts = [
  {
    id: 'alert-1', // 告警唯一 ID
    campusId: campus.id, // 所属园区 ID（外键）
    buildingId: 'b-a', // 所属楼宇 ID
    floor: 6, // 所属楼层号
    roomId: 'b-a-f6-r2', // 所属房间 ID
    assetId: 'b-a-f6-r2-a2', // 触发告警的设备 ID
    title: '空气质量超出阈值', // 告警标题
    summary: 'A 座 602 · CO₂ 1430 ppm', // 摘要信息
    detail: 'A 座 · 602 智能会议室', // 详情定位描述
    time: '14:27', // 告警时间
    severity: '一般', // 严重级别
  },
];
