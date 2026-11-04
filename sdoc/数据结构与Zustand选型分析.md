# 项目数据结构与 Zustand 选型分析

更新日期：2026-11-04。本文已同步数据模型修复结果。当前仍使用 React reducer 与注入仓库，没有安装 Zustand。

## 1. 当前结论与修复范围

**暂不引入 Zustand。先通过稳定 ID、明细聚合和可订阅快照解决已发现的问题。**

原有数据模型的七类问题已落实到代码：汇总口径、楼层设备数量假设、在线与告警混用、房间索引定位、设备对象快照、数值类型及缺失数据保护。

共享的业务选择仍由 `useCampus` 中的 reducer 管理。数据仓库改为缓存快照，通过 React `useSyncExternalStore` 订阅；仓库更新时，按 ID 从最新数据解析房间和设备。无需为了获得数据订阅能力就引入全局状态库。

Zustand 的后续价值仍是多入口共享交互状态与细粒度订阅。目前尚未采集性能基线，不能据此声称替换状态库一定提升帧率。

## 2. 实体关系与当前数量

```text
园区（单一默认园区，没有独立 campusId）
└─ Building：3 栋
   └─ Floor：由 floors 与层号隐式生成，共 26 层
      └─ Room：每层 6 个，共 156 个
         └─ Asset：当前每房间 3 台，共 468 台

Alert → buildingId + floor + roomId + assetId
```

| 实体           | 当前来源                     | 关联与用途                                                      |
| -------------- | ---------------------------- | --------------------------------------------------------------- |
| Building       | `data/campus.js` 静态主数据  | id、floors、position、size；仓库根据房间与设备计算汇总          |
| Floor          | 按楼栋总层数生成             | floor 为实际层号，floorId 用于模型与房间关联                    |
| Room           | 启动时确定性生成并保存到快照 | id、buildingId、floorId、floor、number、position、area、energy  |
| Asset          | 启动时生成并保存到快照       | id、roomId、value、unit、power、powerUnit、connectivity、health |
| Alert          | 快照中的有效告警             | 显式关联 roomId、assetId，校验楼栋和楼层一致性                  |
| 地图与视觉配置 | 本地 GeoJSON 和配置模块      | 不写入选择 reducer，也不逐帧更新仓库                            |

ID 链示例：`b-a` → `b-a-f6` → `b-a-f6-r2` → `b-a-f6-r2-a2`。业务通过关联字段查询，不解析 ID 字符串推断父级。

实体索引由 `domain/campus/catalog.js` 创建，包含 buildingsById、roomsById、assetsById。当前小规模数据的房间与设备列表仍用数组筛选；未来可按性能需求增加 roomIdsByFloorId 等索引。

## 3. 数据与状态的归属

| 内容                                              | 归属                     | 原则                                 |
| ------------------------------------------------- | ------------------------ | ------------------------------------ |
| level、buildingId、floor、roomId、selectedAssetId | navigationReducer        | 只保存选择与 ID，不保存设备对象副本  |
| buildings、rooms、assets、alerts                  | 仓库快照                 | 一次 replaceData 发布一致的新快照    |
| building、room、asset、metrics、view              | 领域选择器与展示选择器   | 从当前选择及最新快照派生，不重复存储 |
| layer、labels、autoRotate、revision               | useSceneOptions          | 用户交互配置与镜头复位信号           |
| period、tab                                       | useCampus                | 图表周期、告警页签                   |
| busy、request                                     | useModelExport           | 导出任务生命周期                     |
| notice、时钟                                      | 对应局部 Hook            | 短暂提示与定时刷新                   |
| 相机位置、楼层位置、车辆进度                      | Three.js 引用与 useFrame | 不逐帧写入仓库或 reducer             |

`useCampus` 仍只在 App 调用一次。多个组件各自调用该 Hook 会创建独立选择状态，不能将它误认为全局 store。

## 4. 新的数据更新链

