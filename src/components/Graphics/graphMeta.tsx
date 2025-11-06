// BIBLIOTECAS REACT
import { useEffect, useRef, useState } from "react"
import * as echarts from 'echarts';

// SERVIÇO
import { cor4, GET_API } from "../../services";
import { Row } from "antd";
import { Oval } from "react-loader-spinner";

// INTERFACE
interface GraphMetaInterface {
    filters?: any,
    height?: string
}

// CSS
import './styles.css'

const GraphMeta = ( { filters, height } : GraphMetaInterface ) => {

    // ESTADOS DO COMPONENTE
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ data, setData ] = useState<number>(0)
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
                        tooltip: { trigger: 'axis' },
                        detail: { valueAnimation: true, fontSize: 40, offsetCenter: [0, '100%'], formatter: (v:any) => `${v}%` },
                        data: [ { value: data } ]
                        }
                    ]
            }

            chart.setOption(option)
        }

    }, [chart, data])

    // CARREGA PEDIDOS
    useEffect(() => { 
        setLoading(true);
        GET_API(`/financial/goal?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setData(res.data)).finally(() => setLoading(false))
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

export default GraphMeta