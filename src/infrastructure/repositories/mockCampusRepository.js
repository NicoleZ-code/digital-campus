import { buildings, alerts, createMockRooms, createMockAssets } from '../data/campus.js';

// 同步读取接口；向 App 注入具有相同方法的数据仓库即可替换实现。
// 数据加载与规范化由适配器负责，不应放在场景或界面组件中。
export const mockCampusRepository = {
  listBuildings: () => buildings,
  listAlerts: () => alerts,
  getRooms: (buildingId, floor) => createMockRooms(buildingId, floor),
  getAssets: (room) => createMockAssets(room),
};
