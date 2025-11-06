// BIBLIOTECAS REACT
import { useEffect, useRef } from "react"
import * as echarts from 'echarts';

// SERVIÇO
import { cor4 } from "../../services";

// INTERFACE
interface GraphPerformanceInterface {
    filters?: any,
    height?: string
}

// CSS
import './styles.css'

const GraphPerformance = ( { filters, height } : GraphPerformanceInterface ) => {

    // REF GRAFICO
    const thisGraph = useRef<any>()

    useEffect(() => {

        const chart = thisGraph.current;
        const chartMain = echarts.init(chart)

        const option: any = {
            color: [ cor4 ],
            grid: { left: '0px', right: '20px', bottom: '50px', top: '20px', containLabel: true },
            series: [
                {
                    type: 'gauge',
                    progress: { show: true, width: -20 },
                    axisLine: { lineStyle: { width: -20 },   },
                    axisTick: { show: false, lineStyle: { color: '#999' } },
                    splitLine: { length: 25, lineStyle: { width: 2, color: '#999' } },
                    axisLabel: { distance: -15, color: '#999', fontSize: 16 },
                    anchor: { show: true, showAbove: true, size: 25, itemStyle: { borderWidth: 10, borderColor: cor4 } },
                    title: { show: false },
                    detail: { valueAnimation: true, fontSize: 40, offsetCenter: [0, '100%'] },
                    data: [ { value: 70 } ]
                  }
                ]
        }

        chartMain.setOption(option)

        setInterval(() => {
            chartMain.resize()
        }, 500);

    }, [filters])

    return (
        <div style={{height: height, overflow: 'hidden'}} ref={thisGraph}/>
    )

}

export default GraphPerformance