/**
 * @file createCampusRepository.js
 * @description 创建带订阅能力的内存园区数据仓储，负责数据校验与快照管理。
 */

import { summarizeRooms } from '../../domain/campus/metrics.js';

// 缓存快照引用，仅 replaceData 时更换；用于 React useSyncExternalStore。
/**
 * 创建带订阅能力的内存园区数据仓储。
 * 内部对传入数据做合法性过滤（城市-园区归属、楼层范围、房间归属等），生成不可变快照并通过监听器通知订阅方。
 * @param {object} [initialData] - 初始完整园区数据快照
 * @param {?object} [initialData.city] - 城市实体，需含字符串 id，可含 geojson
 * @param {?object} [initialData.campus] - 当前园区实体，需含字符串 id 且 cityId 与城市一致（无城市时不校验）
 * @param {Array<object>} [initialData.campuses] - 城市下辖全部园区；提供时优先于 campus，园区归属需与城市一致
 * @param {Array<object>} [initialData.buildings] - 楼宇列表，需含字符串 id、campusId 与正整数 floors
 * @param {Array<object>} [initialData.rooms] - 房间列表，campusId 需与园区一致，buildingId/floor 需匹配有效楼宇
 * @param {Array<object>} [initialData.assets] - 资产列表，campusId 与 roomId 需匹配有效房间
 * @param {Array<object>} [initialData.alerts] - 告警列表，campusId、房间、楼层、资产需与有效数据一致
 * @returns {object} 仓储实例
 * @returns {() => object} returns.getSnapshot - 获取当前数据快照（含 city/campus，引用稳定，供 useSyncExternalStore 使用）
 * @returns {(listener: Function) => () => void} returns.subscribe - 订阅数据变更，返回取消订阅函数
 * @returns {(data: object) => void} returns.replaceData - 校验并整体替换快照数据，随后通知所有订阅方
 * @returns {() => Array<object>} returns.listBuildings - 获取全部楼宇（含汇总指标）
 * @returns {() => Array<object>} returns.listAlerts - 获取全部有效告警
 * @returns {(buildingId: string, floor: number) => Array<object>} returns.getRooms - 获取指定楼宇指定楼层的房间
 * @returns {(room: object|null) => Array<object>} returns.getAssets - 获取指定房间内的资产，room 为空时返回空数组
 */
