/**
 * @file modelExport.test.js
 * @description 数字园区模块的自动化验证与测试夹具。
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { serializeModel } from '../infrastructure/export/serializeModel.js';

// Node 提供 Blob，但不提供浏览器的 FileReader；测试中仅替换该适配器。
class NodeFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
}

test('GLB 导出产生有效二进制并保留业务 ID 与对象层级', async () => {
  globalThis.FileReader = NodeFileReader;
  const root = new Group();
  root.name = 'campus-haixu';
  const floor = new Group();
  floor.name = 'b-a-f6';
  floor.userData = { buildingId: 'b-a', floorId: 'b-a-f6' };
  const room = new Mesh(new BoxGeometry(4, 1, 3), new MeshStandardMaterial({ color: '#65d5bf' }));
  room.name = 'b-a-f6-r2';
  room.userData = { roomId: room.name, floorId: floor.name };
  floor.add(room);
  root.add(floor);
  const hidden = new Group();
  hidden.name = 'hidden-object';
  hidden.visible = false;
  root.add(hidden);
  try {
    const buffer = await serializeModel(root);
    const view = new DataView(buffer);
    assert.equal(view.getUint32(0, true), 0x46546c67);
    assert.equal(view.getUint32(4, true), 2);
    assert.equal(view.getUint32(8, true), buffer.byteLength);
    const jsonLength = view.getUint32(12, true);
    const gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLength)));
    const exportedRoom = gltf.nodes.find((n) => n.name === room.name);
    assert.equal(exportedRoom.extras.roomId, room.name);
    const exportedFloor = gltf.nodes.find((n) => n.name === floor.name);
    assert.equal(exportedFloor.extras.buildingId, 'b-a');
    assert.ok(exportedFloor.children.includes(gltf.nodes.indexOf(exportedRoom)));
    assert.equal(
      gltf.nodes.some((n) => n.name === 'hidden-object'),
      false,
    );
    assert.equal(gltf.meshes.length, 1);
  } finally {
    room.geometry.dispose();
    room.material.dispose();
    delete globalThis.FileReader;
  }
});
