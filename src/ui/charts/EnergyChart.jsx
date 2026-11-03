import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);
export default function Chart({ energy, period }) {
  const el = useRef();
  useEffect(() => {
    const chart = echarts.init(el.current);
    const n = period === '24h' ? 24 : 7;
    const values = Array.from({ length: n }, (_, i) =>
      Math.round((energy / n) * (0.65 + Math.sin(i * 0.7) * 0.15 + (i > 8 && i < 19 ? 0.65 : 0))),
    );
    chart.setOption({
      animationDuration: 600,
      grid: { left: 0, right: 0, top: 14, bottom: 24 },
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
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#73e9cd' },
              { offset: 1, color: '#1d665e' },
            ]),
          },
        },
      ],
    });
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
