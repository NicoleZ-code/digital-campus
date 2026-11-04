/**
 * @file CameraRig.jsx
 * @description 相机控制组件：根据导航层级平滑过渡到预设机位，支持轨道交互与自动旋转。
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { getCameraPreset } from '../config/camera.js';

/**
 * 相机控制组件：根据导航层级取预设机位，用指数插值平滑过渡到目标位姿，
 * 同时提供 OrbitControls 的拖拽/缩放交互、自动旋转与限制条件。
 *
 * @param {number} level - 导航层级（0 城市 / 1 园区 / 2 建筑 / 3 楼层 / 4 房间），
 * 决定使用哪个预设机位。
 * @param {number} floor - 当前楼层索引，层级 3/4 时用于计算相机与目标高度。
 * @param {Object} [room] - 当前选中房间对象，position 为平面坐标 [x, z]，层级 4 时相机聚焦该房间。
 * @param {number} revision - 视图刷新版本号，变化时强制重新播放入场动画（即使机位相同）。
 * @param {boolean} autoRotate - 是否开启自动旋转展示。
 * @returns {JSX.Element} 渲染 OrbitControls 控制器（无可见几何体）。
 */
export default function CameraRig({ level, floor, room, revision, autoRotate }) {
  // OrbitControls 实例引用。
  const controls = useRef();
  // 当前层级对应的预设机位 {position, target}，仅在依赖变化时重算。
  const { position, target } = useMemo(
    () => getCameraPreset(level, room?.position ?? [0, 0], floor),
    [level, room?.position, floor],
  );
  // 是否正在播放入场过渡动画；机位或 revision 变化时重新置为 true。
  const animating = useRef(true);
  useEffect(() => {
    animating.current = true;
  }, [position, target, revision]);
  // 每帧将相机位置与观察目标向预设值指数插值（阻尼系数 3），距离小于 0.03 即视为到位。
  useFrame(({ camera }, dt) => {
    if (!controls.current || !animating.current) {
      return;
    }
    const p = new Vector3(...position),
      t = new Vector3(...target);
    camera.position.lerp(p, 1 - Math.exp(-dt * 3));
    controls.current.target.lerp(t, 1 - Math.exp(-dt * 3));
    controls.current.update();
    if (camera.position.distanceTo(p) < 0.03) {
      animating.current = false;
    }
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      onStart={() => {
        // 用户开始拖拽时立即中断入场动画，避免与手动操作冲突。
        animating.current = false;
      }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.4}
      minDistance={6}
      maxDistance={85}
      maxPolarAngle={Math.PI / 2.12}
      enableDamping
    />
  );
}
