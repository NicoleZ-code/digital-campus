/**
 * @file mockCampusRepository.js
 * @description 基于静态演示数据构建内存园区数据仓储实例。
 */

import {
  city,
  campus,
  campuses,
  buildings,
  alerts,
  createMockRooms,
  createMockAssets,
} from '../data/campus.js';
import { createCampusRepository } from './createCampusRepository.js';

/** 全园区演示房间列表：按每栋楼宇的每层生成。 */
const rooms = buildings.flatMap((building) =>
  Array.from({ length: building.floors }, (_, index) =>
    createMockRooms(building.id, index + 1),
  ).flat(),
);

/** 内存园区数据仓储单例，供整个应用共享。 */
export const mockCampusRepository = createCampusRepository({
  city,
  campus,
  campuses,
  buildings,
  rooms,
  // 资产：按房间逐一生成后展平
  assets: rooms.flatMap(createMockAssets),
  alerts,
});
