import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export default function SceneEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04);
    const previous = scene.environment;
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.55;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = previous;
      environment.dispose();
    };
  }, [gl, scene]);
  return (
    <>
      <color
        attach="background"
        args={['#061b24']}
      />
      <fog
        attach="fog"
        args={['#061b24', 72, 150]}
      />
      <ambientLight intensity={0.65} />
      <hemisphereLight args={['#bddfe6', '#213e48', 1.3]} />
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
      <directionalLight
        position={[15, 12, -15]}
        intensity={1.2}
        color="#72b7c7"
      />
      <gridHelper
        args={[180, 90, '#123b47', '#0b2a34']}
        position={[0, -1.1, 0]}
      />
    </>
  );
}
