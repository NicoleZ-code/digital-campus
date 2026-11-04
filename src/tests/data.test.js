import test from 'node:test';
import assert from 'node:assert/strict';
import { buildings, roomsFor, assetsFor, contextMetrics, alerts } from './fixtures.js';
test('所有楼宇、楼层、房间与资产 ID 唯一且父子关联一致', () => {
  const ids = new Set();
  const unique = (id) => {
    assert.ok(!ids.has(id), `重复 ID: ${id}`);
    ids.add(id);
  };
  for (const b of buildings) {
    unique(b.id);
    for (let f = 1; f <= b.floors; f++) {
      unique(`${b.id}-f${f}`);
      for (const r of roomsFor(b.id, f)) {
        unique(r.id);
        assert.equal(r.buildingId, b.id);
        assert.equal(r.floorId, `${b.id}-f${f}`);
        for (const a of assetsFor(r)) {
          unique(a.id);
          assert.equal(a.roomId, r.id);
        }
      }
    }
  }
});
test('园区总指标等于楼宇汇总，下钻后指标对应当前对象', () => {
  const b = buildings[0],
    r = roomsFor(b.id, 6)[1];
  const park = contextMetrics(1, b, 6, r);
  for (const key of ['assets', 'energy', 'area'])
    assert.equal(
      park[key],
      buildings.reduce((sum, item) => sum + item[key], 0),
    );
  assert.equal(contextMetrics(2, b, 6, r).energy, b.energy);
  assert.equal(
    contextMetrics(3, b, 6, r).energy,
    roomsFor(b.id, 6).reduce((s, r) => s + r.energy, 0),
  );
  assert.equal(contextMetrics(4, b, 6, r).energy, r.energy);
});
test('告警能够定位唯一房间和对应异常传感器', () => {
  for (const a of alerts) {
    const b = buildings.find((b) => b.id === a.buildingId);
    assert.ok(b);
    assert.ok(a.floor <= b.floors);
    const r = roomsFor(b.id, a.floor)[a.roomIndex];
    assert.equal(r.warning, true);
    const devices = assetsFor(r);
    assert.equal(devices.filter((d) => d.status === '告警').length, 1);
    assert.ok(Number(devices[1].value) > 1000);
  }
  assert.equal(assetsFor(roomsFor('b-b', 6)[1]).filter((d) => d.status === '告警').length, 0);
});

test('切换楼层后平面布局和设备归属随当前楼层更新', () => {
  for (const building of buildings) {
    let previousPositions;
    for (let floor = 1; floor <= building.floors; floor++) {
      const rooms = roomsFor(building.id, floor);
      const positions = rooms.map((room) => room.position);
      assert.equal(new Set(positions.map((position) => position.join(','))).size, rooms.length);
      if (previousPositions) assert.notDeepEqual(positions, previousPositions);
      for (const room of rooms) {
        assert.equal(room.floor, floor);
        assert.ok(room.number.startsWith(`${floor}0`));
        for (const asset of assetsFor(room)) assert.equal(asset.roomId, room.id);
      }
      previousPositions = positions;
    }
  }
});
