// BIBLIOTECAS REACT
import { useEffect, useRef, useState } from "react"
import { Oval } from "react-loader-spinner";
import { Row } from "antd";
import * as echarts from 'echarts';

// SERVIÇOS
import { cor1, cor2, cor3, cor4, cor5, GET_API } from "../../services";

// INTERFACE
interface GraphUsuariosPorMesInterface {
    filters?: any,
    height?: string
}

// CSS
import './styles.css'

const GraphUsuariosPorMes = ( { filters, height } : GraphUsuariosPorMesInterface ) => {

    // ESTADOS DO COMPONENTE
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ data, setData ] = useState<number[]>([])
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
                color: [ cor3, cor4, cor2, cor1, cor5 ],
                xAxis: { type: 'category', data: [ "Jan", 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez' ] },
                yAxis: { type: 'value', axisLabel: { formatter: (value:any) => `${Number(value).toLocaleString('pt-br')}` }},
                tooltip: { trigger: 'axis', position: function (pt:any) { return ['10%', '10%']; }, valueFormatter: (value:any) => `${Number(value).toLocaleString('pt-br')}`},
                grid: { left: '0px', right: '20px', bottom: '20px', top: '20px', containLabel: true },
                dataZoom: [ { type: 'inside', start: 0, end: '100%' } ],
                lineStyle: { color: cor3, width: 2 },
                series: data
            }
    
            chart.setOption(option)
            
        }


    }, [chart, data])

    // CARREGA CAÇAMBAS
    useEffect(() => { 
        setLoading(true);
        GET_API(`/dashboard/usersbymonth?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setData(res.data)).finally(() => setLoading(false))
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

export default GraphUsuariosPorMes