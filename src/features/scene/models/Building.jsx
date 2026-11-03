import React, { useState } from 'react';
import { useCursor, Html } from '@react-three/drei';
import Box from '../primitives/Box.jsx';
import FacadeBand from './FacadeBand.jsx';
import Rooftop from './Rooftop.jsx';
import { FLOOR_HEIGHT } from '../config/architecture.js';

export default function Building({ data, selected, layer, onSelect, labels }) {
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const [width, depth] = data.size;
  const height = data.floors * FLOOR_HEIGHT;
  const accent = layer === 'energy' ? (data.energy > 9000 ? '#dba66b' : data.color) : data.color;
  return (
    <group
      name={data.id}
      userData={{ buildingId: data.id }}
      position={data.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id);
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <Box
        position={[0, 0.1, 0]}
        size={[width + 1.6, 0.2, depth + 1.6]}
        color="#819b9f"
      />
      {[0, 1, 2].map((step) => (
        <Box
          key={step}
          position={[0, 0.16 + step * 0.07, depth / 2 + 0.45 - step * 0.15]}
          size={[width * 0.48, 0.12, 0.9 - step * 0.2]}
          color="#a8bfc0"
        />
      ))}
      <Box
        position={[0, height / 2 + 0.3, 0]}
        size={[width - 0.07, height, depth - 0.07]}
        color="#163843"
        material={{ roughness: 0.28, metalness: 0.48 }}
      />
      {Array.from({ length: data.floors }, (_, i) => (
        <group
          key={i}
          position={[0, 0.3 + i * FLOOR_HEIGHT, 0]}
        >
          <FacadeBand
            width={width}
            depth={depth}
            seed={i}
          />
        </group>
      ))}
      <group position={[0, 0.3 + height, 0]}>
        <Rooftop
          width={width}
          depth={depth}
        />
      </group>
      <Box
        position={[0, 0.85, depth / 2 + 0.035]}
        size={[1.4, 1.05, 0.08]}
        color="#3d8e9b"
        material={{ metalness: 0.65, roughness: 0.12 }}
      />
      <Box
        position={[0, 0.85, depth / 2 + 0.09]}
        size={[0.04, 1.05, 0.04]}
        color="#b0cece"
      />
      <Box
        position={[0, 1.45, depth / 2 + 0.4]}
        size={[2.3, 0.07, 0.9]}
        color="#81bac1"
        material={{ roughness: 0.15, metalness: 0.7 }}
      />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          position={[side * 1.02, 0.85, depth / 2 + 0.72]}
          size={[0.045, 1.2, 0.045]}
          color="#96b7bd"
        />
      ))}
      {(selected || hover) && (
        <group>
          {[-1, 1].map((side) => (
            <React.Fragment key={side}>
              <Box
                position={[0, 0.24, side * (depth / 2 + 0.6)]}
                size={[width + 1.2, 0.025, 0.025]}
                color={accent}
                material={{ emissive: accent, emissiveIntensity: 0.7 }}
              />
              <Box
                position={[side * (width / 2 + 0.6), 0.24, 0]}
                size={[0.025, 0.025, depth + 1.2]}
                color={accent}
                material={{ emissive: accent, emissiveIntensity: 0.7 }}
              />
            </React.Fragment>
          ))}
        </group>
      )}
      {labels && (
        <Html
          position={[0, height + 2, 0]}
          center
          distanceFactor={48}
        >
          <button
            className={`building-label ${selected ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(data.id);
            }}
          >
            <b style={{ color: data.color }}>{data.code}</b>
            <span>
              {data.name}
              <small>
                {data.floors}F · {data.use}
              </small>
            </span>
            <span>↗</span>
          </button>
        </Html>
      )}
    </group>
  );
}
