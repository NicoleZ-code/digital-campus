import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { getCameraPreset } from '../config/camera.js';
export default function CameraRig({ level, floor, room, revision, autoRotate }) {
  const controls = useRef();
  const { position, target } = useMemo(
    () => getCameraPreset(level, room.position, floor),
    [level, room.position, floor],
  );
  const animating = useRef(true);
  useEffect(() => {
    animating.current = true;
  }, [position, target, revision]);
  useFrame(({ camera }, dt) => {
    if (!controls.current || !animating.current) return;
    const p = new Vector3(...position),
      t = new Vector3(...target);
    camera.position.lerp(p, 1 - Math.exp(-dt * 3));
    controls.current.target.lerp(t, 1 - Math.exp(-dt * 3));
    controls.current.update();
    if (camera.position.distanceTo(p) < 0.03) animating.current = false;
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      onStart={() => {
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
