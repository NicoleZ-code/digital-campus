export const campusLocation = {
  name: '上海 · 示意园区',
  coordinates: '31.2304° N / 121.4737° E · 示意位置',
};

export const environmentReadings = [
  { label: '环境温度', value: '24.6', unit: '°C' },
  { label: '相对湿度', value: '52', unit: '%' },
  { label: '空气质量', value: '优', unit: '', className: 'mint' },
];

export const energyComparison = { weekMultiplier: 6.8, decrease: '8.6%' };

const stageCopy = [
  {
    subtitle: '沿园区布局，探索办公、数据与研发空间。',
    spatialTitle: '园区空间',
    indexTitle: '楼宇索引',
    hint: '点击三维建筑或楼宇标签，进入楼层与房间。',
    countLabel: '业务楼宇',
  },
  {
    subtitle: '从建筑到空间，让每一层运行清晰可见。',
    spatialTitle: '楼宇空间',
    indexTitle: '楼层索引',
    hint: '选择楼层，展开空间布局与房间。',
    countLabel: '建筑楼层',
  },
  {
    subtitle: '选择一个房间，查看空间与设备运行情况。',
    spatialTitle: '楼层空间',
    indexTitle: '房间索引',
    hint: '点击房间，查看关联资产及环境指标。',
    countLabel: '功能房间',
  },
  {
    subtitle: '感知空间环境，连接每一项数字资产。',
    spatialTitle: '房间空间',
    indexTitle: '空间资产',
    hint: '点击设备，查看运行状态与资产详情。',
    countLabel: '房间面积 / m²',
  },
];

// 纯视图选择器：界面文案与派生读数不依赖 React 状态。
export function getCampusView({ level, building, floor, room, rooms, assets, metrics, period }) {
  const titles = [
    '连接城市，感知空间',
    '海序数字园区',
    building.name,
    `${building.code} 座 · ${floor}F 空间`,
    `${room.number} · ${room.name}`,
  ];
  const captions = [
    '城市空间 · 上海',
    '园区全景 · 东南视角',
    `${building.name} · 楼层结构`,
    `${floor}F · 空间展开`,
    `${room.number} · 资产定位`,
  ];
  const primaryLabels = [
    '进入海序园区',
    `探索${building.name}`,
    `展开 ${floor}F 楼层`,
    `进入 ${room.number} 房间`,
    '查看空间资产',
  ];
  const warningCount = Number(metrics.online) < 100 ? 1 : 0;
  return {
    ...stageCopy[Math.max(0, level - 1)],
    title: titles[level],
    caption: captions[level],
    primaryLabel: primaryLabels[level],
    count: level < 2 ? 3 : level === 2 ? building.floors : level === 3 ? rooms.length : room.area,
    indexCount:
      level < 2
        ? '3 BUILDINGS'
        : level === 2
          ? `${building.floors} FLOORS`
          : level === 3
            ? `${rooms.length} ROOMS`
            : `${assets.length} ASSETS`,
    energy:
      period === '24h'
        ? metrics.energy
        : Math.round(metrics.energy * energyComparison.weekMultiplier),
    energyScope:
      level < 2
        ? '园区'
        : level === 2
          ? building.name
          : level === 3
            ? `${floor}F 楼层`
            : room.number,
    onlineCount: metrics.assets - warningCount,
    warningCount,
  };
}

export const assetWarningMessage = 'CO₂ 超过 1000 ppm 阈值，请检查通风。';

export function getAssetDetails(asset) {
  return [
    { label: '资产编号', value: asset.id.toUpperCase() },
    { label: '所属房间', value: asset.roomId },
    { label: '设备分类', value: asset.type },
    { label: '当前功率', value: asset.power },
    { label: '数据来源', value: '演示模拟数据' },
  ];
}
