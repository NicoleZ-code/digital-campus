import React from 'react';
import { stageNames } from '../../domain/campus/constants.js';

export default function StageNavigation({ level, onNavigate: go }) {
  return (
    <div className="steps">
      {stageNames.map((name, i) => (
        <button
          key={name}
          className={level === i ? 'active' : i < level ? 'done' : ''}
          onClick={() => go(i)}
        >
          <span>0{i + 1}</span>
          {name}
          {i < 4 && <span className="step-line" />}
        </button>
      ))}
    </div>
  );
}
