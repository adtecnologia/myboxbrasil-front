// BIBLIOTECAS REACT
import { useEffect, useRef, useState } from "react"
import { Col, List, Row, Tag, Typography } from "antd";
import { GET_API } from "../../services";
import { Oval } from "react-loader-spinner";
import { Link } from "react-router-dom";

// INTERFACE
interface GraphProdutosMaisPedidosInterface {
    filters?: any,
    height?: string
}

// CSS
import './styles.css'

const GraphProdutosMaisPedidos = ( { filters, height } : GraphProdutosMaisPedidosInterface ) => {

    // REF GRAFICO
    const thisGraph = useRef<any>()

    // ESTADOS DO COMPONENTE
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ data, setData ] = useState<any[]>([])

    // CARREGA CIDADE PEDIDOS
    useEffect(() => { 
        setLoading(true);
        GET_API(`/dashboard/productrequest?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setData(res.data)).finally(() => setLoading(false))
    }, [filters])

    return (
        <div style={{height: height, overflow: 'hidden'}} ref={thisGraph}>
            <List 
                dataSource={data}
                locale={{ emptyText: 'Nenhum dado encontrado' }}
                renderItem={(item, index) => (
                    <List.Item key={index}>
                        <Row justify={'space-between'} style={{width: '100%'}} align={'middle'}>
                            <Col><Link to={`/painel/cacambas/${item.id}/itens`}><Typography className="dsh-item-link">Modelo {item.name} - Cor: {item.color}</Typography></Link></Col>
                            <Col><Tag  color="var(--color04)">{item.total}</Tag></Col>
                        </Row>
                    </List.Item>
                )}
            />
            { loading ? (
                <Row style={{height: '90%'}} className="loading-graph" justify={'center'} align={'middle'}>
                    <Oval visible={true} height="50" width="50" color="var(--color01)" secondaryColor="var(--color01)" ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" />
                </Row>
            ) : null }
        </div>
    )

}

export default GraphProdutosMaisPedidos