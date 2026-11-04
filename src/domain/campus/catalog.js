/**
 * @file catalog.js
 * @description 层级目录索引：建立城市→园区→楼宇→房间→设备的实体索引，并按选择请求解析上下文。
 */

/**
 * 创建规范化的层级目录索引。
 * 保留原始数组，并额外按 id 建立 Map 索引便于快速查找。
 * @param {Object} [data] - 原始数据集合。
 * @param {?Object} [data.city] - 城市实体，需含 id 字段，可含 geojson。
 * @param {?Object} [data.campus] - 当前园区实体，需含 id、cityId 字段。
 * @param {Array<Object>} [data.campuses] - 城市下辖全部园区，默认回退为 [campus]。
 * @param {Array<Object>} [data.buildings] - 楼宇集合，元素需含 campusId。
 * @param {Array<Object>} [data.rooms] - 房间集合，元素需含 campusId、buildingId。
 * @param {Array<Object>} [data.assets] - 设备集合，元素需含 campusId、roomId。
 * @param {Array<Object>} [data.alerts] - 告警集合，元素需含 campusId。
 * @returns {{city: ?Object, campus: ?Object, campuses: Array<Object>, buildings: Array<Object>, rooms: Array<Object>, assets: Array<Object>, alerts: Array<Object>, campusesById: Map<string, Object>, buildingsById: Map<string, Object>, roomsById: Map<string, Object>, assetsById: Map<string, Object>}} 目录对象，含原始数据、城市/园区实体与按 id 的索引。
 */
export function createCatalog({
  city = null,
  campus = null,
  campuses = [],
  buildings = [],
  rooms = [],
  assets = [],
  alerts = [],
} = {}) {
  // 园区列表：优先使用显式传入的 campuses，否则用单个 campus 兜底
  const campusList = campuses.length ? campuses : campus ? [campus] : [];
  return {
    city,
    campus,
    campuses: campusList,
    buildings,
    rooms,
    assets,
    alerts,
    campusesById: new Map(campusList.map((item) => [item.id, item])),
    buildingsById: new Map(buildings.map((item) => [item.id, item])),
    roomsById: new Map(rooms.map((item) => [item.id, item])),
    assetsById: new Map(assets.map((item) => [item.id, item])),
  };
}

/**
 * 根据请求的选择项解析当前上下文，非法或缺失的选择自动回退到合法值。
 * 回退规则：园区取请求园区或默认园区；楼宇仅在当前园区内取首个；楼层夹取到 [1, 楼宇层数]；
 * 房间取该楼层首个房间；设备取选中设备或 null；level 随之修正（无园区回到城市层，无楼宇回到园区层）。
 * @param {ReturnType<createCatalog>} catalog - 由 createCatalog 创建的目录索引。
 * @param {Object} requested - 请求的导航选择。
 * @param {?string} requested.cityId - 请求的城市 ID。
 * @param {?string} requested.campusId - 请求的园区 ID。
 * @param {?string} requested.buildingId - 请求的楼宇 ID。
 * @param {number} requested.floor - 请求的楼层号。
 * @param {?string} requested.roomId - 请求的房间 ID。
 * @param {?string} requested.selectedAssetId - 请求选中的设备 ID。
 * @param {number} requested.level - 请求的导航层级。
 * @returns {{selection: Object, city: ?Object, campus: ?Object, building: ?Object, rooms: Array<Object>, room: ?Object, assets: Array<Object>, asset: ?Object}} 修正后的选择状态及解析出的城市、园区、楼宇、房间列表、房间、设备列表与选中设备。
 */
export function resolveContext(catalog, requested) {
  const campus =
    catalog.campusesById.get(requested.campusId) ?? catalog.campus ?? catalog.campuses[0] ?? null;
  // 城市由园区反查，保证 selection 中的 cityId 与园区归属一致
  const city = catalog.city && (!campus || campus.cityId === catalog.city.id) ? catalog.city : null;
  // 仅在当前园区范围内解析楼宇，避免跨园区串数据
  const scopedBuildings = campus
    ? catalog.buildings.filter((item) => item.campusId === campus.id)
    : catalog.buildings;
  const building =
    scopedBuildings.find((item) => item.id === requested.buildingId) ?? scopedBuildings[0] ?? null;
  const floor = building
    ? Math.min(
        Math.max(Number.isInteger(requested.floor) ? requested.floor : 1, 1),
        building.floors,
      )
    : 1;
  const rooms = building
    ? catalog.rooms.filter(
        (item) =>
          item.buildingId === building.id &&
          item.floor === floor &&
          (!campus || item.campusId === campus.id),
      )
    : [];
  const room = rooms.find((item) => item.id === requested.roomId) ?? rooms[0] ?? null;
  const assets = room
    ? catalog.assets.filter(
        (item) => item.roomId === room.id && (!campus || item.campusId === campus.id),
      )
    : [];
  const asset = assets.find((item) => item.id === requested.selectedAssetId) ?? null;
  // 层级回退：无园区锚定城市层（0），无楼宇锚定园区层（1），房间缺失时最高只到楼宇层（2）
  let level = requested.level;
  if (!campus) {
    level = 0;
  } else if (!building) {
    level = 1;
  } else if (!room && requested.level >= 3) {
    level = 2;
  }
  return {
    selection: {
      ...requested,
      cityId: city?.id ?? null,
      campusId: campus?.id ?? null,
      buildingId: building?.id ?? null,
      floor,
      roomId: room?.id ?? null,
      selectedAssetId: asset?.id ?? null,
      level,
    },
    city,
    campus,
    building,
    rooms,
    room,
    assets,
    asset,
  };
}
