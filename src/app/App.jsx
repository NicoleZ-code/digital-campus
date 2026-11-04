/**
 * @file App.jsx
 * @description 应用根组件，负责组装数据仓储、全局状态与各视图组件。
 */

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
/**
 * 应用根组件：从 useCampus 取出全局状态与操作，组装页头、三维场景、各面板与弹窗。
 * 无有效楼宇数据时渲染兜底提示界面。
 * @param {object} props - 组件属性
 * @param {object} props.repository - 园区数据仓储实例，提供快照订阅与数据查询
 * @returns {import('react').JSX.Element} 应用根界面
 */
export default function App({ repository }) {
  // 解构应用层状态：选择上下文、数据、场景选项、导出、运营面板、提示消息
  const { selection, data, scene, exporting, operations, navigation, notice, notify } =
    useCampus(repository);
  // 当前导航层级与所选楼层
  const { level, floor } = selection;
  // 当前上下文中的楼宇、房间与资产（可能为 undefined）
  const { building, room, asset } = data;
  // 无有效楼宇时渲染错误兜底视图，数据恢复后自动更新
  if (!building) {
    return (
      <div
        className="scene-error"
        role="status"
      >
        <h3>暂无可用园区数据</h3>
        <p>当前没有有效楼宇，数据恢复后将自动更新。</p>
        <button onClick={navigation.reset}>重置选择</button>
      </div>
    );
  }
  // 按当前选择与运营周期计算展示用视图模型
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
                city={data.city}
                campuses={data.campuses}
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
                onEnter={(campus) => navigation.selectCampus(campus?.id ?? data.campus?.id)}
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
        {data.rooms.length === 0 && (
          <div
            className="scene-error"
            role="status"
          >
            <h3>当前楼层暂无房间数据</h3>
            <p>可返回园区或选择其他楼层。</p>
          </div>
        )}
        {/* 底部层级导航条 */}
        <StageNavigation
          level={level}
          onNavigate={navigation.go}
        />
        {/* 空间信息面板：展示选择上下文与索引列表 */}
        <SpatialPanel
          selection={selection}
          data={data}
          view={view}
          onNavigate={navigation.go}
          onCampus={navigation.selectCampus}
          onBuilding={navigation.selectBuilding}
          onFloor={navigation.selectFloor}
          onRoom={navigation.selectRoom}
          onAsset={navigation.setAsset}
        />
        {/* 运营面板：指标、周期切换、告警列表 */}
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
        {/* 场景控制面板：导出、视角、图层/标签/旋转开关 */}
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
        {/* 资产详情弹窗：仅当已选中资产时渲染 */}
        {asset && (
          <AssetModal
            asset={asset}
            building={building}
            floor={floor}
            room={room}
            onClose={navigation.closeAsset}
          />
        )}
        {/* 全局提示消息浮层 */}
        {notice && <div className="toast">{notice}</div>}
      </main>
      <AppFooter level={level} />
    </div>
  );
}
