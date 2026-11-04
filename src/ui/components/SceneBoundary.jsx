/**
 * @file SceneBoundary.jsx
 * @description 三维场景错误边界，WebGL 渲染异常时展示降级提示与重载入口。
 */

import React, { Component } from 'react';
import { TriangleAlert } from 'lucide-react';

/**
 * 三维场景错误边界：捕获子组件（WebGL 场景）的渲染异常并降级展示提示页
 */
export default class SceneBoundary extends Component {
  /** 是否已捕获到子组件渲染错误 */
  state = { error: false };

  /**
   * 捕获到子组件抛出的异常时置位 error，触发降级 UI 渲染
   * @returns {{ error: boolean }} 更新后的状态
   */
  static getDerivedStateFromError() {
    return { error: true };
  }

  /**
   * 出错时渲染降级提示（含重新加载入口），正常时透传子组件
   * @returns {JSX.Element} 降级提示或子组件
   */
  render() {
    return this.state.error ? (
      <div className="scene-error">
        <TriangleAlert />
        <h3>三维场景暂不可用</h3>
        <p>请使用支持 WebGL 2 的浏览器并开启硬件加速。仍可通过两侧导航查看空间与资产数据。</p>
        <button onClick={() => location.reload()}>重新加载</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
