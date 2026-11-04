/**
 * @file fixtures.js
 * @description 数字园区模块的自动化验证与测试夹具。
 */

import { mockCampusRepository } from '../infrastructure/repositories/mockCampusRepository.js';
import { getContextMetrics } from '../domain/campus/metrics.js';

/** 测试用数据快照：包含城市、园区、楼宇、房间、设备与告警。 */
const snapshot = mockCampusRepository.getSnapshot();

export const city = snapshot.city;
export const campus = snapshot.campus;
export const campuses = snapshot.campuses;
export const buildings = mockCampusRepository.listBuildings();
export const alerts = mockCampusRepository.listAlerts();
export const roomsFor = mockCampusRepository.getRooms;
export const assetsFor = mockCampusRepository.getAssets;
/**
 * 创建测试用上下文指标参数。
 * @param {number} level - 导航层级（0 城市 / 1 园区 / 2 楼宇 / 3 楼层 / 4 房间）
 * @param {Object} building - 当前楼宇实体
 * @param {number} floor - 当前楼层号
 * @param {Object} room - 当前房间实体
 * @returns {ReturnType<getContextMetrics>} 当前层级的指标
 */
export function contextMetrics(level, building, floor, room) {
  return getContextMetrics({
    level,
    city,
    campus,
    campuses,
    building,
    floor,
    room,
    rooms: roomsFor(building.id, floor),
    assets: assetsFor(room),
    buildings,
    alerts,
    allRooms: snapshot.rooms,
    allAssets: snapshot.assets,
  });
}