```text
replaceData（发布完整数据快照）
→ 校验父子关联、过滤失效实体、重新聚合楼宇指标
→ listeners 通知
→ useSyncExternalStore 获取新快照
→ createCatalog 建立索引
→ resolveContext 解析当前选择
→ getContextMetrics / getCampusView
→ App 更新 UI 和 Scene
```

用户点击路径仍为：点击 → useCampus 校验 → navigationReducer → 解析新选择 → 刷新 UI、模型与镜头。

```js
const snapshot = useSyncExternalStore(
  repository.subscribe,
  repository.getSnapshot,
  repository.getSnapshot,
);
const catalog = useMemo(() => createCatalog(snapshot), [snapshot]);
const context = resolveContext(catalog, requestedSelection);
```

`getSnapshot()` 在没有更新时保持同一对象引用，避免每次读取都创建新快照。`replaceData` 是完整替换接口，不是局部 patch；调用方必须提供应保留的实体集合。数据发布后应按只读方式使用快照，不能直接修改返回对象。

## 5. 已发现的数据模型问题：修复结果

### 5.1 汇总与明细口径：已统一

原楼宇 assets、area、energy 是独立常量，园区面板与房间明细无法对账。现在楼宇聚合与各级面板共同使用 `summarizeRooms` 和设备明细。

| 楼栋     | 原 assets → 当前 | 原 area → 当前    | 原 energy → 当前  |
| -------- | ---------------- | ----------------- | ----------------- |
| A：12 层 | 264 → 216        | 14400 → 6144      | 8640 → 8508       |
| B：8 层  | 216 → 144        | 11200 → 4096      | 9240 → 5384       |
| C：6 层  | 144 → 108        | 8840 → 3072       | 4736 → 3930       |
| 园区     | **624 → 468**    | **34440 → 13312** | **22616 → 17822** |

这不是用明细去推断真实建筑面积。当前演示选择明确口径：面积为房间使用面积合计，用能为同一模拟周期的房间用能合计，资产为房间设备集合。面板文案改为“房间使用面积 / m²”。未来增加建筑总面积或公共区域设备时，应新增独立字段和实体，不能混入现有指标。

源码：`domain/campus/metrics.js`、`infrastructure/repositories/createCampusRepository.js`、`ui/components/SpatialPanel.jsx`。

### 5.2 楼层设备等量假设：已移除

原算法 `rooms.length * assets.length` 只适合每个房间设备数相同。现在先确定当前范围的全部房间 ID，再筛选设备、按设备 ID 去重计数。即使部分房间没有设备或新增设备，也不依赖当前选中房间的设备数量。

```js
const ids = new Set(rooms.map((room) => room.id));
const scopedAssets = assets.filter((asset) => ids.has(asset.roomId));
const uniqueAssets = [...new Map(scopedAssets.map((asset) => [asset.id, asset])).values()];
```

验收：测试构造设备数量不相等的房间，并验证楼层统计及重复设备去重。

### 5.3 在线与告警混用：已分离

设备现在拥有两个独立维度：`connectivity: online | offline` 与 `health: normal | warning`。在线数与离线数依据连通性，告警设备数依据 health；不再使用告警事件条数扣减在线设备。

**在线 + 离线 = 设备总数；告警设备可以与在线或离线重叠，不能把三个数字直接相加。** 当前 468 台设备全部在线，其中 1 台告警，因此在线率为 100%，告警为 1，离线为 0。

房间 warning 展示标记也从设备 health 派生，更新健康状态时不继续显示旧的房间告警标记。告警事件列表仍是独立输入，设备告警数不由事件条数计算。

### 5.4 roomIndex 定位：已改用 roomId

导航状态保存 roomId，告警保存 roomId 和 assetId。`selectRoom` 校验房间属于当前楼层；告警位置校验楼栋、层号、房间与设备关联。

验收：将房间数组反转后定位同一告警，仍进入 A 座 602，而不是排序后的第二个房间。默认选择为 `b-a-f6-r2`。

### 5.5 弹窗保存设备对象：已改用设备 ID

