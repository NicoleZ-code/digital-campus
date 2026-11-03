import React, { useMemo } from 'react';
import BatchBoxes from '../primitives/BatchBoxes.jsx';
import { createFacade } from '../config/architecture.js';

export default function FacadeBand({ width, depth, height = 0.8, seed = 0 }) {
  const { frames, panes } = useMemo(
    () => createFacade(width, depth, height, seed),
    [width, depth, height, seed],
  );
  return (
    <group name="curtain-wall">
      <BatchBoxes
        items={panes}
        roughness={0.19}
        metalness={0.65}
      />
      <BatchBoxes
        items={frames}
        metalness={0.7}
        roughness={0.33}
      />
    </group>
  );
}
