/**
 * @file EnergyChart.jsx
 * @description 用 ECharts 渲染园区能耗图表，支持 24 小时与 7 天两种统计周期。
 */

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 仅在首次渲染时注册组件，避免重复注册导致报错
echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

/**
 * 能耗趋势柱状图（ECharts）
 * @param {number} energy - 当期总能耗（kWh），作为均值按周期份数生成模拟分布
 * @param {'24h'|'7d'} period - 统计周期，'24h' 为 24 根小时柱，'7d' 为 7 根按天柱
 * @returns {JSX.Element} 图表容器
 */
export default function Chart({ energy, period }) {
  const el = useRef();
  useEffect(() => {
    const chart = echarts.init(el.current);
    // 数据点数量：24h 取 24 个小时点，否则取 7 个天点
    const n = period === '24h' ? 24 : 7;
    // 以能耗均值为基准，叠加正弦波动与白天（9-18 时）高峰系数，生成模拟逐点数据
    const values = Array.from({ length: n }, (_, i) =>
      Math.round((energy / n) * (0.65 + Math.sin(i * 0.7) * 0.15 + (i > 8 && i < 19 ? 0.65 : 0))),
    );
    chart.setOption({
      animationDuration: 600,
      // 图表网格边距（坐标轴隐藏，留出标签空间）
      grid: { left: 0, right: 0, top: 14, bottom: 24 },
      // 悬浮提示：深色主题配色，数值统一带 kWh 单位
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#102e39',
        borderColor: '#31545e',
        textStyle: { color: '#d5eeed' },
        valueFormatter: (v) => `${v} kWh`,
      },
      xAxis: {
        type: 'category',
        data: values.map((_, i) =>
          period === '24h' ? `${String(i).padStart(2, '0')}:00` : `${i + 1}日`,
        ),
        axisLine: { lineStyle: { color: '#24444d' } },
        axisTick: { show: false },
        axisLabel: { color: '#73949e', fontSize: 10, interval: period === '24h' ? 7 : 0 },
      },
      yAxis: { type: 'value', show: false },
      series: [
        {
          type: 'bar',
          data: values,
          barWidth: period === '24h' ? '55%' : '38%',
          itemStyle: {
            borderRadius: [2, 2, 0, 0],
            // 柱体自上而下的薄荷绿渐变填充
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#73e9cd' },
              { offset: 1, color: '#1d665e' },
            ]),
          },
        },
      ],
    });
    // 监听容器尺寸变化自动重绘，卸载时释放图表实例
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(el.current);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [energy, period]);
  return (
    <div
      ref={el}
      className="chart"
      aria-label="模拟能耗趋势图"
    />
  );
}
