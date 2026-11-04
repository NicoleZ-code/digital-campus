/**
 * @file navigation.js
 * @description 导航状态机：根据用户动作生成下一份层级选择状态。
 */

import { defaultSelection, stageLevel, stageNames } from './constants.js';

/** 校验是否为非空字符串 ID。 */
const validId = (value) => typeof value === 'string' && value.length > 0;
/** 校验是否为大于等于 1 的整数楼层号。 */
const validFloor = (value) => Number.isInteger(value) && value >= 1;

/**
 * 导航状态机：根据用户动作生成下一份层级选择状态。
 * 动作非法时返回原状态；除 selectAsset 外的跳转都会清空 selectedAssetId。
 * 层级链：cityId → campusId → buildingId → floor → roomId → selectedAssetId，逐级持有上级 ID。
 * @param {Object} state - 当前导航选择状态（含 level、cityId、campusId、buildingId、floor、roomId、selectedAssetId）。
 * @param {Object} action - 用户动作。
 * @param {string} action.type - 动作类型：navigate / selectCity / selectCampus / selectBuilding / selectFloor / selectRoom / locateAlert / selectAsset / reconcile / reset。
 * @param {number} [action.level] - navigate 的目标层级。
 * @param {string} [action.cityId] - selectCity 的城市 ID。
 * @param {string} [action.campusId] - selectCampus 的园区 ID。
 * @param {string} [action.buildingId] - selectBuilding 的楼宇 ID。
 * @param {number} [action.floor] - selectBuilding / selectFloor 的楼层号。
 * @param {string} [action.roomId] - selectRoom 的房间 ID。
 * @param {Object} [action.alert] - locateAlert 的告警对象，需含 buildingId、floor、roomId。
 * @param {?string} [action.assetId] - selectAsset 的设备 ID，null 表示取消选中。
 * @param {Object} [action.selection] - reconcile 用于整体替换的选择状态。
 * @returns {Object} 新的导航选择状态。
 */
export function navigationReducer(state, action) {
  switch (action.type) {
    case 'navigate':
      if (
        !Number.isInteger(action.level) ||
        action.level < 0 ||
        action.level >= stageNames.length
      ) {
        return state;
      }
      return { ...state, level: action.level, selectedAssetId: null };
    case 'selectCity':
      if (!validId(action.cityId)) {
        return state;
      }
      // 切换城市时清空下级园区/楼宇/房间选择，由目录解析回退到合法值
      return {
        ...state,
        cityId: action.cityId,
        campusId: null,
        buildingId: null,
        floor: 1,
        roomId: null,
        level: stageLevel.city,
        selectedAssetId: null,
      };
    case 'selectCampus':
      if (!validId(action.campusId)) {
        return state;
      }
      // 切换园区时清空楼宇及以下选择，园区内楼宇由目录解析回退到首个
      return {
        ...state,
        campusId: action.campusId,
        buildingId: null,
        floor: 1,
        roomId: null,
        level: stageLevel.campus,
        selectedAssetId: null,
      };
    case 'selectBuilding':
      if (!validId(action.buildingId) || !validFloor(action.floor)) {
        return state;
      }
      return {
        ...state,
        buildingId: action.buildingId,
        floor: action.floor,
        roomId: null,
        level: 2,
        selectedAssetId: null,
      };
    case 'selectFloor':
      if (!validFloor(action.floor)) {
        return state;
      }
      return { ...state, floor: action.floor, roomId: null, level: 3, selectedAssetId: null };
    case 'selectRoom':
      if (!validId(action.roomId)) {
        return state;
      }
      return { ...state, roomId: action.roomId, level: 4, selectedAssetId: null };
    case 'locateAlert':
      if (
        !validId(action.alert?.buildingId) ||
        !validFloor(action.alert?.floor) ||
        !validId(action.alert?.roomId)
      ) {
        return state;
      }
      return {
        ...state,
        buildingId: action.alert.buildingId,
        floor: action.alert.floor,
        roomId: action.alert.roomId,
        level: 4,
        selectedAssetId: null,
      };
    case 'selectAsset':
      if (action.assetId !== null && !validId(action.assetId)) {
        return state;
      }
      return { ...state, selectedAssetId: action.assetId };
    case 'reconcile':
      return { ...action.selection };
    case 'reset':
      return { ...defaultSelection };
    default:
      return state;
  }
}
