import { defaultSelection, stageNames } from './constants.js';

export function navigationReducer(state, action) {
  switch (action.type) {
    case 'navigate':
      if (!Number.isInteger(action.level) || action.level < 0 || action.level >= stageNames.length)
        return state;
      return { ...state, level: action.level, asset: null };
    case 'selectBuilding':
      return {
        ...state,
        buildingId: action.buildingId,
        floor: action.floor,
        roomIndex: defaultSelection.roomIndex,
        level: 2,
        asset: null,
      };
    case 'selectFloor':
      return {
        ...state,
        floor: action.floor,
        roomIndex: defaultSelection.roomIndex,
        level: 3,
        asset: null,
      };
    case 'selectRoom':
      if (action.roomIndex < 0) return state;
      return { ...state, roomIndex: action.roomIndex, level: 4, asset: null };
    case 'locateAlert':
      return {
        ...state,
        buildingId: action.alert.buildingId,
        floor: action.alert.floor,
        roomIndex: action.alert.roomIndex,
        level: 4,
        asset: null,
      };
    case 'selectAsset':
      return { ...state, asset: action.asset };
    case 'reset':
      return { ...defaultSelection };
    default:
      return state;
  }
}
