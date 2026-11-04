/**
 * @file presentation.js
 * @description 负责提供界面展示所需的静态数据和计算逻辑。
 */

/** 园区位置静态展示信息。 */
export const campusLocation = {
  name: '上海 · 示意园区', // 园区名称
  coordinates: '31.2304° N / 121.4737° E · 示意位置', // 示意经纬度坐标
};

/** 顶栏环境监测读数列表（演示静态数据）。 */
export const environmentReadings = [
  { label: '环境温度', value: '24.6', unit: '°C' },
  { label: '相对湿度', value: '52', unit: '%' },
  // className 指定空气质量标签的样式（薄荷绿高亮）
  { label: '空气质量', value: '优', unit: '', className: 'mint' },
];

/** 能耗对比参数：weekMultiplier 为周期能耗倍率，decrease 为同比降幅文本。 */
export const energyComparison = { weekMultiplier: 6.8, decrease: '8.6%' };

/** 城市层（level 0）界面文案：与园区层（level 1）区分，索引对象为下辖园区。 */
const cityCopy = {
  subtitle: '在城市版图中定位园区，按区域浏览下辖园区与资产规模。', // 副标题文案
  spatialTitle: '城市空间', // 空间面板标题
  indexTitle: '园区索引', // 索引面板标题
  hint: '点击城市地图中的园区标记，进入园区全景。', // 操作提示
  countLabel: '下辖园区', // 计数标签
};

/** 各导航层级（1 楼宇 / 2 楼层 / 3 房间 / 4 资产）的界面文案。 */
const stageCopy = [
  {
    subtitle: '沿园区布局，探索办公、数据与研发空间。', // 副标题文案
    spatialTitle: '园区空间', // 空间面板标题
    indexTitle: '楼宇索引', // 索引面板标题
    hint: '点击三维建筑或楼宇标签，进入楼层与房间。', // 操作提示
    countLabel: '业务楼宇', // 计数标签
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

/**
 * 按当前导航层级组装展示视图模型（标题、文案、计数、能耗、状态统计）。
 * @param {object} context - 当前上下文数据
 * @param {number} context.level - 导航层级（0 园区 / 1 楼宇 / 2 楼层 / 3 房间 / 4 资产）
 * @param {object} context.building - 当前楼宇（level ≥ 1 时有效）
 * @param {number} context.floor - 当前楼层号（level ≥ 2 时有效）
 * @param {object|null} context.room - 当前房间（level ≥ 3 时有效）
 * @param {Array<object>} context.rooms - 当前楼层的房间列表
 * @param {Array<object>} context.assets - 当前房间的资产列表
 * @param {object} context.metrics - 统计指标（energy / onlineCount / offlineCount / warningCount）
 * @param {string} context.period - 统计周期（'24h' 或 '7d'）
 * @param {Array<object>} [context.buildings] - 全部楼宇列表（园区层级计数用）
 * @returns {object} 展示视图模型
 * @returns {string} returns.title - 当前层级主标题
 * @returns {string} returns.caption - 当前层级副标题说明
 * @returns {string} returns.primaryLabel - 主操作按钮文案
 * @returns {number} returns.count - 当前层级核心计数（楼宇数/层数/房间数/房间面积）
 * @returns {string} returns.indexCount - 索引面板计数文本
 * @returns {number} returns.energy - 当前周期与层级的能耗值
 * @returns {string} returns.energyScope - 能耗归属范围文本
 * @returns {number} returns.onlineCount - 在线资产数
 * @returns {number} returns.offlineCount - 离线资产数
 * @returns {number} returns.warningCount - 告警资产数
 */
export function getCampusView({
  level,
  building,
  floor,
  room,
  rooms,
  assets,
  metrics,
  period,
  buildings = [],
  campuses = [],
  city = null,
}) {
  // 各层级主标题：索引 0-4 依次对应城市定位、园区全景、楼宇、楼层、房间
  const titles = [
    `连接${city?.name ?? '城市'}，感知空间`,
    '海序数字园区',
    building.name,
    `${building.code} 座 · ${floor}F 空间`,
    `${room?.number ?? '—'} · ${room?.name ?? '暂无房间'}`,
  ];
  // 各层级副标题说明
  const captions = [
    `${city?.name ?? '上海'} · ${campuses.length} 个园区`,
    '园区全景 · 东南视角',
    `${building.name} · 楼层结构`,
    `${floor}F · 空间展开`,
    `${room?.number ?? '—'} · 资产定位`,
  ];
  // 各层级主操作按钮文案
  const primaryLabels = [
    '进入海序园区',
    `探索${building.name}`,
    `展开 ${floor}F 楼层`,
    `进入 ${room?.number ?? '—'} 房间`,
    '查看空间资产',
  ];

  return {
    // 城市层使用城市文案，园区层及以下使用园区/楼宇文案
    ...(level === 0 ? cityCopy : stageCopy[Math.max(0, level - 1)]),
    title: titles[level],
    caption: captions[level],
    primaryLabel: primaryLabels[level],
    count:
      level === 0
        ? campuses.length
        : level < 2
          ? buildings.length
          : level === 2
            ? building.floors
            : level === 3
              ? rooms.length
              : (room?.area ?? 0),
    indexCount:
      level === 0
        ? `${campuses.length} CAMPUSES`
        : level < 2
          ? `${buildings.length} BUILDINGS`
          : level === 2
            ? `${building.floors} FLOORS`
            : level === 3
              ? `${rooms.length} ROOMS`
              : `${assets.length} ASSETS`,
    energy:
      // '7d' 周期按倍率折算为周能耗，'24h' 直接使用指标值
      period === '24h'
        ? metrics.energy
        : Math.round(metrics.energy * energyComparison.weekMultiplier),
    energyScope:
      level === 0
        ? (city?.name ?? '城市')
        : level < 2
          ? '园区'
          : level === 2
            ? building.name
            : level === 3
              ? `${floor}F 楼层`
              : (room?.number ?? '—'),
    onlineCount: metrics.onlineCount,
    offlineCount: metrics.offlineCount,
    warningCount: metrics.warningCount,
  };
}

/** 资产告警提示文案（CO₂ 超阈值）。 */
export const assetWarningMessage = 'CO₂ 超过 1000 ppm 阈值，请检查通风。';

/** 将设备实体转换为详情弹窗字段。 */
/**
 * 将资产实体转换为详情弹窗的字段列表。
 * @param {object} asset - 资产实体（id / roomId / type / power / powerUnit）
 * @returns {Array<{label: string, value: string}>} 弹窗展示字段列表
 */
export function getAssetDetails(asset) {
  return [
    { label: '资产编号', value: asset.id.toUpperCase() },
    { label: '所属房间', value: asset.roomId },
    { label: '设备分类', value: asset.type },
    { label: '当前功率', value: `${asset.power} ${asset.powerUnit}` },
    { label: '数据来源', value: '演示模拟数据' },
  ];
}

/** 返回设备的本地化在线与告警状态文本。 */
/**
 * 返回资产在线与告警状态的本地化文本。
 * @param {object} asset - 资产实体（connectivity / health）
 * @returns {string} 状态文本，如 "在线"、"离线 · 告警"
 */
export function getAssetStatus(asset) {
  const connectivity = asset.connectivity === 'online' ? '在线' : '离线';
  return asset.health === 'warning' ? `${connectivity} · 告警` : connectivity;
}
