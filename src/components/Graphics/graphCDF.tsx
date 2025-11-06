// BIBLIOTECAS REACT
import { useEffect, useRef, useState } from "react"
import { Oval } from "react-loader-spinner";
import { Row } from "antd";
import * as echarts from 'echarts';

// SERVIÇOS
import { cor3, cor4, cor5, GET_API } from "../../services";

// INTERFACE
interface GraphCDFInterface {
    filters?: any,
    height?: string
}

// CSS
import './styles.css'

const GraphCDF = ( { filters, height } : GraphCDFInterface ) => {

    // ESTADOS DO COMPONENTE
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ data, setData ] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0])
    const [ chart, setChart ] = useState<any>(null)

    // REF GRAFICO
    const thisGraph = useRef<any>()
    
    useEffect(() => {
        setChart( echarts.init(thisGraph.current) )
        const observer = new ResizeObserver((entries) => {
            echarts.getInstanceByDom(thisGraph.current).resize()
        });
        observer.observe(thisGraph.current);
    }, [])


    useEffect(() => {

        if (chart) {

            const option: any = {
                xAxis: { type: 'category', boundaryGap: false, data: [ 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez' ] },
                yAxis: { type: 'value', axisLabel: { formatter: (value:any) => `${Number(value).toLocaleString('pt-br')}` }},
                tooltip: { trigger: 'axis', position: function (pt:any) { return ['10%', '10%']; }, valueFormatter: (value:any) => `${Number(value).toLocaleString('pt-br')}` },
                grid: { left: '0px', right: '20px', bottom: '10px', top: '20px', containLabel: true },
                dataZoom: [ { type: 'inside', start: 0, end: '100%' } ],
                lineStyle: { color: cor3, width: 2 },
                series: [
                    { name: 'CDF emitidos', type: 'line', smooth: true, symbol: 'none', areaStyle: { 
                        opacity: 0.8,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: cor4 },
                            { offset: 1, color: cor5 }
                        ]) 
                    }, data: data }
                ]
            }
    
            chart.setOption(option)
            
        }


    }, [chart, data])

    // CARREGA PEDIDOS
    useEffect(() => { 
        setLoading(true);
        GET_API(`/dashboard/cdfbymonth?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setData(res.data)).finally(() => setLoading(false))
    }, [filters])

    return ( 
        <>
            <div style={{height: height, overflow: 'hidden'}} ref={thisGraph}/>
            { loading ? (
                <Row style={{height: '90%'}} className="loading-graph" justify={'center'} align={'middle'}>
                    <Oval visible={true} height="50" width="50" color="var(--color01)" secondaryColor="var(--color01)" ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" />
                </Row>
            ) : null }
        </>
    )

}

export default GraphCDF