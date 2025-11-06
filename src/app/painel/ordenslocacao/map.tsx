// BIBLIOTECAS REACT
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Col, Row } from "antd";

// COMPONENTES
import PageDefault from "../../../components/PageDefault";
import CardItem from "../../../components/CardItem";
import LoadItem from "../../../components/LoadItem";

// SERVIÇOS
import { GET_API } from "../../../services";


// ICONES
import { MapContainer, Popup, TileLayer, CircleMarker } from "react-leaflet";

// GOOGLE MAPS
const google = `${import.meta.env.VITE_URL_ASSETS}/google-maps.png`;

const OrdemLocacaoMapa = () => {
    
    const { ID, TIPO } = useParams()

    const [ order, setOrder ] = useState<any>(null)

    // CARREGA MODELO
    const onView = () => {
        GET_API(`/order_location/${ID}`).then(rs => rs.json()).then(res => {
            setOrder(res.data)
        })
    } 

    useEffect(() => onView(), [ID])

    return (
        <PageDefault valid={true} items={[
            { title: <Link to={`/painel/${TIPO}`}>
                { TIPO === 'ordensdelocacao&entregapendente' ? 'Entregas Pendentes' : null }
                { TIPO === 'ordensdelocacao&emtransito' ? 'Em Trânsito' : null }
                { TIPO === 'ordensdelocacao&locada' ? 'Locadas' : null }
                { TIPO === 'ordensdelocacao&emanalise' ? 'Em Análise' : null }
                { TIPO === 'pedidos' ? 'Pedidos' : null }
            </Link>, },
            { title: 'Mapa' }
        ]} options={
            <Row justify={'end'} gutter={[8,8]}>
                <Link to={`/painel/${TIPO}`}>
                    <Button size="small"  type="default" className="page-default-button">
                        voltar
                    </Button>
                </Link>
            </Row>
        }>
            { order === null ? <LoadItem /> : (
                <Row gutter={[8,8]}>
                    <Col span={24}>
                        <CardItem>
                            <Row gutter={[16,8]}>
                                <Col xs={24} md={24} style={{overflow: 'hidden !important'}}>
                                    <MapContainer center={[Number(order.cart_product.address.latitude), Number(order.cart_product.address.longitude)]} zoom={16} scrollWheelZoom={false} style={{width:'100%',height:500}}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <CircleMarker center={[Number(order.cart_product.address.latitude), Number(order.cart_product.address.longitude)]} pathOptions={{ color: 'var(--color01)'}} radius={10}>
                                            <Popup> {order.cart_product.address.street}, {order.cart_product.address.number} - {order.cart_product.address.district} - {order.cart_product.address.city.name} / {order.cart_product.address.city.state.acronym} </Popup>
                                        </CircleMarker>
                                    </MapContainer>
                                    <Link to={`http://maps.google.com/?daddr=${order.cart_product.address.street}, ${order.cart_product.address.numb}, ${order.cart_product.address.district}, ${order.cart_product.address.city.name}, ${order.cart_product.address.city.state.acronym}`} target="_blank"><img src={google} className="img-google"/></Link>
                                </Col>
                            </Row>
                        </CardItem>
                    </Col>

                </Row>
            ) }
        </PageDefault>
    )

}

export default OrdemLocacaoMapa;