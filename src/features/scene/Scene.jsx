import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import Box from './primitives/Box.jsx';
import Ground from './models/Ground.jsx';
import Car from './models/Car.jsx';
import Building from './models/Building.jsx';
import Floors from './models/Floors.jsx';
import City from './models/City.jsx';
import ModelExport from './effects/ModelExport.jsx';
import CameraRig from './controls/CameraRig.jsx';
import { canvasCamera } from './config/camera.js';
import SceneEnvironment from './effects/SceneEnvironment.jsx';
export default function Scene(props) {
  const modelRef = useRef();
  const {
    level,
    buildings,
    building,
    floor,
    rooms,
    assets,
    room,
    onBuilding,
    onFloor,
    onRoom,
    onEnter,
    labels,
    layer,
    revision,
    autoRotate,
  } = props;
  return (
    <Canvas
      shadows
      dpr={[1, 1.7]}
      camera={canvasCamera}
      gl={{ antialias: true }}
    >
      <SceneEnvironment />
      <group ref={modelRef}>
        {level === 0 ? (
          <City
            onEnter={onEnter}
            labels={labels}
          />
        ) : level === 1 ? (
          <>
            <Ground />
            {buildings.map((b) => (
              <Building
                key={b.id}
                data={b}
                selected={building.id === b.id}
                layer={layer}
                onSelect={onBuilding}
                labels={labels}
              />
            ))}
            <Car />
            <Car
              offset={35}
              color="#7ba6b4"
            />
            <Car
              offset={68}
              color="#345d70"
            />
          </>
        ) : (
          <>
            <Box
              position={[0, -0.5, 0]}
              size={[15, 0.5, 13]}
              color="#173e49"
              edge
            />
            <Floors
              building={building}
              floor={floor}
              level={level}
              onFloor={onFloor}
              onRoom={onRoom}
              room={room}
              rooms={rooms}
              labels={labels}
              layer={layer}
            />
          </>
        )}
      </group>
      <ModelExport
        request={props.exportRequest}
        modelRef={modelRef}
        onComplete={props.onExportComplete}
      />
      {level === 4 &&
        assets.map((a, i) => (
          <Html
            key={a.id}
            position={[
              room.position[0] + [-1.1, 1.25, 1.77][i],
              3.7,
              room.position[1] + [-1.4, -1.34, 0.85][i],
            ]}
            center
          >
            <button
              className={`asset-pin ${a.status === '告警' ? 'warning' : ''}`}
              onClick={() => props.onAsset(a)}
              title={a.name}
            >
              {i + 1}
            </button>
          </Html>
        ))}
      <CameraRig
        level={level}
        room={room}
        revision={revision}
        autoRotate={autoRotate}
      />
    </Canvas>
  );
}
