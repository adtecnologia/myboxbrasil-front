// BIBLIOTECAS REACT
import { useEffect, useState } from "react";
import { Button, Col, Row, Tag, Typography } from "antd";

// SERVIÇOS
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, getProfileType, getToken } from "../../../services";

// COMPONENTES
import PageDefault from "../../../components/PageDefault";
import CardItem from "../../../components/CardItem";
import Table from "../../../components/Table";
import LoadItem from "../../../components/LoadItem";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { TableTrMapProductButton } from "../../../components/Table/buttons";
import MapFullScreen from "../../../components/MapFullScreen";

const OrdemLocacaoEmTransito = ({ type, path, permission } : PageDefaultProps ) => {

    // ESTADOS DO COMPONENTE
    const [ action, setAction ] = useState(false);
    const [ loadMap, setLoadMap ] = useState(false);
    const [ coord, setCoord ] = useState<any>(null)
    const [ product, setProduct ] = useState<any[]>([])
    const [ open, setOpen ] = useState<boolean>(false)

    const onLoadMap = () => setLoadMap(!loadMap)

    // DEFINE COLUNAS DA TABELA
    const column = [
        { title: 'Data Pedido', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'order_locations.created_at', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center'}}>{item.created_at}</Typography>
                    <Typography><center><Tag color={item.status.color} style={{margin: 0}}>{item.status.name}</Tag></center></Typography>
                </Col>
            </Row>
        ) },
        { title: 'Local locação', dataIndex: 'CLIENT_NAME', table: 'order_locations.id', width: 'auto', minWidth: '300px', sorter: true, align: 'left', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography>Pedido: n° {item.order_locations_id}</Typography>
                    { getProfileType() === 'LEGAL_SELLER' || getProfileType() === 'SELLER' || getProfileType() === 'SELLER_DRIVER' ? <Typography>{item.order_locations.client.name}</Typography> : null }
                    <Typography style={{color: 'var(--color02)'}}>{item.order_locations.client_street}, {item.order_locations.client_number} - {item.order_locations.client_district} - {item.order_locations.client_city?.name} / {item.order_locations.client_city?.state.acronym}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Código Caçamba', dataIndex: 'CODE', table: 'stationary_buckets.code', width: '180px', sorter: true, align: 'center', render: (item:any) => (
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
        { title: 'Data Entrega', dataIndex: 'CODE', table: 'order_location_products.delivery_location_date', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                <Typography><Tag style={{textAlign: 'center'}}>{ item.delivery_location_date ? `Agendado para ${item.delivery_location_date_format}` : 'Aguardando agendamento' }</Tag></Typography>
                { item.delivery_location_date ? <Typography><Tag color="green">{item.driver_location.name} - {item.driver_location.cnh}</Tag></Typography> : null }
                { item.delivery_location_date ? <Typography><Tag color="red">{item.vehicle_location.plate} - {item.vehicle_location.vehicle_type.name}</Tag></Typography> : null }
            </Row>
        ) },
        { title: 'Ações', dataIndex: null, width: '100px', sorter: false, align: 'center', render: (item: any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                <TableTrMapProductButton type={type} permission={permission} item={item} action={() => setAction(!action)} path={path} />
            </Row>
        ) },
    ]

    // CARREGA DADOS
    const load = () => {
        GET_API('/address?default=1').then(rs => rs.json()).then(res => {
            setCoord([ res.data[0].latitude, res.data[0].longitude ])
        }).catch(POST_CATCH)
    }

    useEffect(() => load(), [])
    useEffect(() => onLoadMap(), [product])

    return (
        <PageDefault valid={`${permission}.list`} items={[
            { title: 'Em Trânsito Locação' }
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
                                { getProfileType() === 'LEGAL_SELLER' || getProfileType() === 'SELLER' || getProfileType() === 'SELLER_DRIVER' ? (
                                    <CircleMarker center={[Number(coord[0]), Number(coord[1])]} pathOptions={{ color: 'blue'}} radius={10}>
                                        <Popup> Minha empresa </Popup>
                                    </CircleMarker>
                                ) : null }
                                { product.map((v, i) => (
                                    <CircleMarker key={i} center={[Number(v.order_locations.client_latitude), Number(v.order_locations.client_longitude)]} pathOptions={{ color: v.status.color}} radius={10}>
                                        <Popup> <Typography style={{textAlign: 'center', color: v.status.color, fontSize: '1.2em'}}>{v.status.name}</Typography> <br/> {v.order_locations.client_street}, {v.order_locations.client_number} - {v.order_locations.client_district} - {v.order_locations.client_city?.name} / {v.order_locations.client_city?.state.acronym} </Popup>
                                    </CircleMarker>
                                ))}
                                 <Button className="btn-map-screen" type="text" onClick={() => setOpen(true)}></Button>
                            </MapContainer>
                        : 
                            <MapContainer center={[Number(coord[0]), Number(coord[1])]} zoom={14} scrollWheelZoom={false} style={{width:'100%',height:330}}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                { getProfileType() === 'LEGAL_SELLER' || getProfileType() === 'SELLER' || getProfileType() === 'SELLER_DRIVER' ? (
                                    <CircleMarker center={[Number(coord[0]), Number(coord[1])]} pathOptions={{ color: 'blue'}} radius={10}>
                                        <Popup> Minha empresa </Popup>
                                    </CircleMarker>
                                ) : null }
                                { product.map((v, i) => (
                                    <CircleMarker key={i} center={[Number(v.order_locations.client_latitude), Number(v.order_locations.client_longitude)]} pathOptions={{ color: v.status.color}} radius={10}>
                                        <Popup> <Typography style={{textAlign: 'center', color: v.status.color, fontSize: '1.2em'}}>{v.status.name}</Typography> <br/> {v.order_locations.client_street}, {v.order_locations.client_number} - {v.order_locations.client_district} - {v.order_locations.client_city?.name} / {v.order_locations.client_city?.state.acronym} </Popup>
                                    </CircleMarker>
                                ))}
                                 <Button className="btn-map-screen" type="text" onClick={() => setOpen(true)}></Button>
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
                            defaultFilter={{ status: 'ETL' }}
                            getList={setProduct}
                            useFilter={ getProfileType() === 'LEGAL_SELLER' || getProfileType() === 'SELLER' || getProfileType() === 'SELLER_DRIVER' ? [
                                { type: 'search', label: 'Motorista', name: 'driver_id', url: "/driver", labelField: ["name", "cnh"], }
                            ] : []}
                        />
                    </CardItem>
                </Col>
            </Row>
            <MapFullScreen startStatus={['ETL']} open={open} setOpen={setOpen} />
        </PageDefault>
    )

}

export default OrdemLocacaoEmTransito;