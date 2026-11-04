import React, { Suspense } from 'react';
import Scene from '../features/scene/Scene.jsx';
import useCampus from './hooks/useCampus.js';
import { getCampusView } from '../ui/config/presentation.js';
import AppHeader from '../ui/components/AppHeader.jsx';
import AppFooter from '../ui/components/AppFooter.jsx';
import SpatialPanel from '../ui/components/SpatialPanel.jsx';
import OperationsPanel from '../ui/components/OperationsPanel.jsx';
import StageNavigation from '../ui/components/StageNavigation.jsx';
import SceneControls from '../ui/components/SceneControls.jsx';
import AssetModal from '../ui/components/AssetModal.jsx';
import SceneBoundary from '../ui/components/SceneBoundary.jsx';

// 仅负责组装：注入数据仓库、维护应用状态，并向视图传递所需属性。
export default function App({ repository }) {
  const { selection, data, scene, exporting, operations, navigation, notice, notify } =
    useCampus(repository);
  const { level, floor, asset } = selection;
  const { building, room } = data;
  const view = getCampusView({ ...selection, ...data, period: operations.period });
  return (
    <div className="app">
      <AppHeader
        level={level}
        building={building}
        floor={floor}
        onNavigate={navigation.go}
        onReset={navigation.reset}
        onNotice={notify}
      />
      <main>
        <div className="scene">
          <SceneBoundary>
            <Suspense fallback={<div className="scene-error">正在构建数字空间…</div>}>
              <Scene
                level={level}
                buildings={data.buildings}
                building={building}
                floor={floor}
                rooms={data.rooms}
                room={room}
                assets={data.assets}
                assetOpen={Boolean(asset)}
                onBuilding={navigation.selectBuilding}
                onFloor={navigation.selectFloor}
                onRoom={navigation.selectRoom}
                onEnter={() => navigation.go(1)}
                onAsset={navigation.setAsset}
                labels={scene.options.labels}
                layer={scene.options.layer}
                revision={scene.options.revision}
                autoRotate={scene.options.autoRotate}
                exportRequest={exporting.request}
                onExportComplete={exporting.complete}
              />
            </Suspense>
          </SceneBoundary>
        </div>
        <StageNavigation
          level={level}
          onNavigate={navigation.go}
        />
        <SpatialPanel
          selection={selection}
          data={data}
          view={view}
          onNavigate={navigation.go}
          onBuilding={navigation.selectBuilding}
          onFloor={navigation.selectFloor}
          onRoom={navigation.selectRoom}
          onAsset={navigation.setAsset}
        />
        <OperationsPanel
          metrics={data.metrics}
          period={operations.period}
          onPeriod={operations.setPeriod}
          tab={operations.tab}
          onTab={operations.setTab}
          alerts={data.alerts}
          onLocateAlert={navigation.locateAlert}
          view={view}
        />
        <SceneControls
          level={level}
          view={view}
          options={scene.options}
          exportBusy={exporting.busy}
          onExport={exporting.start}
          onNavigate={navigation.go}
          onReset={navigation.reset}
          onAdvance={navigation.advance}
          onResetView={scene.resetView}
          onToggleLayer={scene.toggleLayer}
          onToggleLabels={scene.toggleLabels}
          onToggleRotate={scene.toggleRotate}
        />
        {asset && (
          <AssetModal
            asset={asset}
            building={building}
            floor={floor}
            room={room}
            onClose={navigation.closeAsset}
          />
        )}
        {notice && <div className="toast">{notice}</div>}
      </main>
      <AppFooter level={level} />
    </div>
  );
}
