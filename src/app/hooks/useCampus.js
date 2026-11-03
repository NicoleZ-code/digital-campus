import { useMemo, useReducer, useState, useCallback } from 'react';
import { defaultSelection } from '../../domain/campus/constants.js';
import { navigationReducer } from '../../domain/campus/navigation.js';
import { getContextMetrics } from '../../domain/campus/metrics.js';
import useSceneOptions from './useSceneOptions.js';
import useModelExport from './useModelExport.js';
import useNotice from './useNotice.js';

// 应用层负责协调数据仓库与领域规则。
// 应用层不依赖几何模型、图表实现或浏览器下载功能。
export default function useCampus(repository) {
  const [selection, dispatch] = useReducer(navigationReducer, defaultSelection);
  const [period, setPeriod] = useState('24h');
  const [tab, setTab] = useState('overview');
  const { notice, notify } = useNotice();
  const scene = useSceneOptions();
  const exporting = useModelExport(notify);
  const buildings = useMemo(() => repository.listBuildings(), [repository]);
  const alerts = useMemo(() => repository.listAlerts(), [repository]);
  const building = buildings.find((item) => item.id === selection.buildingId);
  const rooms = useMemo(
    () => repository.getRooms(selection.buildingId, selection.floor),
    [repository, selection.buildingId, selection.floor],
  );
  const room = rooms[selection.roomIndex];
  const assets = useMemo(() => repository.getAssets(room), [repository, room]);
  const data = { buildings, alerts, building, rooms, room, assets };
  const metrics = getContextMetrics({ ...data, ...selection });

  function transition(action) {
    dispatch(action);
    scene.resetView();
  }
  function go(level) {
    transition({ type: 'navigate', level });
  }
  function selectBuilding(buildingId) {
    const target = buildings.find((item) => item.id === buildingId);
    if (!target) return;
    transition({
      type: 'selectBuilding',
      buildingId,
      floor: Math.min(defaultSelection.floor, target.floors),
    });
  }
  function selectFloor(floor) {
    if (!Number.isInteger(floor) || floor < 1 || floor > building.floors) return;
    transition({ type: 'selectFloor', floor });
  }
  function selectRoom(target) {
    const roomIndex = rooms.findIndex((item) => item.id === target.id);
    transition({ type: 'selectRoom', roomIndex });
  }
  function setAsset(asset) {
    dispatch({ type: 'selectAsset', asset });
  }
  const closeAsset = useCallback(() => dispatch({ type: 'selectAsset', asset: null }), []);
  function locateAlert(alert) {
    if (!alert) return;
    transition({ type: 'locateAlert', alert });
    setTab('alerts');
  }
  function reset() {
    dispatch({ type: 'reset' });
    scene.resetOptions();
    setTab('overview');
  }
  function advance() {
    if (selection.level === 0) go(1);
    else if (selection.level === 1) selectBuilding(building.id);
    else if (selection.level === 2) selectFloor(selection.floor);
    else if (selection.level === 3) selectRoom(room);
    else setAsset(assets[0]);
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
