/**
 * @file metrics.js
 * @description 领域指标计算：汇总设备状态、房间面积与能耗等统计信息。
 */

/**
 * 汇总设备状态统计。
 * 先按 id 去重，再统计在线、离线与告警数量，并计算在线率（百分比，保留一位小数）。
 * @param {Array<Object>} assets - 设备数组，元素需含 id、connectivity（online/offline）、health（normal/warning）字段。
 * @returns {{assets: number, onlineCount: number, offlineCount: number, warningCount: number, online: number}} 设备总数、在线数、离线数、告警数与在线率百分比。
 */
export function summarizeAssets(assets = []) {
  const unique = [...new Map(assets.map((asset) => [asset.id, asset])).values()];
  const onlineCount = unique.filter((asset) => asset.connectivity === 'online').length;
  return {
    assets: unique.length,
    onlineCount,
    offlineCount: unique.filter((asset) => asset.connectivity === 'offline').length,
    warningCount: unique.filter((asset) => asset.health === 'warning').length,
    online: unique.length ? Math.round((onlineCount / unique.length) * 1000) / 10 : 0,
  };
}

/**
 * 汇总一组房间的总面积、总能耗及其关联设备的状态统计。
 * @param {Array<Object>} rooms - 房间数组，元素需含 id、area、energy 字段。
 * @param {Array<Object>} assets - 设备数组，仅统计 roomId 属于 rooms 集合的设备。
 * @returns {{area: number, energy: number} & ReturnType<summarizeAssets>} 房间总面积、总能耗，叠加 summarizeAssets 的设备统计结果。
 */
export function summarizeRooms(rooms = [], assets = []) {
  const ids = new Set(rooms.map((room) => room.id));
  return {
    area: rooms.reduce((sum, room) => sum + room.area, 0),
    energy: rooms.reduce((sum, room) => sum + room.energy, 0),
    ...summarizeAssets(assets.filter((asset) => ids.has(asset.roomId))),
  };
}

/**
 * 按当前导航层级筛选房间范围，计算页面上下文指标。
 * 层级规则：
 * - level 0（城市层）：统计该城市下辖的全部园区，多个园区合并为城市口径；
 * - level 1（园区层）：只统计当前园区；
 * - level 2 限当前楼宇；level 3 限当前楼层；level >= 4 仅当前房间。
 * @param {Object} context - 上下文参数。
 * @param {number} context.level - 导航层级（0-4，见 stageNames）。
 * @param {?Object} [context.city] - 当前城市，需含 id 字段；提供时按 cityId 过滤园区列表。
 * @param {?Object} [context.campus] - 当前园区，需含 id 字段。
 * @param {Array<Object>} [context.campuses] - 城市下辖全部园区；城市层按该列表聚合。
 * @param {?Object} context.building - 当前选中楼宇，需含 id 字段。
 * @param {number} context.floor - 当前选中楼层号。
 * @param {?Object} context.room - 当前选中房间，需含 id 字段。
 * @param {Array<Object>} [context.allRooms] - 全部房间集合。
 * @param {Array<Object>} [context.allAssets] - 全部设备集合。
 * @returns {ReturnType<summarizeRooms>} 该范围内的面积、能耗与设备统计。
 */
export function getContextMetrics({
  level,
  city = null,
  campus = null,
  campuses = [],
  building,
  floor,
  room,
  allRooms = [],
  allAssets = [],
}) {
  // 园区列表：优先使用传入的全量列表，否则退化为当前园区
  const campusList = campuses.length ? campuses : campus ? [campus] : [];
  // 城市层的园区范围：仅保留归属该城市的园区
  const cityCampuses = city
    ? campusList.filter((item) => !item.cityId || item.cityId === city.id)
    : campusList;
  // 统计边界：城市层覆盖全部园区，园区层仅覆盖当前园区；无园区信息时不限制
  const scopedIds =
    level === 0
      ? new Set(cityCampuses.map((item) => item.id))
      : campus
        ? new Set([campus.id])
        : new Set();
  const scope = allRooms.filter((item) => {
    // 园区边界优先：不在统计范围内的园区房间不参与汇总
    if (scopedIds.size && !scopedIds.has(item.campusId)) {
      return false;
    }
    if (level < 2) {
      return true;
    }
    if (!building || item.buildingId !== building.id) {
      return false;
    }
    if (level === 2) {
      return true;
    }
    if (item.floor !== floor) {
      return false;
    }
    return level === 3 || item.id === room?.id;
  });
  return summarizeRooms(scope, allAssets);
}
