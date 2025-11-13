// react libraries
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { MapContainer, Popup, TileLayer, CircleMarker } from "react-leaflet";

// components
import PageDefault from "../../../components/PageDefault";
import CardItem from "../../../components/CardItem";
import LoadItem from "../../../components/LoadItem";
import { TableReturnButton } from "../../../components/Table/buttons";

// css
import './style.css'

// images
const google = `${import.meta.env.VITE_URL_ASSETS}/google-maps.png`;

// services
import { GET_API, PageDefaultProps } from "../../../services";


const PedidosMapa = ({ permission } : PageDefaultProps) => {
    
    const { ID } = useParams()

    const [ order, setOrder ] = useState<any>(null)

    // CARREGA MODELO
    const onView = () => {
        GET_API(`/order_location/${ID}`).then(rs => rs.json()).then(res => {
            setOrder(res.data)
        })
    } 

    useEffect(() => onView(), [ID])

    return (
        <PageDefault valid={`${permission}.list`} items={[
            { title: <Link to="/painel/pedidos">Pedidos</Link>, },
            { title: 'Mapa' }
        ]} options={
            <Row justify={'end'} gutter={[8,8]}>
                <TableReturnButton type={'list'} permission={true} />
            </Row>
        }>
            { order === null ? <LoadItem /> : (
                <Row gutter={[8,8]}>
                    <Col span={24}>
                        <CardItem>
                            <Row gutter={[16,8]}>
                                <Col xs={24} md={24} style={{overflow: 'hidden !important'}}>
                                    <MapContainer center={[Number(order.client_latitude), Number(order.client_longitude)]} zoom={16} scrollWheelZoom={false} style={{width:'100%',height:500}}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <CircleMarker center={[Number(order.client_latitude), Number(order.client_longitude)]} pathOptions={{ color: 'var(--color01)'}} radius={10}>
                                            <Popup> {order.client_street}, {order.client_number} - {order.client_district} - {order.client_city.name} / {order.client_city.state.acronym} </Popup>
                                        </CircleMarker>
                                    </MapContainer>
                                    <Link to={`http://maps.google.com/?daddr=${order.client_street}, ${order.client_numb}, ${order.client_district}, ${order.client_city.name}, ${order.client_city.state.acronym}`} target="_blank"><img src={google} className="img-google"/></Link>
                                </Col>
                            </Row>
                        </CardItem>
                    </Col>

                </Row>
            ) }
        </PageDefault>
    )

}

export default PedidosMapa;