状态只保存 `selectedAssetId`。`resolveContext` 每次从最新快照的当前房间设备列表找到设备对象。替换快照中的读数后，已打开弹窗会获取新值；设备删除后清空有效选择并关闭弹窗。

失效选择通过 reconcile 同步回 reducer，防止已删除设备之后重新出现时，旧弹窗意外自动打开。弹窗焦点管理以 asset.id 为依赖，同一设备读数更新不会重新抢占焦点。

### 5.6 字符串业务读数：已改为数值与独立单位

```js
const asset = {
  id: 'b-a-f6-r2-a2',
  roomId: 'b-a-f6-r2',
  value: 1430,
  unit: 'ppm',
  power: 0.02,
  powerUnit: 'kW',
  connectivity: 'online',
  health: 'warning',
};
```

value、power、online 百分比均为 number。功率等展示字符串由 UI 拼接。在线率保留最多一位小数，无设备时为 0%，不再将“无设备”显示成 100% 在线。

### 5.7 缺失数据保护：已增加安全回退

| 情况                           | 当前行为                                        |
| ------------------------------ | ----------------------------------------------- |
| 没有有效楼宇                   | 显示“暂无可用园区数据”，数据恢复后自动重算      |
| 已选楼宇失效                   | 回退第一个有效楼宇，并校验楼层范围              |
| 楼层越界                       | 限制到有效楼层范围                              |
| 房间 ID 不存在或不属于当前层   | 回退当前层第一个房间；没有房间时回到楼宇层级    |
| 当前层没有房间                 | 显示明确提示，不访问 room.position 等空对象属性 |
| 设备 ID 不存在或不属于当前房间 | 清空设备选择并关闭弹窗                          |
| 无告警                         | 显示暂无告警，不读取 alerts[0].title            |
| 实体存在失效父级关联           | 仓库快照过滤该房间、设备或告警                  |

边界说明：当前仍是本地同步快照，没有实现 HTTP 加载、错误重试或请求竞态；这些属于后续异步适配器工作。过滤失效父级也不等价于完整生产级 Schema 校验。

## 6. 仓库与模型接口

```js
const repository = {
  getSnapshot: () => snapshot,
  subscribe: (listener) => unsubscribe,
  replaceData: (completeData) => {},
  listBuildings: () => snapshot.buildings,
  listAlerts: () => snapshot.alerts,
  getRooms: (buildingId, floor) => rooms,
  getAssets: (room) => assets,
};
```

实际实现见 `infrastructure/repositories/createCampusRepository.js`。mockCampusRepository 启动时生成房间与设备集合，随后创建仓库实例。App 仍从 main.jsx 接收 repository，不让 UI 或模型自行导入模拟仓库。

状态字段：

```js
const selection = {
  level: 1,
  buildingId: 'b-a',
  floor: 6,
  roomId: 'b-a-f6-r2',
  selectedAssetId: null,
};
```

后续若接真实楼宇，仍建议增加 Floor 实体与实际 elevation；当前继续采用层号 × 场景层高的程序化模型，未声称支持真实不等层高图纸。

## 7. 是否引入 Zustand

**本轮修复后仍不必立即引入。** 数据一致性由实体结构与派生算法保证；快照变化由 React 原生订阅 API 驱动；低频交互由现有 reducer 管理。

