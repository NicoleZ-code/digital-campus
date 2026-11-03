# 模块结构与依赖约定

```text
src/
├── main.jsx                    # 组合入口：注入仓库、挂载应用、加载样式
├── app/
│   ├── App.jsx                 # 组装界面与三维场景，传递明确参数和事件
│   └── hooks/
│       ├── useCampus.js        # 业务用例协调、数据读取、导航事件
│       ├── useSceneOptions.js  # 图层、标签、环绕和镜头版本
│       ├── useModelExport.js   # 导出请求与完成状态
│       └── useNotice.js        # 临时通知生命周期
├── domain/campus/
│   ├── constants.js            # 空间层级与默认选择
│   ├── navigation.js           # 纯 reducer：下钻、返回、资产选择和重置
│   └── metrics.js              # 接收业务实体，计算空间指标
├── infrastructure/
│   ├── data/campus.js          # 模拟楼宇、房间、设备与告警生成
│   ├── repositories/          # 业务读取接口的模拟实现
│   ├── export/                # Three.js 模型序列化
│   └── browser/               # 浏览器文件下载副作用
├── features/scene/
│   ├── Scene.jsx              # Canvas 与场景组装
│   ├── models/                # 城市、地面、车辆、楼宇、楼层、房间与树
│   ├── primitives/            # 基础三维几何组件
│   ├── controls/              # 镜头及轨道交互
│   ├── effects/               # 灯光、背景、导出桥接
│   └── config/                # 镜头预设、道路、树阵、楼层展开位置
├── ui/
│   ├── components/            # 接收 props、发送事件的二维界面
│   ├── charts/                # ECharts 适配与资源生命周期
│   ├── config/                # 展示文案、环境读数和展示数据派生
│   └── hooks/                 # 顶栏时钟
├── shared/                    # 数值格式化等通用工具
├── styles/                    # 基础、布局、面板、场景、弹窗、响应式样式
└── tests/                     # 数据、导航、展示、导出、场景配置与模块边界测试
```

## 依赖方向

- `main.jsx` 是模拟仓库的注入点。`App` 接收 `repository`，不在界面中创建数据源。
- `domain` 不依赖 React、Three.js、ECharts、浏览器或其他业务层，只接收参数并返回结果。
- `app/hooks` 依赖领域规则与注入的仓库接口，不引用界面、场景或具体基础设施实现。
- `ui` 接收选择状态、展示数据和事件，不直接查询模拟数据，不持有导航状态。
- `features/scene/models` 接收实体及选中状态，不访问仓库，也不修改业务状态。点击通过回调传回应用层。
- 导出组件连接场景引用与基础设施；序列化与浏览器下载分别实现，模型序列化可在测试环境运行。
- 样式由 `styles/index.css` 顺序引入，保留拆分前的级联顺序。

ESLint 限制逆向导入。`tests/architecture.test.js` 检查解析后的依赖路径，防止通过相对路径绕过模块边界。

## 仓库接口

本版使用**同步只读**仓库，其方法为：

```js
const repository = {
  listBuildings: () => buildings,
  listAlerts: () => alerts,
  getRooms: (buildingId, floor) => rooms,
  getAssets: (room) => assets,
};
```

实体保留现有稳定 ID 和字段。场景和界面通过应用层获取数据。替换数据源时，在入口注入新仓库；真实异步 API 需要在应用层增加加载、错误和缓存状态，不能直接把当前方法返回值改为 Promise。

## 事件流

```text
楼宇/房间点击
→ onBuilding / onRoom
→ app/hooks/useCampus
→ domain/campus/navigation
→ 新选择状态
→ 仓库读取 + domain/campus/metrics
→ UI 展示和三维渲染
```

导出状态独立于导航；镜头、图层和标签独立于空间业务选择；时钟只更新顶栏。组件不再接收包含全部状态和 setter 的 `campus` 对象。

## 修改位置

- 增减演示楼宇、设备或告警：`infrastructure/data/campus.js`。
- 修改下钻及返回规则：`domain/campus/navigation.js`。
- 修改指标算法：`domain/campus/metrics.js`。
- 修改三维模型：`features/scene/models/`。
- 调整镜头、楼层展开位置：`features/scene/config/`。
- 修改页面文案与展示派生：`ui/config/presentation.js`。
- 调整导出格式或下载行为：`infrastructure/export/`、`infrastructure/browser/`。

## 验证

运行 `npm run check`，依次执行格式检查、ESLint（含模块边界规则）、12 项测试与生产构建。浏览器 GPU 渲染及实际点击仍需在目标环境验收。
