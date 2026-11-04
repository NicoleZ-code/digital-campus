/**
 * @file navigation.test.js
 * @description 数字园区模块的自动化验证与测试夹具。
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { navigationReducer } from '../domain/campus/navigation.js';
import { defaultSelection } from '../domain/campus/constants.js';

test('楼宇到房间下钻、资产选中、返回和重置不会携带旧资产', () => {
  const initial = { ...defaultSelection };
  let state = navigationReducer(initial, { type: 'selectBuilding', buildingId: 'b-b', floor: 6 });
  assert.equal(state.level, 2);
  assert.equal(state.buildingId, 'b-b');
  state = navigationReducer(state, { type: 'selectFloor', floor: 3 });
  assert.equal(state.level, 3);
  assert.equal(state.floor, 3);
  state = navigationReducer(state, { type: 'selectRoom', roomId: 'b-b-f3-r3' });
  assert.equal(state.level, 4);
  assert.equal(state.roomId, 'b-b-f3-r3');
  state = navigationReducer(state, { type: 'selectAsset', assetId: 'asset-1' });
  assert.equal(state.selectedAssetId, 'asset-1');
  state = navigationReducer(state, { type: 'navigate', level: 3 });
  assert.equal(state.selectedAssetId, null);
  assert.equal(state.floor, 3);
  assert.deepEqual(navigationReducer(state, { type: 'reset' }), initial);
  assert.deepEqual(initial, defaultSelection);
});

test('告警跨楼宇定位并清除旧设备，非法层级保持原状态', () => {
  const initial = { ...defaultSelection, buildingId: 'b-c', selectedAssetId: 'old' };
  const alert = { buildingId: 'b-a', floor: 6, roomId: 'b-a-f6-r2' };
  const located = navigationReducer(initial, { type: 'locateAlert', alert });
  assert.deepEqual(located, { ...defaultSelection, ...alert, level: 4, selectedAssetId: null });
  for (const level of [-1, 5, 1.5]) {
    assert.equal(navigationReducer(located, { type: 'navigate', level }), located);
  }
  assert.equal(navigationReducer(located, { type: 'selectRoom', roomId: '' }), located);
});
