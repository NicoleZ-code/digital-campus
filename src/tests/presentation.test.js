/**
 * @file presentation.test.js
 * @description 数字园区模块的自动化验证与测试夹具。
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildings,
  city,
  campus,
  campuses,
  roomsFor,
  assetsFor,
  contextMetrics,
} from './fixtures.js';
import { getCampusView, getAssetDetails } from '../ui/config/presentation.js';
import { defaultSelection } from '../domain/campus/constants.js';

function context(level, period = '24h') {
  const building = buildings.find((item) => item.id === defaultSelection.buildingId);
  const floor = defaultSelection.floor;
  const rooms = roomsFor(building.id, floor);
  const room = rooms.find((room) => room.id === defaultSelection.roomId);
  return {
    level,
    city,
    campus,
    campuses,
    buildings,
    period,
    building,
    floor,
    rooms,
    room,
    assets: assetsFor(room),
    metrics: contextMetrics(level, building, floor, room),
  };
}

test('五级展示数据对应当前空间，城市层与园区层文案互相区分', () => {
  const expected = [
    ['连接上海，感知空间', '园区索引', 1],
    ['海序数字园区', '楼宇索引', 3],
    ['海序中心', '楼层索引', 12],
    ['A 座 · 6F 空间', '房间索引', 6],
    ['602 · 智能会议室', '空间资产', 56],
  ];
  for (let level = 0; level < expected.length; level += 1) {
    const view = getCampusView(context(level));
    assert.deepEqual([view.title, view.indexTitle, view.count], expected[level]);
    assert.ok(view.primaryLabel);
    assert.ok(view.caption);
    assert.equal(view.onlineCount + view.offlineCount, context(level).metrics.assets);
  }
  // 城市层与园区层的统计口径标签必须不同
  assert.equal(getCampusView(context(0)).energyScope, '上海');
  assert.equal(getCampusView(context(1)).energyScope, '园区');
});

test('切换曲线周期保留当前空间的能耗与范围', () => {
  for (let level = 0; level < 5; level += 1) {
    const day = getCampusView(context(level));
    const week = getCampusView(context(level, '7d'));
    assert.equal(week.energy, Math.round(day.energy * 6.8));
    assert.equal(week.energyScope, day.energyScope);
  }
});

test('资产详情使用当前设备字段，编号与所属房间保持一致', () => {
  const asset = context(4).assets[1];
  const details = Object.fromEntries(
    getAssetDetails(asset).map(({ label, value }) => [label, value]),
  );
  assert.equal(details['资产编号'], asset.id.toUpperCase());
  assert.equal(details['所属房间'], asset.roomId);
  assert.equal(details['当前功率'], `${asset.power} ${asset.powerUnit}`);
});
