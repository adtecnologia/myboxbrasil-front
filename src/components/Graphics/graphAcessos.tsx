// BIBLIOTECAS REACT
import { useEffect, useRef } from "react"
import * as echarts from 'echarts';

// SERVIÇOS
import { cor3, cor4, cor5 } from "../../services";

// INTERFACE
interface GraphAcessosInterface {
    filters?: any,
    height?: string
}

// CSS
import './styles.css'

const GraphAcessos = ( { filters, height } : GraphAcessosInterface ) => {

    // REF GRAFICO
    const thisGraph = useRef<any>()

    useEffect(() => {

        const chart = thisGraph.current;
        const chartMain = echarts.init(chart)

        let base = +new Date(filters?.filterAno, 0, 1);
        let oneDay = 24 * 3600 * 1000;
        let data = [[base, Math.random() * 300]];
        for (let i = 1; i < 356; i++) {
            let now = new Date((base += oneDay));
            data.push([+now, Math.round((Math.random() - 0.5) * 20 + data[i - 1][1])]);
        }

        const option: any = {
            xAxis: { type: 'time', boundaryGap: false },
            yAxis: {type: 'value', boundaryGap: [0, '100%'] },
            tooltip: { trigger: 'axis', position: function (pt:any) { return ['10%', '10%']; }, formatter: (params:any) => { 
                var date = new Date(params[0].axisValueLabel)
                return `<b>${date.toLocaleDateString()}</b><br/>Total de acessos: ${params[0].value[1]}`
            }},
            grid: { left: '0px', right: '20px', bottom: '50px', top: '20px', containLabel: true },
            dataZoom: [ { type: 'inside', start: 0, end: '100%' }, { start: 0, end: '100%' } ],
            lineStyle: { color: cor3, width: 2 },
            series: [
                { name: 'Total de acessos', type: 'line', smooth: true, symbol: 'none', areaStyle: { 
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: cor4 },
                        { offset: 1, color: cor5 }
                    ]) 
                }, data: data }
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

export default GraphAcessos