/**
 * @file useCampus.js
 * @description 应用层编排 Hook：协调数据仓储、导航状态与场景选项，向视图层输出整理后的状态。
 */

import { useMemo, useReducer, useState, useCallback, useSyncExternalStore, useEffect } from 'react';
import { defaultSelection } from '../../domain/campus/constants.js';
import { navigationReducer } from '../../domain/campus/navigation.js';
import { getContextMetrics } from '../../domain/campus/metrics.js';
import { createCatalog, resolveContext } from '../../domain/campus/catalog.js';
import useSceneOptions from './useSceneOptions.js';
import useModelExport from './useModelExport.js';
import useNotice from './useNotice.js';

// 应用层负责协调数据仓库与领域规则。
// 应用层不依赖几何模型、图表实现或浏览器下载功能。
/**
 * 应用层编排 Hook：协调数据仓储、导航状态与场景选项，向视图层输出整理后的状态与操作。
 * 订阅仓储快照并构建目录索引，将用户请求的选择 reconciling 为有效的上下文选择。
 * @param {object} repository - 园区数据仓储实例（subscribe / getSnapshot）
 * @returns {object} 编排结果
 * @returns {object} returns.selection - 归一化后的当前选择（level / buildingId / floor / roomId / assetId）
 * @returns {object} returns.data - 当前上下文数据（city / campus / campuses / buildings / alerts / building / rooms / room / assets / asset / metrics）
 * @returns {object} returns.scene - 场景展示选项与开关（来自 useSceneOptions）
 * @returns {object} returns.exporting - 模型导出状态与操作（来自 useModelExport）
 * @returns {string} returns.notice - 当前提示消息文本
 * @returns {(message: string) => void} returns.notify - 发出提示消息
 * @returns {object} returns.operations - 运营面板状态（period / setPeriod / tab / setTab）
 * @returns {object} returns.navigation - 导航操作集合（go / selectCity / selectCampus / selectBuilding / selectFloor / selectRoom / setAsset / closeAsset / locateAlert / reset / advance）
 */
