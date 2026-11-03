import React from 'react';
import { Edges } from '@react-three/drei';
export default function Box({
  position,
  size,
  color = '#234955',
  opacity = 1,
  edge = false,
  material = {},
  ...props
}) {
  return (
    <mesh
      castShadow
      receiveShadow
      position={position}
      {...props}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        roughness={0.5}
        metalness={0.35}
        {...material}
      />
      {edge && (
        <Edges
          color="#80c9cc"
          threshold={20}
        />
      )}
    </mesh>
  );
}
