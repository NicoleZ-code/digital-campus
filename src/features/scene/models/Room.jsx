import React from 'react';
import { Html } from '@react-three/drei';
import Box from '../primitives/Box.jsx';
import Furniture, { Plant } from './Furniture.jsx';

export default function Room({ data: r, selected, layer, labels, onSelect }) {
  return (
    <group
      name={r.id}
      userData={{ roomId: r.id, floorId: r.floorId }}
      position={[r.position[0], 0.15, r.position[1]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(r);
      }}
    >
      <Box
        position={[0, 0.04, 0]}
        size={[3.8, 0.08, 2.8]}
        color={selected ? '#72c6b6' : layer === 'energy' && r.energy > 200 ? '#bda878' : '#8cacae'}
        material={{ roughness: 0.85, metalness: 0 }}
      />
      <Box
        position={[0, 0.4, -1.4]}
        size={[3.8, 0.72, 0.07]}
        color="#b1cbd0"
      />
      <Box
        position={[-1.9, 0.4, 0]}
        size={[0.07, 0.72, 2.8]}
        color="#b1cbd0"
      />
      <Box
        position={[1.9, 0.4, 0]}
        size={[0.07, 0.72, 2.8]}
        color="#b1cbd0"
      />
      <Box
        position={[-0.7, 0.26, 1.4]}
        size={[2.4, 0.45, 0.065]}
        color="#b1cbd0"
      />
      <Box
        position={[1.6, 0.26, 1.4]}
        size={[0.6, 0.45, 0.065]}
        color="#b1cbd0"
      />
      <Box
        position={[0.8, 0.22, 1.4]}
        size={[0.7, 0.02, 0.1]}
        color="#64bea9"
      />
      <group position={[0, 0.09, 0]}>
        <Furniture kind={r.name} />
        <Plant position={[-1.55, 0, 1.05]} />
      </group>
      <group name="room-devices">
        <Box
          position={[-1.1, 0.93, -1.4]}
          size={[0.85, 0.22, 0.2]}
          color="#d0dddd"
        />
        <Box
          position={[-1.1, 0.86, -1.28]}
          size={[0.68, 0.035, 0.03]}
          color="#62818b"
        />
        <Box
          position={[1.25, 0.65, -1.34]}
          size={[0.13, 0.17, 0.06]}
          color="#d1e7e1"
        />
        <Box
          position={[1.25, 0.66, -1.3]}
          size={[0.075, 0.04, 0.01]}
          color={r.warning ? '#d2a16b' : '#5fbdac'}
          material={{ emissive: '#56b79e', emissiveIntensity: 0.4 }}
        />
        <Box
          position={[1.77, 0.5, 0.85]}
          size={[0.08, 0.17, 0.2]}
          color="#c4d9d8"
        />
        {r.name === '智能会议室' && (
          <>
            <Box
              position={[0, 0.73, -1.34]}
              size={[1.15, 0.6, 0.07]}
              color="#263f4b"
            />
            <Box
              position={[0, 0.74, -1.295]}
              size={[1.04, 0.49, 0.012]}
              color="#498493"
              material={{ emissive: '#245e6b', emissiveIntensity: 0.25 }}
            />
          </>
        )}
      </group>
      {labels && (
        <Html
          position={[0, 1.6, 0]}
          center
        >
          <button
            className={`room-label ${selected ? 'selected' : ''}`}
            onClick={() => onSelect(r)}
          >
            {r.number} · {r.name}
            {r.warning && <i />}
          </button>
        </Html>
      )}
    </group>
  );
}
