/**
 * @file modelData.test.js
 * @description 验证园区数据模型、仓储快照和关联约束。
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mockCampusRepository } from '../infrastructure/repositories/mockCampusRepository.js';
import { createCampusRepository } from '../infrastructure/repositories/createCampusRepository.js';
import { summarizeAssets, summarizeRooms, getContextMetrics } from '../domain/campus/metrics.js';
import { createCatalog, resolveContext } from '../domain/campus/catalog.js';
import { defaultSelection } from '../domain/campus/constants.js';
import { navigationReducer } from '../domain/campus/navigation.js';

const original = mockCampusRepository.getSnapshot();

test('楼宇、园区汇总与全部房间和设备明细使用同一口径', () => {
  assert.equal(original.rooms.length, 156);
  assert.equal(original.assets.length, 468);
  for (const building of original.buildings) {
    const metrics = summarizeRooms(
      original.rooms.filter((room) => room.buildingId === building.id),
      original.assets,
    );
    for (const key of ['assets', 'area', 'energy', 'onlineCount', 'warningCount']) {
      assert.equal(building[key], metrics[key]);
    }
  }
  const total = getContextMetrics({
    level: 1,
    allRooms: original.rooms,
    allAssets: original.assets,
  });
  assert.deepEqual([total.assets, total.area, total.energy], [468, 13312, 17822]);
});

test('房间设备数量不等时逐项聚合，在线与告警可以同时存在', () => {
  const rooms = original.rooms.filter((room) => room.floor === 6 && room.buildingId === 'b-a');
  const ids = new Set(rooms.map((room) => room.id));
  const assets = original.assets.filter((asset) => ids.has(asset.roomId)).slice(1);
  assets.push({ ...assets[0], id: 'extra-device', connectivity: 'offline', health: 'warning' });
  const summary = summarizeRooms(rooms, assets);
  assert.equal(summary.assets, 18);
  assert.equal(summary.onlineCount, 17);
  assert.equal(summary.offlineCount, 1);
  assert.equal(summary.warningCount, 2);
  assert.equal(summary.online, 94.4);
  assert.equal(summarizeAssets([...assets, assets[0]]).assets, 18);
  assert.equal(summarizeAssets([]).online, 0);
});

test('告警按稳定 ID 定位，房间排序后仍指向 602', () => {
  const alert = original.alerts[0];
  const selection = navigationReducer(defaultSelection, { type: 'locateAlert', alert });
  const context = resolveContext(
    createCatalog({ ...original, rooms: [...original.rooms].reverse() }),
    selection,
  );
  assert.equal(context.room.id, alert.roomId);
  assert.equal(context.room.number, '602');
  assert.ok(context.assets.some((asset) => asset.id === alert.assetId));
});

test('仓库快照可订阅，弹窗按 ID 解析最新读数，删除设备后关闭选择', () => {
  const repository = createCampusRepository(original);
  const selectedAssetId = original.alerts[0].assetId;
  const requested = { ...defaultSelection, level: 4, selectedAssetId };
  const before = repository.getSnapshot();
  assert.equal(repository.getSnapshot(), before);
  let calls = 0;
  const unsubscribe = repository.subscribe(() => calls++);
  repository.replaceData({
    ...before,
    assets: before.assets.map((asset) =>
      asset.id === selectedAssetId ? { ...asset, value: 700 } : asset,
    ),
  });
  assert.notEqual(repository.getSnapshot(), before);
  assert.equal(resolveContext(createCatalog(repository.getSnapshot()), requested).asset.value, 700);
  assert.equal(before.assets.find((asset) => asset.id === selectedAssetId).value, 1430);
  repository.replaceData({ ...repository.getSnapshot(), assets: [] });
  assert.equal(
    resolveContext(createCatalog(repository.getSnapshot()), requested).selection.selectedAssetId,
    null,
  );
  assert.equal(calls, 2);
  const cleared = navigationReducer(requested, {
    type: 'reconcile',
    selection: resolveContext(createCatalog(repository.getSnapshot()), requested).selection,
  });
  assert.equal(cleared.selectedAssetId, null);
  assert.equal(resolveContext(createCatalog(original), cleared).asset, null);
  unsubscribe();
  repository.replaceData({});
  assert.equal(calls, 2);
});

test('缺失楼栋、空房间、越界楼层和失效关联均安全回退', () => {
  const empty = resolveContext(createCatalog(), defaultSelection);
  assert.equal(empty.building, null);
  assert.deepEqual(empty.assets, []);
  const repository = createCampusRepository({ ...original, rooms: [] });
  const noRooms = resolveContext(createCatalog(repository.getSnapshot()), {
    ...defaultSelection,
    level: 4,
  });
  assert.equal(noRooms.selection.level, 2);
  assert.equal(noRooms.room, null);
  assert.equal(repository.listAlerts().length, 0);
  assert.deepEqual(repository.getAssets(null), []);
  assert.deepEqual(repository.getRooms('missing', 1), []);
  const clamped = resolveContext(createCatalog(original), {
    ...defaultSelection,
    buildingId: 'missing',
    floor: 999,
    roomId: 'missing',
  });
  assert.equal(clamped.selection.floor, 12);
  assert.equal(clamped.room.floor, 12);
});

test('业务读数保持数值，单位独立，在线告警互不替代', () => {
  for (const asset of original.assets) {
    assert.equal(typeof asset.value, 'number');
    assert.equal(typeof asset.power, 'number');
    assert.equal(asset.powerUnit, 'kW');
  }
  const summary = summarizeAssets(original.assets);
  assert.equal(summary.online, 100);
  assert.equal(summary.warningCount, 1);
  assert.equal(summary.offlineCount, 0);
});

test('城市与园区使用独立 ID，所有下级实体挂载 campusId', () => {
  assert.equal(original.city.id, 'city-shanghai');
  assert.equal(original.campus.id, 'campus-haixu');
  assert.notEqual(original.campus.id, original.city.id);
  assert.equal(original.campus.cityId, original.city.id);
  for (const key of ['buildings', 'rooms', 'assets', 'alerts']) {
    for (const item of original[key]) {
      assert.equal(item.campusId, original.campus.id, `${key} / ${item.id} 缺少园区归属`);
    }
  }
  assert.equal(original.campus.buildingCount, original.buildings.length);
});

test('仓储过滤园区归属不一致的实体，园区与城市不一致时园区失效', () => {
  const other = 'campus-other';
  const foreignBuilding = { ...original.buildings[0], id: 'b-x', campusId: other };
  const repository = createCampusRepository({
    city: original.city,
    campus: original.campus,
    buildings: [...original.buildings, foreignBuilding],
    rooms: [
      ...original.rooms,
      { ...original.rooms[0], id: 'b-x-f1-r1', campusId: other, buildingId: 'b-x', floor: 1 },
    ],
    assets: [
      ...original.assets,
      { ...original.assets[0], id: 'b-x-f1-r1-a1', campusId: other, roomId: 'b-x-f1-r1' },
    ],
    alerts: [...original.alerts, { ...original.alerts[0], id: 'alert-other', campusId: other }],
  });
  const snapshot = repository.getSnapshot();
  assert.equal(snapshot.buildings.length, original.buildings.length);
  assert.ok(!snapshot.rooms.some((room) => room.campusId === other));
  assert.ok(!snapshot.assets.some((asset) => asset.campusId === other));
  assert.ok(!snapshot.alerts.some((alert) => alert.campusId === other));

  const mismatched = createCampusRepository({
    city: original.city,
    campus: { ...original.campus, cityId: 'city-other' },
    buildings: original.buildings,
    rooms: original.rooms,
    assets: original.assets,
  }).getSnapshot();
  assert.equal(mismatched.campus, null);
});

test('选择解析归一化 cityId 与 campusId，跨园区楼宇被排除', () => {
  const catalog = createCatalog(original);
  const resolved = resolveContext(catalog, {
    ...defaultSelection,
    campusId: 'campus-unknown',
    buildingId: 'b-x',
  });
  assert.equal(resolved.selection.cityId, 'city-shanghai');
  assert.equal(resolved.selection.campusId, 'campus-haixu');
  assert.equal(resolved.selection.buildingId, 'b-a');
  assert.equal(resolved.campus.id, 'campus-haixu');
  assert.equal(resolved.city.id, 'city-shanghai');

  const emptyCampus = resolveContext(createCatalog(), defaultSelection);
  assert.equal(emptyCampus.selection.level, 0);
  assert.equal(emptyCampus.selection.cityId, null);
});

test('城市携带 GeoJSON 区界，园区携带经纬度落点', () => {
  assert.equal(original.city.geojson.type, 'FeatureCollection');
  assert.equal(original.city.geojson.features.length, 16);
  assert.equal(original.city.districtCount, 16);
  const { longitude, latitude } = original.campus.location;
  assert.equal(typeof longitude, 'number');
  assert.equal(typeof latitude, 'number');
  // 园区经纬度必须落在城市区界范围内
  const points = original.city.geojson.features.flatMap((feature) =>
    feature.geometry.coordinates.flat(2),
  );
  const longitudes = points.map((point) => point[0]);
  const latitudes = points.map((point) => point[1]);
  assert.ok(longitude > Math.min(...longitudes) && longitude < Math.max(...longitudes));
  assert.ok(latitude > Math.min(...latitudes) && latitude < Math.max(...latitudes));
});

test('城市层聚合下辖全部园区，园区层只统计当前园区', () => {
  const second = {
    id: 'campus-zhangjiang',
    cityId: original.city.id,
    name: '张江二期',
    district: '浦东新区',
    location: { longitude: 121.59, latitude: 31.2 },
  };
  // 构造第二园区的独立楼宇、6 个房间与对应设备
  const secondBuilding = { ...original.buildings[0], id: 'b-x', campusId: second.id, floors: 1 };
  const secondRooms = original.rooms.slice(0, 6).map((room, index) => ({
    ...room,
    id: `b-x-f1-r${index + 1}`,
    campusId: second.id,
    buildingId: 'b-x',
    floor: 1,
  }));
  const secondAssets = secondRooms.flatMap((room) =>
    original.assets
      .filter((asset) => asset.roomId === original.rooms[0].id)
      .map((asset, index) => ({
        ...asset,
        id: `${room.id}-a${index + 1}`,
        campusId: second.id,
        roomId: room.id,
      })),
  );
  const repository = createCampusRepository({
    city: original.city,
    campus: original.campus,
    campuses: [original.campus, second],
    buildings: [...original.buildings, secondBuilding],
    rooms: [...original.rooms, ...secondRooms],
    assets: [...original.assets, ...secondAssets],
  });
  const snapshot = repository.getSnapshot();
  assert.equal(snapshot.city.campusCount, 2);
  assert.equal(snapshot.campuses.length, 2);
  const common = {
    city: snapshot.city,
    campuses: snapshot.campuses,
    allRooms: snapshot.rooms,
    allAssets: snapshot.assets,
  };
  const atCity = getContextMetrics({ ...common, level: 0, campus: snapshot.campus });
  const atCampus = getContextMetrics({ ...common, level: 1, campus: snapshot.campus });
  assert.equal(atCampus.assets, 468);
  assert.ok(atCity.assets > atCampus.assets);
  assert.ok(atCity.area > atCampus.area);
});
