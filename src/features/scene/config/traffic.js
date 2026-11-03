import { CatmullRomCurve3, Vector3 } from 'three';

// 圆角路线可让车辆保持在环形道路内，并避免转向过于突然。
export const trafficRoute = new CatmullRomCurve3(
  [
    [-12.9, 0.18, 10.2],
    [-11.2, 0.18, 11.65],
    [11.3, 0.18, 11.65],
    [13.6, 0.18, 10.1],
    [13.6, 0.18, -9.4],
    [11.5, 0.18, -10.8],
    [-11.7, 0.18, -10.8],
    [-13.8, 0.18, -9.2],
    [-13.8, 0.18, 8.7],
  ].map((p) => new Vector3(...p)),
  true,
  'centripetal',
);
export function trafficProgress(seconds, offset) {
  return (((seconds * 0.018 + offset / 100) % 1) + 1) % 1;
}
