import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { Vector3 } from 'three';
import Box from '../primitives/Box.jsx';
import { trafficRoute, trafficProgress } from '../config/traffic.js';

export function Vehicle({ color = '#d9e6e7' }) {
  return (
    <group name="detailed-sedan">
      <RoundedBox
        args={[1.25, 0.22, 0.57]}
        radius={0.075}
        smoothness={2}
        position={[0, 0.25, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color={color}
          metalness={0.65}
          roughness={0.22}
          clearcoat={1}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.67, 0.23, 0.49]}
        radius={0.07}
        smoothness={2}
        position={[-0.08, 0.43, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#153c4c"
          roughness={0.12}
          metalness={0.7}
          clearcoat={1}
        />
      </RoundedBox>
      <Box
        position={[-0.1, 0.55, 0]}
        size={[0.4, 0.025, 0.45]}
        color={color}
      />
      {[-1, 1].map((side) => (
        <React.Fragment key={side}>
          <Box
            position={[-0.04, 0.43, side * 0.25]}
            size={[0.035, 0.2, 0.022]}
            color={color}
          />
          <Box
            position={[0.23, 0.39, side * 0.32]}
            size={[0.12, 0.06, 0.1]}
            color={color}
          />
          <Box
            position={[-0.17, 0.3, side * 0.292]}
            size={[0.11, 0.025, 0.015]}
            color="#adc7cc"
          />
          <Box
            position={[0.61, 0.27, side * 0.18]}
            size={[0.025, 0.07, 0.16]}
            color="#e1ffff"
            material={{ emissive: '#c3faff', emissiveIntensity: 0.5 }}
          />
          <Box
            position={[-0.62, 0.28, side * 0.19]}
            size={[0.025, 0.055, 0.13]}
            color="#9d4e47"
            material={{ emissive: '#8e241d', emissiveIntensity: 0.3 }}
          />
          {[-0.4, 0.4].map((x) => (
            <group
              key={x}
              position={[x, 0.18, side * 0.29]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <mesh castShadow>
                <cylinderGeometry args={[0.145, 0.145, 0.09, 20]} />
                <meshStandardMaterial
                  color="#101c23"
                  roughness={0.9}
                />
              </mesh>
              <mesh position={[0, side * 0.05, 0]}>
                <cylinderGeometry args={[0.085, 0.085, 0.015, 16]} />
                <meshStandardMaterial
                  color="#9aadb4"
                  metalness={0.8}
                  roughness={0.3}
                />
              </mesh>
            </group>
          ))}
        </React.Fragment>
      ))}
      <Box
        position={[0.625, 0.22, 0]}
        size={[0.015, 0.07, 0.22]}
        color="#142c36"
      />
      <Box
        position={[-0.63, 0.25, 0]}
        size={[0.015, 0.06, 0.15]}
        color="#77a6c3"
      />
    </group>
  );
}
export default function Car({ offset = 0, color }) {
  const ref = useRef();
  const tangent = useRef(new Vector3());
  useFrame(({ clock }) => {
    const progress = trafficProgress(clock.elapsedTime, offset);
    ref.current.position.copy(trafficRoute.getPointAt(progress));
    trafficRoute.getTangentAt(progress, tangent.current);
    ref.current.rotation.y = -Math.atan2(tangent.current.z, tangent.current.x);
  });
  return (
    <group ref={ref}>
      <Vehicle color={color} />
    </group>
  );
}
