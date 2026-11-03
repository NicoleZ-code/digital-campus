import React from 'react';
import Box from '../primitives/Box.jsx';

export function Bench({ position, rotation = 0 }) {
  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
      name="park-bench"
    >
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          position={[0, 0.42, -0.19 + i * 0.12]}
          size={[1.15, 0.055, 0.075]}
          color="#9e9e82"
        />
      ))}
      {[-0.42, 0.42].map((x) => (
        <Box
          key={x}
          position={[x, 0.24, 0]}
          size={[0.055, 0.4, 0.45]}
          color="#364e53"
        />
      ))}
      <Box
        position={[0, 0.69, -0.23]}
        size={[1.15, 0.32, 0.055]}
        color="#9e9e82"
      />
    </group>
  );
}
export function Lamp({ position }) {
  return (
    <group
      position={position}
      name="street-light"
    >
      <Box
        position={[0, 1, 0]}
        size={[0.055, 2, 0.055]}
        color="#728c94"
      />
      <Box
        position={[0.2, 2, 0]}
        size={[0.45, 0.06, 0.18]}
        color="#b2c8c9"
      />
      <Box
        position={[0.2, 1.96, 0]}
        size={[0.32, 0.025, 0.12]}
        color="#d8fff2"
        material={{ emissive: '#c0ffe3', emissiveIntensity: 0.7 }}
      />
    </group>
  );
}
export function Pedestrian({ position, rotation = 0, color = '#9abdb5' }) {
  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
      name="pedestrian"
    >
      <mesh
        position={[0, 0.63, 0]}
        castShadow
      >
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial color="#c4b2a0" />
      </mesh>
      <Box
        position={[0, 0.43, 0]}
        size={[0.2, 0.29, 0.12]}
        color={color}
      />
      {[-1, 1].map((s) => (
        <React.Fragment key={s}>
          <Box
            position={[s * 0.055, 0.17, s * 0.035]}
            size={[0.065, 0.3, 0.08]}
            color="#344753"
          />
          <Box
            position={[s * 0.14, 0.42, 0]}
            rotation={[0, 0, s * 0.15]}
            size={[0.055, 0.27, 0.07]}
            color={color}
          />
        </React.Fragment>
      ))}
    </group>
  );
}