Zustand 支持 selector、vanilla store、useShallow 和外部选择性订阅，参考官方 [README](https://github.com/pmndrs/zustand#readme) 与 [Reference](https://zustand.docs.pmnd.rs/reference/index)。它可简化多个独立功能之间共享选择状态，但不能自动修复数据口径、接口竞态或 GPU 绘制开销。

| 当前需求             | 方案                   |
| -------------------- | ---------------------- |
| 单页下钻和资产选择   | reducer + 应用 Hook    |
| 仓库完整快照替换     | useSyncExternalStore   |
| 指标与当前设备解析   | 纯领域函数             |
| 多入口跨功能共享交互 | 需求出现后评估 Zustand |
| API 缓存、加载与错误 | 独立异步数据层         |
| 逐帧三维动画         | useFrame + 引用        |

## 8. 何时值得引入

1. 新增独立设备树、全局检索、多个视口等功能，传参开始穿过许多不使用状态的中间组件。
2. Profiler 证明无关 React 状态传播造成明显开销，局部化状态后仍难控制。
3. 非 React 控制模块需要订阅交互选择，或多个页面需要共享同一空间上下文。

当前整份仓库快照更新会通知所有快照订阅者；这不是细粒度遥测订阅实现。设备数量、更新频率增大时，应评估分区快照、设备级订阅、批处理和查询缓存，不应承诺全量快照天然适合高频流。

## 9. 若后续迁移 Zustand

保留现有领域 reducer，单独迁移交互状态；不要把 Three.js 对象、导出任务和原始遥测全部装进同一 store。以下是尚未实施的最小桥接示例：

```js
import { createStore } from 'zustand/vanilla';
import { defaultSelection } from '../../domain/campus/constants.js';
import { navigationReducer } from '../../domain/campus/navigation.js';

export function createCampusStore() {
  return createStore((set) => ({
    selection: { ...defaultSelection },
    revision: 0,
    transition: (action) =>
      set((state) => ({
        selection: navigationReducer(state.selection, action),
        revision: state.revision + 1,
      })),
    selectAsset: (assetId) =>
      set((state) => ({
        selection: navigationReducer(state.selection, {
          type: 'selectAsset',
          assetId,
        }),
      })),
  }));
}
```

应按 App 实例创建 store，按字段订阅。多字段对象选择可使用官方 [useShallow](https://github.com/pmndrs/zustand/blob/main/README.md#selecting-multiple-state-slices)。仓库继续独立注入，校验和用例逻辑保留在应用层。

## 10. 回归验证与未完成项

新增 `tests/modelData.test.js`，覆盖汇总与明细一致、非等量设备、在线告警并存、设备去重、房间排序、读数更新、删除设备、订阅释放、空数据与失效选择。原有导航、展示、场景及模块边界检查同步迁移到新字段。格式、ESLint、22 项测试和生产构建均通过；本机 Chrome 已验证园区新汇总、告警定位 A 座 602，以及传感器弹窗的 1430 ppm、在线与告警并存。

本轮没有接入 Zustand、HTTP、WebSocket、真实遥测或通用实体编辑界面；没有伪造性能提升数据。replaceData 可作为后续数据适配器的发布入口。

建议实际交互回归：园区汇总 → A 座 6F → 602 → 空气质量传感器，核对 1430 ppm、在线与告警同时成立；再切换 B 座，确认旧设备弹窗关闭。

## 11. 源码与外部依据

| 位置                                      | 变更                                         |
| ----------------------------------------- | -------------------------------------------- |
| `domain/campus/catalog.js`                | 实体索引、安全选择解析                       |
| `domain/campus/metrics.js`                | 按范围聚合明细、在线与告警分离               |
| `domain/campus/{constants,navigation}.js` | roomId 与 selectedAssetId 导航、失效选择回写 |
| `infrastructure/data/campus.js`           | 数值读数、独立单位、显式告警关联             |
| `infrastructure/repositories/`            | 稳定快照、订阅通知、关联过滤与楼宇派生指标   |
| `app/hooks/useCampus.js`                  | 快照订阅、上下文解析及业务校验               |
| `ui/config/presentation.js` 与组件        | 独立状态展示、使用面积文案、空告警与弹窗保护 |
| `tests/modelData.test.js`                 | 数据修复回归测试                             |

外部能力依据来自 [Zustand 官方 README](https://github.com/pmndrs/zustand#readme)、[官方 Reference](https://zustand.docs.pmnd.rs/reference/index) 与 [subscribeWithSelector](https://github.com/pmndrs/zustand/blob/main/docs/reference/middlewares/subscribe-with-selector.md)。“当前暂不引入”的结论是本项目的工程判断。
