// BIBLIOTECAS REACT
import { useRef } from "react"
import { Col, List, Rate, Row, Typography } from "antd";

// INTERFACE
interface GraphMelhoresAvaliacoesInterface {
    filters?: any,
    height?: string
}

// CSS
import './styles.css'

const GraphMelhoresAvaliacoes = ( { filters, height } : GraphMelhoresAvaliacoesInterface ) => {

    // REF GRAFICO
    const thisGraph = useRef<any>()

    // LISTA
    const list:any[] = [
        { title: 'Modelo C3', value: 0.0 },
        { title: 'Modelo C7', value: 0.0 }
    ]

    return (
        <div style={{height: height, overflow: 'hidden'}} ref={thisGraph}>
            <List 
                dataSource={list}
                renderItem={(item, index) => (
                    <List.Item key={index}>
                        <Row justify={'space-between'} style={{width: '100%'}} align={'middle'}>
                            <Col><Typography style={{ fontSize: '1em', cursor: 'default' }}>{item.title}</Typography></Col>
                            <Col><Rate style={{marginRight: 3}} allowHalf className="rate rate-small" disabled value={item.value} /> {Number(item.value).toFixed(1)}</Col>
                        </Row>
                    </List.Item>
                )}
            />
        </div>
    )

}

export default GraphMelhoresAvaliacoes