export function createCampusRepository(initialData = {}) {
  const listeners = new Set();
  let snapshot;

  /**
   * 校验并整体替换快照数据。
   * 按层级逐级过滤（城市 → 园区列表 → 楼宇 → 房间 → 资产 → 告警），为房间补充 warning 标记、为楼宇补充汇总指标。
   * @param {object} [data] - 完整层级数据
   * @param {?object} [data.city] - 城市实体
   * @param {?object} [data.campus] - 当前园区实体
   * @param {Array<object>} [data.campuses] - 城市下辖全部园区
   * @param {Array<object>} [data.buildings] - 楼宇列表
   * @param {Array<object>} [data.rooms] - 房间列表
   * @param {Array<object>} [data.assets] - 资产列表
   * @param {Array<object>} [data.alerts] - 告警列表
   * @returns {void}
   */
  function replaceData({
    city = null,
    campus = null,
    campuses = [],
    buildings = [],
    rooms = [],
    assets = [],
    alerts = [],
  } = {}) {
    // 城市校验：id 必须为非空字符串
    const validCity = city && typeof city.id === 'string' && city.id.length > 0 ? city : null;
    // 园区校验：id 合法，且声明了 cityId 时必须与城市一致
    const isValidCampus = (item) =>
      Boolean(
        item &&
        typeof item.id === 'string' &&
        item.id.length > 0 &&
        (!validCity || !item.cityId || item.cityId === validCity.id),
      );
    // 园区列表：优先取 campuses，其次回退单个 campus
    const declaredCampuses = campuses.length ? campuses : campus ? [campus] : [];
    const validCampuses = declaredCampuses.filter(isValidCampus);
    const campusIds = new Set(validCampuses.map((item) => item.id));
    // 当前园区：默认取列表首个
    const validCampus =
      validCampuses.find((item) => item.id === campus?.id) ?? validCampuses[0] ?? null;
    // 未提供任何园区时不做园区归属过滤（兼容仅传扁平数据的调用方）
    const hasCampusScope = campusIds.size > 0;
    // 过滤合法楼宇：id 为字符串、floors 为正整数，且归属当前城市的某个园区
    const validBuildings = buildings.filter(
      (item) =>
        typeof item.id === 'string' &&
        Number.isInteger(item.floors) &&
        item.floors > 0 &&
        (!hasCampusScope || campusIds.has(item.campusId)),
    );
    // 楼宇 id -> 楼宇对象映射，供房间校验使用
    const byId = new Map(validBuildings.map((item) => [item.id, item]));
    // 过滤合法房间：园区一致、所属楼宇存在且楼层在楼宇范围内
    const validRooms = rooms.filter(
      (item) =>
        byId.has(item.buildingId) &&
        (!hasCampusScope || campusIds.has(item.campusId)) &&
        Number.isInteger(item.floor) &&
        item.floor > 0 &&
        item.floor <= byId.get(item.buildingId).floors,
    );
    // 有效房间 id 集合，供资产校验使用
    const roomIds = new Set(validRooms.map((item) => item.id));
    // 过滤合法资产：园区一致且 roomId 指向有效房间
    const validAssets = assets.filter(
      (item) => roomIds.has(item.roomId) && (!hasCampusScope || campusIds.has(item.campusId)),
    );
    // 资产 id -> 资产对象映射，供告警校验使用
    const assetById = new Map(validAssets.map((item) => [item.id, item]));
    // 各园区楼宇归属统计，供园区快照附带 buildingCount
    const buildingCountOf = (id) => validBuildings.filter((item) => item.campusId === id).length;
    snapshot = {
      // 城市快照：层级链根节点，附带园区数量便于上层展示
      city: validCity
        ? structuredClone({
            ...validCity,
            campusCount: validCampuses.length,
            districtCount: validCity.geojson?.features?.length ?? 0,
          })
        : null,
      // 城市下辖全部园区快照：每个园区附带楼宇数量
      campuses: structuredClone(
        validCampuses.map((item) => ({ ...item, buildingCount: buildingCountOf(item.id) })),
      ),
      // 当前园区快照
      campus: validCampus
        ? structuredClone({ ...validCampus, buildingCount: buildingCountOf(validCampus.id) })
        : null,
      // 房间快照：房间内存在 health 为 warning 的资产时，该房间标记 warning
      rooms: structuredClone(
        validRooms.map((room) => ({
          ...room,
          warning: validAssets.some(
            (asset) => asset.roomId === room.id && asset.health === 'warning',
          ),
        })),
      ),
      // 资产快照
      assets: structuredClone(validAssets),
      // 告警快照：园区、房间、楼层、资产四处信息必须完全一致
      alerts: structuredClone(
        alerts.filter((item) => {
          const room = validRooms.find((room) => room.id === item.roomId);
          return (
            room &&
            (!hasCampusScope || campusIds.has(item.campusId)) &&
            room.buildingId === item.buildingId &&
            room.floor === item.floor &&
            assetById.get(item.assetId)?.roomId === room.id
          );
        }),
      ),
      // 楼宇快照：附带按其房间与资产计算出的汇总指标
      buildings: structuredClone(
        validBuildings.map((building) => ({
          ...building,
          ...summarizeRooms(
            validRooms.filter((room) => room.buildingId === building.id),
            validAssets,
          ),
        })),
      ),
    };
    // 通知所有订阅方快照已更新
    listeners.forEach((listener) => listener());
  }

  // 初始化时用传入数据构建首个快照
  replaceData(initialData);
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    replaceData,
    listBuildings: () => snapshot.buildings,
    listAlerts: () => snapshot.alerts,
    getRooms: (buildingId, floor) =>
      snapshot.rooms.filter((room) => room.buildingId === buildingId && room.floor === floor),
    getAssets: (room) => (room ? snapshot.assets.filter((asset) => asset.roomId === room.id) : []),
  };
}
