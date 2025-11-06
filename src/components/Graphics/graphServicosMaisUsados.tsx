// BIBLIOTECAS REACT
import { useRef } from "react"
import { Col, List, Row, Tag, Typography } from "antd";

// INTERFACE
interface GraphServicosMaisUsadosInterface {
    filters?: any,
    height?: string
}

// CSS
import './styles.css'

const GraphServicosMaisUsados = ( { filters, height } : GraphServicosMaisUsadosInterface ) => {

    // REF GRAFICO
    const thisGraph = useRef<any>()

    // LISTA
    const list:any[] = [
        { title: 'credential/search', value: 912 },
        { title: 'credential/save', value: 400 },
        { title: 'permission/del', value: 296 },
        { title: 'permission/search', value: 260 },
        { title: 'permission/search', value: 260 },
        { title: 'permission/search', value: 260 },
    ]

    return (
        <div style={{height: height, overflow: 'hidden'}} ref={thisGraph}>
            <List 
                dataSource={list}
                renderItem={(item, index) => (
                    <List.Item key={index}>
                        <Row justify={'space-between'} style={{width: '100%'}} align={'middle'}>
                            <Col><Typography style={{ fontSize: '1em', cursor: 'default' }}>{item.title}</Typography></Col>
                            <Col><Tag  color="var(--color04)">{item.value}</Tag></Col>
                        </Row>
                    </List.Item>
                )}
            />
        </div>
    )

}

export default GraphServicosMaisUsados