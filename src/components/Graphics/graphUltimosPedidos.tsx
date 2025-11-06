// BIBLIOTECAS REACT
import { useEffect, useState } from "react"
import { Col, List, Row, Tag, Typography } from "antd";
import { Oval } from "react-loader-spinner";
import { GET_API } from "../../services";
import { Link } from "react-router-dom";

// INTERFACE
interface GraphUltimosPedidosInterface {
    height?: string
}

// CSS
import './styles.css'

const GraphUltimosPedidos = ( { height } : GraphUltimosPedidosInterface ) => {

    // ESTADOS DO COMPONENTE
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ data, setData ] = useState<any[]>([])

    // CARREGA PEDIDOS
    useEffect(() => { 
        setLoading(true);
        GET_API(`/order_location?page=1&per_page=6&sort=-order_locations.created_at`).then(rs => rs.json()).then(res => setData(res.data)).finally(() => setLoading(false))
    }, [])

    return (
        <div style={{height: height, overflow: 'hidden'}}>
            <List 
                dataSource={data}
                locale={{ emptyText: 'Nenhum dado encontrado' }}
                renderItem={(item, index) => (
                    <List.Item key={index}>
                        <Row justify={'space-between'} style={{width: '100%'}} align={'middle'}>
                            <Col><Link to={`/painel/pedircacamba/cacamba/${item.cart_product.product.id}`}><Typography className="dsh-item-link">Modelo {item.cart_product.product.stationary_bucket_type.name} - Cor: {item.cart_product.product.color}</Typography></Link></Col>
                            <Col><Tag  color={item.status.color}>{item.created_at}</Tag></Col>
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

export default GraphUltimosPedidos