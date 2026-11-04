# 海序空间 · 数字园区

参考提供的视频与需求总结实现的浏览器端 3D 交互原型。采用 React 19、Three.js、React Three Fiber、Drei、ECharts 与 Vite。

## 本地运行

需要 Node.js 22.12+（本次使用 22.23.1）。

```bash
npm ci
npm run dev
```

打开终端打印的本地地址，默认 http://127.0.0.1:5188 。

```bash
npm run format    # 统一格式化源码、配置与文档
npm run format:check # 检查代码格式
npm run lint      # ESLint 代码检查（零警告）
npm run lint:fix  # 自动修复可修复的问题
npm run check     # 依次执行格式检查、代码检查、测试和构建
npm test          # 数据关系、指标汇总和告警定位测试
npm run build    # 生成 dist
npm run preview  # 预览生产构建
```

## 演示路线

1. 默认进入园区：拖动旋转、滚轮缩放，观察树阵、道路、车辆与楼宇标签。
2. 点击顶栏“上海市”，再点击地图中的“进入园区”。上海地图使用本地 GeoJSON 区界挤出，包含 16 个行政区及岛屿；园区坐标为演示位置。
3. 点击“海序中心”建筑或索引，选择 06F，观察楼层抽离与房间布局。
4. 点击“602 · 智能会议室”，再点击传感器，查看 CO₂ 告警和资产详情。
5. 点击右侧告警，可从任意层级直接定位同一房间。
6. 切换标准/能耗图层、24h/7d 图表、标签、自动环绕；使用底部返回或重置按钮恢复视角。
7. 右下方下载按钮导出当前场景为 GLB；可导入 Blender 等建模软件编辑。导出保留楼宇/楼层/房间 ID，包含当前模型与材质，不包含网页面板、DOM 标签或交互动画。请在镜头与楼层动画稳定后导出。
8. 资产弹窗支持关闭按钮、遮罩点击、Escape 和 Tab 焦点约束。

## 模块结构

下钻状态、楼层展开与镜头联动的实现说明见[技术分析页面](./sdoc/下钻与楼层展开技术分析.html)，也可从园区视图顶部打开“分析代码”。

- `src/main.jsx`：挂载入口、仓库注入和样式入口。
- `src/app/`：页面组装、业务用例与独立交互状态 Hook。
- `src/domain/campus/`：无框架依赖的导航规则、层级和指标计算。
- `src/infrastructure/`：模拟数据仓库、模型序列化和浏览器下载。
- `src/features/scene/`：三维模型、镜头、环境和场景配置。
- `src/infrastructure/data/roomLayouts.js`：按楼栋和楼层生成演示房间平面。
- `src/models/haixu-digital-campus.glb`：当前场景 GLB 导出样例。
- `src/ui/`：面板、导航、工具栏、弹窗、图表和展示数据。
- `src/shared/`：通用工具。
- `src/styles/`：按职责拆分的样式。
- `src/tests/`：数据、导航、展示、导出、场景配置和依赖边界测试。

## 范围与验证

所有资产、曲线、告警及空间面积均为模拟数据，无后端写入。建筑与房间是可编辑的程序化模型，支持当前场景 GLB 导出；上海区界使用 DataV GeoJSON；尚未接入外部建筑 GLB、Cesium、API、实时遥测或 Unreal Engine。依赖安装后，运行时不请求第三方地图、字体或模型服务。请通过 HTTP 服务运行，不支持直接双击 HTML。

已在本机 Chrome 检查园区、上海地图、楼层、会议室的 GPU 渲染，以及告警定位和资产弹窗。自动检查使用 `npm run check`；目标设备帧率尚未量测。生产构建有大型三维依赖包体积提示；正式部署前应按目标网络、模型量与设备做性能验收。

技术文档：[R3F](https://r3f.docs.pmnd.rs/getting-started/introduction)、[Three.js](https://threejs.org/docs/)。

开发及生产预览均固定使用端口 `5188`，端口被占用时直接报错，不自动切换。Vite 配置位于 `vite.config.js`，ESLint flat config 位于 `eslint.config.js`，检查 JavaScript、JSX 和 React Hooks，并忽略构建产物。

程序化建筑、房间模型与楼层下钻逻辑均可在 `src/features/scene/` 中直接调整。