export default function useCampus(repository) {
  // 用户请求的选择（可能无效），由 reducer 按 action 更新
  const [requestedSelection, dispatch] = useReducer(navigationReducer, defaultSelection);
  // 运营面板：统计周期与当前标签页
  const [period, setPeriod] = useState('24h');
  const [tab, setTab] = useState('overview');
  const { notice, notify } = useNotice();
  const scene = useSceneOptions();
  const exporting = useModelExport(notify);
  // 订阅仓储，快照引用稳定以避免重复渲染
  const snapshot = useSyncExternalStore(
    repository.subscribe,
    repository.getSnapshot,
    repository.getSnapshot,
  );
  // 基于快照构建索引目录（含 city / campus 与 roomsById / assets 等查找结构）
  const catalog = useMemo(() => createCatalog(snapshot), [snapshot]);
  const { city, campus, campuses, buildings, alerts } = catalog;
  // 将请求选择解析为有效上下文：返回归一化后的 selection 及各层级实体
  const { selection, building, rooms, room, assets, asset } = resolveContext(
    catalog,
    requestedSelection,
  );
  // 数据变化后校正请求选择（如所选房间已不存在），保持 selection 始终有效
  useEffect(() => {
    const resolved = resolveContext(catalog, requestedSelection).selection;
    if (Object.keys(resolved).some((key) => resolved[key] !== requestedSelection[key])) {
      dispatch({ type: 'reconcile', selection: resolved });
    }
  }, [catalog, requestedSelection]);
  // 当前上下文数据集合，供面板与场景使用（city / campuses 用于城市层，campus 为当前园区）
  const data = { city, campus, campuses, buildings, alerts, building, rooms, room, assets, asset };
  // 计算当前上下文的统计指标（能耗、在线/离线/告警数等），统计范围限定在当前园区内
  const metrics = getContextMetrics({
    ...data,
    ...selection,
    allRooms: catalog.rooms,
    allAssets: catalog.assets,
  });

  /**
   * 派发导航 action 并重置场景视角。
   * @param {object} action - 交给 navigationReducer 的 action 对象
   * @returns {void}
   */
  function transition(action) {
    dispatch(action);
    scene.resetView();
  }

  /**
   * 跳转到指定导航层级（0 园区 / 1 楼宇 / 2 楼层 / 3 房间 / 4 资产）。
   * @param {number} level - 目标层级
   * @returns {void}
   */
  function go(level) {
    transition({ type: 'navigate', level });
  }

  /**
   * 选中指定城市：目录中不存在该城市时忽略。
   * @param {string} cityId - 城市 id（如 city-shanghai）
   * @returns {void}
   */
  function selectCity(cityId) {
    if (!city || city.id !== cityId) {
      return;
    }
    transition({ type: 'selectCity', cityId });
  }

  /**
   * 选中指定园区：目录中不存在该园区时忽略。
   * @param {string} campusId - 园区 id（如 campus-haixu）
   * @returns {void}
   */
  function selectCampus(campusId) {
    if (!catalog.campusesById.has(campusId)) {
      return;
    }
    transition({ type: 'selectCampus', campusId });
  }

  /**
   * 选中指定楼宇，并默认选择其合法楼层（不超过默认楼层号）。
   * @param {string} buildingId - 楼宇 id
   * @returns {void}
   */
  function selectBuilding(buildingId) {
    const target = buildings.find((item) => item.id === buildingId);
    if (!target) {
      return;
    }
    transition({
      type: 'selectBuilding',
      buildingId,
      floor: Math.min(defaultSelection.floor, target.floors),
    });
  }

  /**
   * 选中当前楼宇的指定楼层（须为 1..building.floors 内的整数）。
   * @param {number} floor - 楼层号
   * @returns {void}
   */
  function selectFloor(floor) {
    if (!Number.isInteger(floor) || floor < 1 || floor > (building?.floors ?? 0)) {
      return;
    }
    transition({ type: 'selectFloor', floor });
  }

  /**
   * 选中当前楼层的指定房间。
   * @param {object|null} target - 房间实体（须存在于当前房间列表），可为 null 表示无效选择
   * @returns {void}
   */
  function selectRoom(target) {
    const selectedRoom = rooms.find((item) => item.id === target?.id);
    if (!selectedRoom) {
      return;
    }
    transition({ type: 'selectRoom', roomId: selectedRoom.id });
  }

  /**
   * 打开当前房间的指定资产详情弹窗（不重置视角）。
   * @param {object|null} asset - 资产实体（须存在于当前资产列表），可为 null 表示无效选择
   * @returns {void}
   */
  function setAsset(asset) {
    if (!assets.some((item) => item.id === asset?.id)) {
      return;
    }
    dispatch({ type: 'selectAsset', assetId: asset.id });
  }

  /** 关闭资产详情弹窗，清除选中资产。 */
  const closeAsset = useCallback(() => dispatch({ type: 'selectAsset', assetId: null }), []);

  /**
   * 定位到指定告警：校验告警与其房间信息一致后跳转至房间层级并切到告警标签页。
   * @param {object|null} alert - 告警实体（须存在于当前告警列表），可为 null 表示无效定位
   * @returns {void}
   */
  function locateAlert(alert) {
    if (!alerts.some((item) => item.id === alert?.id)) {
      return;
    }
    const targetRoom = catalog.roomsById.get(alert.roomId);
    if (
      !targetRoom ||
      targetRoom.buildingId !== alert.buildingId ||
      targetRoom.floor !== alert.floor
    ) {
      return;
    }
    transition({ type: 'locateAlert', alert });
    setTab('alerts');
  }

  /**
   * 重置导航选择、场景选项与运营面板标签页到初始状态。
   * @returns {void}
   */
  function reset() {
    dispatch({ type: 'reset' });
    scene.resetOptions();
    setTab('overview');
  }

  /**
   * 演示引导：按当前层级自动进入下一步（园区→楼宇→楼层→房间→首个资产）。
   * @returns {void}
   */
  function advance() {
    if (selection.level === 0) {
      go(1);
    } else if (selection.level === 1) {
      selectBuilding(building?.id);
    } else if (selection.level === 2) {
      selectFloor(selection.floor);
    } else if (selection.level === 3) {
      selectRoom(room);
    } else if (assets[0]) {
      setAsset(assets[0]);
    }
  }

  return {
    selection,
    data: { ...data, metrics },
    scene,
    exporting,
    notice,
    notify,
    operations: { period, setPeriod, tab, setTab },
    navigation: {
      go,
      selectCity,
      selectCampus,
      selectBuilding,
      selectFloor,
      selectRoom,
      setAsset,
      closeAsset,
      locateAlert,
      reset,
      advance,
    },
  };
}
