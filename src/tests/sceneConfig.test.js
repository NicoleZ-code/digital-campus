import test from 'node:test';
import assert from 'node:assert/strict';
import { getFloorPosition } from '../features/scene/config/layout.js';
import { getCameraPreset } from '../features/scene/config/camera.js';

test('抽离楼层保持居中，其余楼层侧移，复位回到建筑堆叠位置', () => {
  assert.deepEqual(getFloorPosition(6, 12, true, true), { x: 0, y: 2 });
  assert.equal(getFloorPosition(7, 12, true, false).x, -17);
  assert.ok(getFloorPosition(7, 12, true, false).y > getFloorPosition(6, 12, true, false).y);
  assert.deepEqual(getFloorPosition(6, 12, false, false), { x: 0, y: 6 * 0.8 });
});
test('房间镜头相对所选房间定位，不依赖仓库和界面', () => {
  assert.deepEqual(getCameraPreset(4, [2, -1.35]), {
    position: [9, 10, 8.65],
    target: [2, 2, -1.35],
  });
  assert.deepEqual(getCameraPreset(1, [2, -1.35]).target, [0, 1, 0]);
});
