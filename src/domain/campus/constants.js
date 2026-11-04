/**
 * @file constants.js
 * @description 领域常量：层级名称、实体默认 ID 与默认选中状态。
 */

/** 导航层级名称，索引对应 level：0-城市 / 1-园区 / 2-楼宇 / 3-楼层 / 4-房间。 */
export const stageNames = ['城市', '园区', '楼宇', '楼层', '房间'];

/** 层级索引常量，避免代码中出现魔法数字。 */
export const stageLevel = {
  city: 0, // 城市层级
  campus: 1, // 园区层级
  building: 2, // 楼宇层级
  floor: 3, // 楼层层级
  room: 4, // 房间层级
};

/** 默认城市 ID：层级链的根节点，独立于园区存在。 */
export const DEFAULT_CITY_ID = 'city-shanghai';

/** 默认园区 ID：当前演示园区，通过 campusId 与城市关联。 */
export const DEFAULT_CAMPUS_ID = 'campus-haixu';

/** 应用启动时的默认导航选中状态。 */
export const defaultSelection = {
  level: stageLevel.campus, // 当前导航层级（1 = 园区）
  cityId: DEFAULT_CITY_ID, // 当前城市 ID（层级链起点）
  campusId: DEFAULT_CAMPUS_ID, // 当前园区 ID（归属该城市）
  buildingId: 'b-a', // 默认选中的楼宇 ID（归属该园区）
  floor: 6, // 默认选中的楼层
  roomId: 'b-a-f6-r2', // 默认选中的房间 ID
  selectedAssetId: null, // 默认不选中任何设备
};
