import { mockCampusRepository } from '../infrastructure/repositories/mockCampusRepository.js';
import { getContextMetrics } from '../domain/campus/metrics.js';

export const buildings = mockCampusRepository.listBuildings();
export const alerts = mockCampusRepository.listAlerts();
export const roomsFor = mockCampusRepository.getRooms;
export const assetsFor = mockCampusRepository.getAssets;
export function contextMetrics(level, building, floor, room) {
  return getContextMetrics({
    level,
    building,
    floor,
    room,
    rooms: roomsFor(building.id, floor),
    assets: assetsFor(room),
    buildings,
    alerts,
  });
}
