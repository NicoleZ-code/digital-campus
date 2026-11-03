import React, { Component } from 'react';
import { TriangleAlert } from 'lucide-react';

export default class SceneBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
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
