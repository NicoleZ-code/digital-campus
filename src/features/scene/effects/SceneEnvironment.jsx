/**
 * @file SceneEnvironment.jsx
 * @description 场景环境光照组件，生成并挂载 PMREM 环境贴图。
 */

import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * 场景环境组件：用 RoomEnvironment 生成 PMREM 环境贴图挂到 scene 上，
 * 提供柔和的基于图像的全局光照；同时设置背景色、雾效与多盏灯光、地面网格。
 * 卸载时恢复原有环境贴图并释放 PMREM 资源。
 *
 * @returns {JSX.Element} 渲染背景/雾/灯光/网格等环境节点（不依赖任何 props）。
 */
export default function SceneEnvironment() {
  // gl 为 WebGLRenderer，scene 为当前场景对象。
  const { gl, scene } = useThree();
  useEffect(() => {
    // 基于 RoomEnvironment 场景生成模糊（sigma 0.04）的环境贴图并挂载到场景。
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04);
    // 记录原环境贴图以便卸载时还原。
    const previous = scene.environment;
    scene.environment = environment.texture;
    // 环境贴图整体强度，避免过曝。
    scene.environmentIntensity = 0.55;
    room.dispose();
    generator.dispose();
    return () => {
      // 清理：还原环境贴图并释放生成的贴图资源。
      scene.environment = previous;
      environment.dispose();
    };
  }, [gl, scene]);
  return (
    <>
      {/* 深蓝夜色背景。 */}
      <color
        attach="background"
        args={['#061b24']}
      />
      {/* 与背景同色的线性雾，距离 72~150 逐渐融入夜色，柔化远处边界。 */}
      <fog
        attach="fog"
        args={['#061b24', 72, 150]}
      />
      {/* 环境基础补光。 */}
      <ambientLight intensity={0.65} />
      {/* 半球光：天空色偏青、地面色偏暗，模拟天光与地面反光。 */}
      <hemisphereLight args={['#bddfe6', '#213e48', 1.3]} />
      {/* 主方向光（模拟月光/主光源），位置 [-16, 28, 18]，投射阴影并配置 2048 阴影贴图。 */}
      <directionalLight
        position={[-16, 28, 18]}
        intensity={3.1}
        color="#d2e8ec"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={0.5}
        shadow-camera-far={85}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      {/* 反向冷色补光，位置 [15, 12, -15]，照亮阴影面，不投影。 */}
      <directionalLight
        position={[15, 12, -15]}
        intensity={1.2}
        color="#72b7c7"
      />
      {/* 地面参考网格：边长 180、90 个格子，整体下沉至 y=-1.1。 */}
      <gridHelper
        args={[180, 90, '#123b47', '#0b2a34']}
        position={[0, -1.1, 0]}
      />
    </>
  );
}
