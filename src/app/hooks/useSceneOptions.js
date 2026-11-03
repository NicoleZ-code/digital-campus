import { useState, useCallback } from 'react';

export default function useSceneOptions() {
  const [layer, setLayer] = useState('normal');
  const [labels, setLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [revision, setRevision] = useState(0);
  const resetView = useCallback(() => setRevision((value) => value + 1), []);
  function resetOptions() {
    setLayer('normal');
    setAutoRotate(false);
    resetView();
  }
  return {
    options: { layer, labels, autoRotate, revision },
    resetView,
    resetOptions,
    toggleLayer: () => setLayer((value) => (value === 'energy' ? 'normal' : 'energy')),
    toggleLabels: () => setLabels((value) => !value),
    toggleRotate: () => setAutoRotate((value) => !value),
  };
}
