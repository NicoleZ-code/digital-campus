import React, { useMemo } from 'react';
import { Edges, Html, Line } from '@react-three/drei';
import { Shape, Path, CatmullRomCurve3, Vector3, DoubleSide } from 'three';
import districts from '../data/shanghai.json';
import { projectShanghai, huangpuRiver, parkCoordinate } from '../config/geography.js';
import BatchBoxes from '../primitives/BatchBoxes.jsx';
import Box from '../primitives/Box.jsx';

function District({ feature, index }) {
  const shapes = useMemo(
    () =>
      feature.geometry.coordinates.map((polygon) => {
        const shape = new Shape(
          polygon[0].map((p) => {
            const [x, y] = projectShanghai(p);
            return { x, y };
          }),
        );
        polygon.slice(1).forEach((ring) =>
          shape.holes.push(
            new Path(
              ring.map((p) => {
                const [x, y] = projectShanghai(p);
                return { x, y };
              }),
            ),
          ),
        );
        return shape;
      }),
    [feature],
  );
  return (
    <group name={feature.properties.name}>
      <mesh
        castShadow
        receiveShadow
      >
        <extrudeGeometry
          args={[
            shapes,
            {
              depth: 0.65,
              bevelEnabled: true,
              bevelSegments: 1,
              steps: 1,
              bevelSize: 0.015,
              bevelThickness: 0.02,
            },
          ]}
        />
        <meshStandardMaterial
          color={index % 3 === 0 ? '#205460' : index % 3 === 1 ? '#19434f' : '#285864'}
          metalness={0.4}
          roughness={0.45}
        />
        <Edges
          color="#51919e"
          threshold={30}
        />
      </mesh>
      {shapes.map((shape, i) => (
        <Line
          key={i}
          points={shape.getPoints().map((p) => [p.x, p.y, 0.68])}
          color="#69aab6"
          lineWidth={0.65}
        />
      ))}
    </group>
  );
}
function Skyline() {
  const blocks = useMemo(
    () =>
      Array.from({ length: 130 }, (_, i) => {
        const x = ((i % 13) - 6) * 0.32,
          y = (Math.floor(i / 13) - 5) * 0.32;
        return {
          position: [x, y, 0.78 + (i % 7) * 0.055],
          size: [0.13 + (i % 3) * 0.025, 0.16, 0.2 + (i % 7) * 0.11],
          color: i % 4 ? '#52848e' : '#76c8c7',
        };
      }),
    [],
  );
  return (
    <group name="illustrative-city-skyline">
      <BatchBoxes items={blocks} />
      <group position={[0.75, -0.2, 0.7]}>
        <mesh
          position={[0, 0, 1.2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.075, 0.13, 2.4, 20]} />
          <meshStandardMaterial
            color="#7cc4c5"
            metalness={0.7}
            roughness={0.22}
          />
        </mesh>
        {[0.65, 1.6].map((z, i) => (
          <mesh
            key={z}
            position={[0, 0, z]}
          >
            <sphereGeometry args={[i ? 0.16 : 0.26, 20, 16]} />
            <meshStandardMaterial
              color="#a3dddd"
              metalness={0.6}
              roughness={0.2}
            />
          </mesh>
        ))}
        <Box
          position={[0.5, 0, 0.9]}
          size={[0.23, 0.23, 1.8]}
          color="#659ba6"
        />
        <mesh
          position={[1, 0.15, 1.1]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.08, 0.22, 2.2, 6]} />
          <meshStandardMaterial
            color="#8dbfc6"
            metalness={0.65}
            roughness={0.25}
          />
        </mesh>
      </group>
    </group>
  );
}
export default function City({ onEnter, labels = true }) {
  const river = useMemo(
    () => new CatmullRomCurve3(huangpuRiver.map(([x, y]) => new Vector3(x, y, 0.73))),
    [],
  );
  const marker = projectShanghai(parkCoordinate);
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {districts.features.map((feature, index) => (
        <District
          key={feature.properties.adcode}
          feature={feature}
          index={index}
        />
      ))}
      <mesh>
        <tubeGeometry args={[river, 100, 0.055, 8, false]} />
        <meshStandardMaterial
          color="#68bbcd"
          emissive="#255762"
          emissiveIntensity={0.4}
          metalness={0.4}
          roughness={0.18}
        />
      </mesh>
      <Skyline />
      {[2.5, 4.5, 7].map((radius) => (
        <mesh
          key={radius}
          position={[0, 0, 0.76]}
        >
          <ringGeometry args={[radius, radius + 0.012, 100]} />
          <meshBasicMaterial
            color="#5796a0"
            transparent
            opacity={0.3}
            side={DoubleSide}
          />
        </mesh>
      ))}
      {[-3, 0, 3].map((v, i) => (
        <React.Fragment key={v}>
          <Line
            points={[
              [-8, v, 0.72],
              [7, v + 1, 0.72],
            ]}
            color="#4d919b"
            lineWidth={0.7}
            transparent
            opacity={0.45}
          />
          <Line
            points={[
              [v, -8, 0.72],
              [v + 1, 9, 0.72],
            ]}
            color="#4d919b"
            lineWidth={0.7}
            transparent
            opacity={0.45}
          />
          <mesh position={[v, v + 1, 0.76]}>
            <circleGeometry args={[0.055, 12]} />
            <meshBasicMaterial color={i % 2 ? '#80f5df' : '#4c9cac'} />
          </mesh>
        </React.Fragment>
      ))}
      <mesh position={[marker[0], marker[1], 0.8]}>
        <ringGeometry args={[0.28, 0.34, 48]} />
        <meshBasicMaterial
          color="#8affde"
          side={DoubleSide}
        />
      </mesh>
      <Line
        points={[
          [marker[0], marker[1], 0.8],
          [marker[0], marker[1], 3.3],
        ]}
        color="#8affe0"
        lineWidth={1.5}
      />
      <Html
        position={[marker[0], marker[1], 3.6]}
        center
      >
        <button
          className="map-pin"
          onClick={onEnter}
        >
          <span className="pulse-dot" />
          海序数字园区<small>31.2304° N · 121.4737° E</small>
          <b>进入园区 ↗</b>
        </button>
      </Html>
      {labels &&
        districts.features
          .filter((f) =>
            [
              '浦东新区',
              '崇明区',
              '嘉定区',
              '青浦区',
              '松江区',
              '奉贤区',
              '金山区',
              '宝山区',
            ].includes(f.properties.name),
          )
          .map((f) => {
            const p = projectShanghai(f.properties.centroid || f.properties.center);
            return (
              <Html
                key={f.properties.adcode}
                position={[p[0], p[1], 0.85]}
                center
              >
                <span className="district-label">{f.properties.name}</span>
              </Html>
            );
          })}
    </group>
  );
}
