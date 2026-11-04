/**
 * @file sceneConfig.test.js
 * @description 数字园区模块的自动化验证与测试夹具。
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { getFloorPosition } from '../features/scene/config/layout.js';
import { getCameraPreset } from '../features/scene/config/camera.js';
import { createFacade } from '../features/scene/config/architecture.js';

test('幕墙在四面窗格中加入两道横向分格', () => {
  const { frames } = createFacade(6, 5, 0.8, 1);
  const transoms = frames.filter((frame) => frame.size[1] === 0.026);
  assert.equal(transoms.length, 8);
  assert.equal(transoms.filter((frame) => frame.size[0] === 6).length, 4);
  assert.equal(transoms.filter((frame) => frame.size[2] === 5).length, 4);
});
test('展开保留实际楼层标高，仅未选中楼层横向侧移', () => {
  for (let floor = 1; floor <= 12; floor++) {
    const expected = floor * 0.8;
    assert.deepEqual(getFloorPosition(floor, true, true), { x: 0, y: expected });
    assert.deepEqual(getFloorPosition(floor, true, false), { x: -17, y: expected });
    assert.deepEqual(getFloorPosition(floor, false, false), { x: 0, y: expected });
  }
});
test('楼层和房间镜头跟随实际标高，保持相对观察距离', () => {
  for (const floor of [1, 6, 12]) {
    const elevation = floor * 0.8;
    assert.deepEqual(getCameraPreset(3, [2, -1.35], floor), {
      position: [15, elevation + 14, 20],
      target: [0, elevation, 0],
    });
    assert.deepEqual(getCameraPreset(4, [2, -1.35], floor), {
      position: [9, elevation + 8, 8.65],
      target: [2, elevation, -1.35],
    });
  }
  assert.deepEqual(getCameraPreset(1, [2, -1.35], 6).target, [0, 1, 0]);
});

test('上海坐标投影保持方向，园区位置位于地图范围内', async () => {
  const { readFile } = await import('node:fs/promises');
  const { MAP_CENTER, projectShanghai, parkCoordinate } =
    await import('../features/scene/config/geography.js');
  const data = JSON.parse(
    await readFile(
      new URL('../infrastructure/data/geo/shanghai-districts.json', import.meta.url),
      'utf8',
    ),
  );
  assert.equal(data.features.length, 16);
  assert.equal(new Set(data.features.map((feature) => feature.properties.adcode)).size, 16);
  assert.deepEqual(projectShanghai(MAP_CENTER), [0, 0]);
  assert.ok(projectShanghai([MAP_CENTER[0] + 1, MAP_CENTER[1]])[0] > 0);
  assert.ok(projectShanghai([MAP_CENTER[0], MAP_CENTER[1] + 1])[1] > 0);
  const coordinates = data.features.flatMap((feature) => feature.geometry.coordinates.flat(2));
  const longitude = coordinates.map((point) => point[0]);
  const latitude = coordinates.map((point) => point[1]);
  assert.ok(
    parkCoordinate[0] > Math.min(...longitude) && parkCoordinate[0] < Math.max(...longitude),
  );
  assert.ok(parkCoordinate[1] > Math.min(...latitude) && parkCoordinate[1] < Math.max(...latitude));
});

test('车辆闭合路线位置和朝向在循环接缝处连续', async () => {
  const { trafficRoute, trafficProgress } = await import('../features/scene/config/traffic.js');
  assert.ok(trafficRoute.getPointAt(0).distanceTo(trafficRoute.getPointAt(1)) < 1e-8);
  assert.ok(trafficRoute.getTangentAt(0).dot(trafficRoute.getTangentAt(1)) > 0.99);
  assert.ok(Math.abs(trafficProgress(0, 35) - 0.35) < 1e-10);
  assert.ok(trafficProgress(10000, 68) >= 0 && trafficProgress(10000, 68) < 1);
  for (const point of trafficRoute.getSpacedPoints(100)) {
    assert.ok(Number.isFinite(point.x) && Number.isFinite(point.z));
    assert.ok(Math.abs(point.x) > 10 || Math.abs(point.z) > 9, '车辆不穿过中央建筑区');
  }
});
