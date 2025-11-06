// BIBLIOTECAS REACT

import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

// SERVIÇOS
import { cor3, cor4, cor5 } from '../../services';

// INTERFACE
interface GraphCacambaPorMesInterface {
  filters?: any;
  height?: string;
}

// CSS
import './styles.css';

const GraphCacambaPorMes = ({
  filters,
  height,
}: GraphCacambaPorMesInterface) => {
  // REF GRAFICO
  const thisGraph = useRef<any>();

  useEffect(() => {
    // EIXO X LABEL
    const months: string[] = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    const chart = thisGraph.current;
    const chartMain = echarts.init(chart);

    const option: any = {
      color: [cor3, cor4, cor5],
      xAxis: { type: 'category', data: months },
      yAxis: { type: 'value' },
      tooltip: {
        trigger: 'axis',
        position(pt: any) {
          return ['10%', '10%'];
        },
      },
      grid: {
        left: '0px',
        right: '20px',
        bottom: '20px',
        top: '20px',
        containLabel: true,
      },
      dataZoom: [{ type: 'inside', start: 0, end: '100%' }],
      lineStyle: { color: cor3, width: 2 },
      series: [
        {
          name: 'Caçambas',
          type: 'bar',
          stack: 'total',
          data: [0, 0, 0, 0, 0, 6, 7],
        },
      ],
    };

    chartMain.setOption(option);

    setInterval(() => {
      chartMain.resize();
    }, 500);
  }, [filters]);

  return <div ref={thisGraph} style={{ height, overflow: 'hidden' }} />;
};

export default GraphCacambaPorMes;
