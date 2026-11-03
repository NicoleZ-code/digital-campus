import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { MathUtils } from 'three';
import Box from '../primitives/Box.jsx';
import Room from './Room.jsx';
import FacadeBand from './FacadeBand.jsx';
import { getFloorPosition } from '../config/layout.js';
export default function Floor({
  index,
  selected,
  expanded,
  onFloor,
  onRoom,
  room,
  rooms,
  labels,
  building,
  layer,
}) {
  const ref = useRef();
  const { x: targetX, y: target } = getFloorPosition(index, building.floors, expanded, selected);
  // 楼层展开后，仅选中的楼层保持可交互。
  useFrame((_, dt) => {
    ref.current.position.y = MathUtils.damp(ref.current.position.y, target, 5, dt);
    ref.current.position.x = MathUtils.damp(ref.current.position.x, targetX, 5, dt);
  });
  return (
    <group
      ref={ref}
      name={`${building.id}-f${index}`}
      userData={{ buildingId: building.id, floorId: `${building.id}-f${index}` }}
      onClick={(e) => {
        if (!expanded) {
          e.stopPropagation();
          onFloor(index);
        }
      }}
    >
      <Box
        position={[0, 0, 0]}
        size={[12.5, 0.16, 7.8]}
        color={selected ? '#a2d8cc' : '#789ba4'}
        opacity={expanded && !selected ? 0.065 : 1}
        castShadow={!expanded || selected}
        edge
      />
      {!expanded && (
        <>
          <FacadeBand
            width={12.4}
            depth={7.7}
            seed={index}
          />
          {selected && (
            <Box
              position={[0, 0.09, 0]}
              size={[12.4, 0.08, 7.7]}
              color="#7cdfc3"
              material={{ emissive: '#62bda8', emissiveIntensity: 0.2 }}
            />
          )}
          {labels && (
            <Html
              position={[6.9, 0.25, 0]}
              center
            >
              <button
                className={`floor-label ${selected ? 'active' : ''}`}
                onClick={() => onFloor(index)}
              >
                {String(index).padStart(2, '0')}F
              </button>
            </Html>
          )}
        </>
      )}
      {expanded && selected && (
        <>
          {rooms.map((r) => (
            <Room
              key={r.id}
              data={r}
              selected={room?.id === r.id}
              layer={layer}
              labels={labels}
              onSelect={onRoom}
            />
          ))}
          <Line
            points={[
              [-6.1, 0.2, 0],
              [6.1, 0.2, 0],
            ]}
            color="#83ffe2"
            lineWidth={1}
          />
        </>
      )}
    </group>
  );
}
