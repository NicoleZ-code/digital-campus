import React, { useMemo } from 'react';
import Box from '../primitives/Box.jsx';
import BatchBoxes from '../primitives/BatchBoxes.jsx';

export default function Rooftop({ width, depth }) {
  const louvers = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        position: [-width * 0.25 + (i * width * 0.5) / 15, 0.36, 0],
        size: [0.055, 0.23, depth * 0.5],
        color: '#253f48',
      })),
    [width, depth],
  );
  return (
    <group name="roof-equipment">
      <Box
        position={[0, 0.03, 0]}
        size={[width + 0.2, 0.16, depth + 0.2]}
        color="#c0d0d0"
      />
      {[-1, 1].map((side) => (
        <React.Fragment key={side}>
          <Box
            position={[0, 0.19, (side * depth) / 2]}
            size={[width, 0.22, 0.07]}
            color="#b7c7c8"
          />
          <Box
            position={[(side * width) / 2, 0.19, 0]}
            size={[0.07, 0.22, depth]}
            color="#b7c7c8"
          />
        </React.Fragment>
      ))}
      <Box
        position={[0, 0.2, 0]}
        size={[width * 0.55, 0.28, depth * 0.55]}
        color="#19323d"
      />
      <BatchBoxes items={louvers} />
      {[-0.22, 0.22].map((x) => (
        <group
          key={x}
          position={[width * x, 0.52, 0]}
        >
          <Box
            size={[width * 0.19, 0.32, depth * 0.23]}
            color="#647d85"
          />
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.17, 0]}
          >
            <cylinderGeometry args={[0.29, 0.29, 0.025, 24]} />
            <meshStandardMaterial color="#1e333c" />
          </mesh>
          <mesh
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0.19, 0]}
          >
            <torusGeometry args={[0.23, 0.025, 6, 24]} />
            <meshStandardMaterial color="#94abb1" />
          </mesh>
        </group>
      ))}
      <Box
        position={[width * 0.35, 0.55, -depth * 0.3]}
        size={[0.04, 1.1, 0.04]}
        color="#bac9cb"
      />
    </group>
  );
}
