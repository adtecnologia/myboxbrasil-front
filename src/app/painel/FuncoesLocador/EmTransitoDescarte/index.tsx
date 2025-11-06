// BIBLIOTECAS REACT
import { useEffect, useState } from "react";
import { Col, Row, Tag, Typography } from "antd";

// SERVIÇOS
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, getToken } from "../../../../services";

// COMPONENTES
import PageDefault from "../../../../components/PageDefault";
import CardItem from "../../../../components/CardItem";
import Table from "../../../../components/Table";
import LoadItem from "../../../../components/LoadItem";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

const EmTransitoDescarteList = ({ type, path } : PageDefaultProps ) => {

    // ESTADOS DO COMPONENTE
    const [ action ] = useState(false);
    const [ loadMap, setLoadMap ] = useState(false);
    const [ coord, setCoord ] = useState<any>(null)
    const [ product, setProduct ] = useState<any[]>([])

    const onLoadMap = () => setLoadMap(!loadMap)

    // DEFINE COLUNAS DA TABELA
    const column = [
        { title: 'Data Pedido', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'order_locations.created_at', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center'}}>{item.created_at}</Typography>
                    <Typography><center><Tag color={item.product.status.color} style={{margin: 0}}>{item.product.status.name}</Tag></center></Typography>
                </Col>
            </Row>
        ) },
        { title: 'Cliente', dataIndex: 'CLIENT_NAME', table: 'client.NAME', width: 'auto', minWidth: '300px', sorter: false, align: 'left', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography>Pedido: n° {item.order_locations_id}</Typography>
                    <Typography>{item.order_locations.client.name}</Typography>
                    <Typography style={{color: 'var(--color02)'}}>{item.order_locations.client_street}, {item.order_locations.client_number} - {item.order_locations.client_district} - {item.order_locations.client_city?.name} / {item.order_locations.client_city?.state.acronym}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Código Caçamba', dataIndex: 'CODE', table: 'stationary_bucket.CODE', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center'}}>{item.product.code}</Typography>
                    <Typography style={{color: 'var(--color02)', textAlign: 'center'}}>Modelo {item.product.stationary_bucket_group.stationary_bucket_type.name}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Distância', dataIndex: 'order_locations.distance', width: '180px', sorter: false, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}} justify={'center'}>
                <Typography style={{textAlign: 'center'}}>{item.order_locations.distance} km</Typography>
            </Row>
        ) },
        { title: 'Data Retirada', dataIndex: 'DATE_RETIRADA_DELIVERY_FORMAT', table: 'order_location_product.DATE_RETIRADA_DELIVERY', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                <Typography><Tag style={{textAlign: 'center'}}>{ item.delivery_withdraw_date ? `Agendado para ${item.delivery_withdraw_date_format}` : 'Aguardando agendamento' }</Tag></Typography>
                { item.delivery_withdraw_date ? <Typography><Tag color="green">{item.driver_withdraw.name} - {item.driver_withdraw.cnh}</Tag></Typography> : null }
                { item.delivery_withdraw_date ? <Typography><Tag color="red">{item.vehicle_withdraw.plate} - {item.vehicle_withdraw.vehicle_type.name}</Tag></Typography> : null }
            </Row>
        ) }
    ]

    // CARREGA DADOS
    const load = () => {
        GET_API('/address?active=1').then(rs => rs.json()).then(res => {
            setCoord([ res.data[0].latitude, res.data[0].longitude ])
        }).catch(POST_CATCH)
    }


    useEffect(() => load(), [])
    useEffect(() => onLoadMap(), [product])

    return (
        <PageDefault valid={`vtd.list`} items={[
            { title: 'Em Trânsito Descarte' }
        ]}>
            <Row gutter={[16,16]}>
                <Col xs={24} md={24}>
                    <CardItem>
                        { coord ? loadMap ?
                            <MapContainer center={[Number(coord[0]), Number(coord[1])]} zoom={14} scrollWheelZoom={false} style={{width:'100%',height:330}}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <CircleMarker center={[Number(coord[0]), Number(coord[1])]} pathOptions={{ color: 'blue'}} radius={10}>
                                    <Popup> Minha empresa </Popup>
                                </CircleMarker>
                                { product.map((v, i) => (
                                    <CircleMarker key={i} center={[Number(v.order_locations.client_latitude), Number(v.order_locations.client_longitude)]} pathOptions={{ color: v.product.status.color}} radius={10}>
                                        <Popup> <Typography style={{textAlign: 'center', color: v.product.status.color, fontSize: '1.2em'}}>{v.product.status.name}</Typography> <br/> {v.order_locations.client_street}, {v.order_locations.client_number} - {v.order_locations.client_district} - {v.order_locations.client_city?.name} / {v.order_locations.client_city?.state.acronym} </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        : 
                            <MapContainer center={[Number(coord[0]), Number(coord[1])]} zoom={14} scrollWheelZoom={false} style={{width:'100%',height:330}}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <CircleMarker center={[Number(coord[0]), Number(coord[1])]} pathOptions={{ color: 'blue'}} radius={10}>
                                    <Popup> Minha empresa </Popup>
                                </CircleMarker>
                                { product.map((v, i) => (
                                    <CircleMarker key={i} center={[Number(v.order_locations.client_latitude), Number(v.order_locations.client_longitude)]} pathOptions={{ color: v.product.status.color}} radius={10}>
                                        <Popup> <Typography style={{textAlign: 'center', color: v.product.status.color, fontSize: '1.2em'}}>{v.product.status.name}</Typography> <br/> {v.order_locations.client_street}, {v.order_locations.client_number} - {v.order_locations.client_district} - {v.order_locations.client_city?.name} / {v.order_locations.client_city?.state.acronym} </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        : <LoadItem type="alt" />}
                    </CardItem>
                </Col>
                <Col md={24} xs={24}>
                    <CardItem>
                        <Table
                            column={column}
                            path={'order_location_product'}
                            type={type}
                            action={action}
                            getList={setProduct}
                            defaultFilter={{ status: 'ETR' }}
                        />
                    </CardItem>
                </Col>
            </Row>
        </PageDefault>
    )

}

export default EmTransitoDescarteList;