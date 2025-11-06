// BIBLIOTECAS REACT
import { useRef } from "react"
import { Col, List, Popover, Row, Tag, Typography } from "antd";

// INTERFACE
interface GraphMaiorTempoRespostaInterface {
    filters?: any,
    height?: string
}

// CSS
import './styles.css'

const GraphMaiorTempoResposta = ( { filters, height } : GraphMaiorTempoRespostaInterface ) => {

    // REF GRAFICO
    const thisGraph = useRef<any>()

    // STATUS
    const status:any[] = [
        { title: 'Rápido', color: '#00e200' },
        { title: 'Normal', color: '#ffe000' },
        { title: 'Lento', color: '#fc581c' },
        { title: 'Crítico', color: '#ff281e' },
    ]

    // LISTA 
    const list:any[] = [
        { title: 'dashboard/search', value: 35, status: 3 },
        { title: 'permission/search', value: 20, status: 2 },
        { title: 'credential/save', value: 10, status: 2 },
        { title: 'dashboard/search', value: 4, status: 1 },
        { title: 'permission/del', value: 2, status: 1 },
        { title: 'timeline/search', value: 0.3, status: 0 },
    ]

    return (
        <div style={{height: height, overflow: 'hidden'}} ref={thisGraph}>
            <List 
                dataSource={list}
                renderItem={(item, index) => (
                    <List.Item key={index}>
                        <Row justify={'space-between'} style={{width: '100%'}} align={'middle'}>
                            <Col><Typography style={{ fontSize: '1em', cursor: 'default' }}>{item.title}</Typography></Col>
                            <Col><Popover content={status[item.status].title}><Tag color={status[item.status].color}>{item.value}s</Tag></Popover></Col>
                        </Row>
                    </List.Item>
                )}
            />
        </div>
    )

}

export default GraphMaiorTempoResposta