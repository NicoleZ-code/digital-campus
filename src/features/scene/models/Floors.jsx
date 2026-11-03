import React from 'react';
import Floor from './Floor.jsx';
import Rooftop from './Rooftop.jsx';
export default function Floors({
  building,
  floor,
  level,
  onFloor,
  onRoom,
  room,
  rooms,
  labels,
  layer,
}) {
  return (
    <group>
      {level === 2 && (
        <group position={[0, (building.floors + 1) * 0.8, 0]}>
          <Rooftop
            width={12.4}
            depth={7.7}
          />
        </group>
      )}
      {Array.from({ length: building.floors }, (_, i) => (
        <Floor
          key={`${building.id}-${i}`}
          index={i + 1}
          selected={floor === i + 1}
          expanded={level >= 3}
          onFloor={onFloor}
          onRoom={onRoom}
          room={room}
          rooms={rooms}
          labels={labels && level !== 4}
          building={building}
          layer={layer}
        />
      ))}
    </group>
  );
}
