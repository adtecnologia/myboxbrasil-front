import { PieChart, type PieSeriesOption } from 'echarts/charts';
import { LegendComponent, TooltipComponent } from 'echarts/components';
import {
  type ComposeOption,
  type EChartsType,
  use as echartsUse,
  init,
} from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useRef, useState } from 'react';
import { GET_API } from '@/services';

echartsUse([TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

type ECOption = ComposeOption<PieSeriesOption>;

export default function RelatorioLocacoesGraph() {
  const [chart, setChart] = useState<EChartsType | null>(null);

  const thisGraph = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (thisGraph.current) {
      const chartInstance = init(thisGraph.current);
      setChart(chartInstance);

      const observer = new ResizeObserver(() => {
        chartInstance.resize();
      });

      observer.observe(thisGraph.current);
    }
  }, []);

  useEffect(() => {
    GET_API('/reports/locations/total')
      .then((rs) => rs.json())
      .then((response) => {
        if (chart) {
          const option: ECOption = {
            tooltip: { trigger: 'item' },
            legend: { top: '5%', left: 'center' },
            series: [
              {
                type: 'pie',
                name: 'Concluídas VS Em Andamento',
                color: ['#e97a13ff', '#91CC75'],
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                padAngle: 5,
                itemStyle: { borderRadius: 10 },
                label: { show: false, position: 'center' },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: 30,
                    fontWeight: 'bold',
                  },
                },
                labelLine: { show: false },
                data: [
                  { value: response.completed, name: 'Em andamento' },
                  { value: response.waiting, name: 'Concluídas' },
                ],
              },
            ],
          };

          chart.setOption(option);
        }
      });
  }, [chart]);

  return <div ref={thisGraph} style={{ height: 500, overflow: 'hidden' }} />;
}
