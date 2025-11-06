// BIBLIOTECAS REACT
import { useEffect, useState } from "react";
import { Button, Col, Input, Modal, Row, Tag, Typography, message } from "antd";

// SERVIÇOS
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, getToken, verifyConfig } from "../../../../services";

// COMPONENTES
import PageDefault from "../../../../components/PageDefault";
import CardItem from "../../../../components/CardItem";
import Table from "../../../../components/Table";
import LoadItem from "../../../../components/LoadItem";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Scanner } from "@yudiel/react-qr-scanner";
import { IoClose } from "react-icons/io5";

const MinhasCacambas = ({ type, path, permission } : PageDefaultProps ) => {

    // ESTADOS DO COMPONENTE
    const [ typeLoad, setTypeLoad ] = useState<any>('A');
    const [ loadingButton, setLoadingButton ] = useState(false);
    const [ action, setAction ] = useState(false);
    const [ modal, setModal ] = useState(false);
    const [ loadMap, setLoadMap ] = useState(false);
    const [ coord, setCoord ] = useState<any>(null)
    const [ myCoord, setMyCoord ] = useState<any>(null)
    const [ product, setProduct ] = useState<any[]>([])
    const [ productSelect, setProductSelect ] = useState<any[]>([])

    const onProduct = (item:any) => {
        
        var temp = productSelect
        
        if ( temp.filter((v) => Number(v.ID) === Number(item.ID)).length > 0 ) {
            message.warning({content: 'Caçamba já selecionada', key: '09op'})
        } else {
            temp.push(item)
        }
        
        setProductSelect(temp)

    }

    const onDelProduct = (item:any) => {
        
        var temp = productSelect

        temp =  temp.filter((v) => Number(v.id) !== Number(item.id))

        setProductSelect(temp)

    }

    const onLoadMap = () => setLoadMap(!loadMap)

    // DEFINE COLUNAS DA TABELA
    const column = [
        { title: 'Data Pedido', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'order_locations.created_at', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography><center><Tag color={item.product.status.color} style={{margin: 0}}>{item.product.status.name}</Tag></center></Typography>
                    <Typography style={{textAlign: 'center'}}>{item.created_at}</Typography>
                    <Typography style={{textAlign: 'center', color: 'var(--color02)'}}>{ productSelect.filter((v) => Number(v.ID) === Number(item.ID)).length > 0 ? 'Selecionada' : 'Não Selecionada' }</Typography>
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
        { title: 'Endereço locação', dataIndex: 'ADDRESS', table: 'address_order.STRRET', width: 'auto', minWidth: '300px', sorter: false, align: 'left', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography>Pedido: n° {item.order_locations_id}</Typography>
                    <Typography style={{color: 'var(--color02)'}}>{item.order_locations.client_street}, {item.order_locations.client_number} - {item.order_locations.client_district} - {item.order_locations.client_city?.name} / {item.order_locations.client_city?.state.acronym}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Tempo Restante', dataIndex: 'TIME_LEFT', table: 'timedif', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    { item.product.status.code === 'L' || item.product.status.code === 'AR' ? <Typography style={{textAlign: 'center', color: (item.order_locations.cart_product.days - item.timedif) > -1 ? 'green' : 'red'}}>{item.order_locations.cart_product.days - item.timedif} dia(s) de locação</Typography> : <Typography style={{textAlign: 'center'}}>Indisponível</Typography> }
                </Col>
            </Row>
        ) },
        { title: 'Dados Locação', width: '180px', sorter: false, align: 'center', render: (item:any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                { item.product.status.code === 'EP' || item.product.status.code === 'ETL' ? (
                    <>
                        <Typography><Tag style={{textAlign: 'center'}}>{ item.delivery_location_date ? `Locação agendada ${item.delivery_location_date_format}` : 'Aguardando locação' }</Tag></Typography>
                        { item.delivery_location_date ? <Typography><Tag color="green">{item.driver_location.name} - {item.driver_location.cnh}</Tag></Typography> : null }
                        { item.delivery_location_date ? <Typography><Tag color="red">{item.vehicle_location.plate} - {item.vehicle_location.vehicle_type.name}</Tag></Typography> : null }
                    </>
                ) : (
                    <>
                        <Typography><Tag style={{textAlign: 'center'}}>{`Locado em ${item.location_date_format}`}</Tag></Typography>
                        { item.location_date ? <Typography><Tag color="green">{item.driver_location.name} - {item.driver_location.cnh}</Tag></Typography> : null }
                        { item.location_date ? <Typography><Tag color="red">{item.vehicle_location.plate} - {item.vehicle_location.vehicle_type.name}</Tag></Typography> : null }
                    </>
                ) }
            </Row>
        ) },
        { title: 'Dados Retirada', width: '180px', sorter: false, align: 'center', render: (item:any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                { item.product.status.code === 'EP' || item.product.status.code === 'ETL'|| item.product.status.code === 'L' || item.product.status.code === 'AR' ? (
                    <>
                        <Typography><Tag style={{textAlign: 'center'}}>{ item.delivery_withdrawl_date ? `Retirada agendada ${item.delivery_withdrawl_date_format}` : 'Aguardando locação' }</Tag></Typography>
                        { item.delivery_withdrawl_date ? <Typography><Tag color="green">{item.driver_withdraw.name} - {item.driver_withdraw.cnh}</Tag></Typography> : null }
                        { item.delivery_withdrawl_date ? <Typography><Tag color="red">{item.vehicle_withdraw.plate} - {item.vehicle_withdraw.vehicle_type.name}</Tag></Typography> : null }
                    </>
                ) : (
                    <>
                        <Typography><Tag style={{textAlign: 'center'}}>{`Retirado em ${item.withdraw_date_format}`}</Tag></Typography>
                        { item.withdraw_date ? <Typography><Tag color="green">{item.driver_withdraw.name} - {item.driver_withdraw.cnh}</Tag></Typography> : null }
                        { item.withdraw_date ? <Typography><Tag color="red">{item.vehicle_withdraw.plate} - {item.vehicle_withdraw.vehicle_type.name}</Tag></Typography> : null }
                    </>
                ) }
            </Row>
        ) }
    ]

    const reader = (result:any) => {
        GET_API(`/order_location_product?code=${result[0].rawValue}&status=L`).then(rs => rs.json()).then(res => {
            if (res.data.length > 0) {
                onProduct(res.data[0])
                onModal()
                message.success({content: 'Caçamba selecionada', key: '09op'})
            } else {
                message.error({content: 'Caçamba não encontrada', key: '09op'})
            }
        }).catch(POST_CATCH)
    }

    const readerWrite = (result:any) => {
        GET_API(`/order_location_product?code=${result}&status=L`).then(rs => rs.json()).then(res => {
            if (res.data.length > 0) {
                onProduct(res.data[0])
                onModal()
                message.success({content: 'Caçamba selecionada', key: '09op'})
            } else {
                message.error({content: 'Caçamba não encontrada', key: '09op'})
            }
        }).catch(POST_CATCH)
    }

    const onSend = () => {

        setLoadingButton(true)

        try {
            
            productSelect.forEach(item => {
                
                POST_API(`/order_location_product`, { status: 'AR' }, item.id)
                .then((rs) => {
                    if (rs.ok) { } else {
                        Modal.warning({ title: "Algo deu errado", content: 'Não foi possível pedir retirada' });
                    }
                })
                .catch(POST_CATCH)
    
            });

        } catch (error) {
            POST_CATCH()
        } finally {
            setProductSelect([])
                setAction(!action)
            setLoadingButton(false)
        }

    }

    const onModal = () => setModal(!modal)

    useEffect(() => {
        if (!navigator.geolocation) { Modal.error({title: 'Atenção', content: 'Seu navegador não suporta geolocalização, o que torna impossível a utilização do mapa'}) }
        navigator.geolocation.getCurrentPosition((position) => setMyCoord([position.coords.latitude, position.coords.longitude]), () =>  Modal.warning({title: 'Atenção', content: 'Não foi possível recuperar sua localização'}) );
    }, [])

    useEffect(() => {
        onLoadMap()
    }, [ myCoord, product, productSelect ])

    return (
        <PageDefault valid={`mcb.list`} items={[
            { title: 'Minhas caçambas' }
        ]}>
            { typeLoad ? (
                <Row gutter={[16,16]}>
                    <Col xs={24} md={ verifyConfig(['mcb.list']) ? 16 : 24 }>
                        <CardItem>
                            { myCoord ? loadMap ?
                                <MapContainer center={[Number(myCoord[0]), Number(myCoord[1])]} zoom={14} scrollWheelZoom={false} style={{width:'100%',height:330}}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    { product.map((v, i) => v.product.status.code === 'EP' || v.product.status.code === 'ETL' ? (
                                        <CircleMarker key={i} center={[Number(v.order_locations.provider_latitude), Number(v.order_locations.provider_longitude)]} pathOptions={{ color: v.product.status.color}} radius={10}>
                                            <Popup> <Typography style={{textAlign: 'center', color: v.product.status.color, fontSize: '1.2em'}}>{v.product.status.name}</Typography> <br/> {v.order_locations.provider_street}, {v.order_locations.provider_number} - {v.order_locations.provider_district} - {v.order_locations.provider_city?.name} / {v.order_locations.provider_city?.state.acronym} </Popup>
                                        </CircleMarker>
                                    ) :
                                        <CircleMarker key={i} center={[Number(v.order_locations.client_latitude), Number(v.order_locations.client_longitude)]} pathOptions={{ color: v.product.status.color}} radius={10}>
                                            <Popup> <Typography style={{textAlign: 'center', color: v.product.status.color, fontSize: '1.2em'}}>{v.product.status.name}</Typography> <br/> {v.order_locations.client_street}, {v.order_locations.client_number} - {v.order_locations.client_district} - {v.order_locations.client_city?.name} / {v.order_locations.client_city?.state.acronym} </Popup>
                                        </CircleMarker>
                                    ) }
                                </MapContainer>
                            : 
                                <MapContainer center={[Number(myCoord[0]), Number(myCoord[1])]} zoom={14} scrollWheelZoom={false} style={{width:'100%',height:330}}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    { product.map((v, i) => v.product.status.code === 'EP' || v.product.status.code === 'ETL' ? (
                                        <CircleMarker key={i} center={[Number(v.order_locations.provider_latitude), Number(v.order_locations.provider_longitude)]} pathOptions={{ color: v.product.status.color}} radius={10}>
                                            <Popup> <Typography style={{textAlign: 'center', color: v.product.status.color, fontSize: '1.2em'}}>{v.product.status.name}</Typography> <br/> {v.order_locations.provider_street}, {v.order_locations.provider_number} - {v.order_locations.provider_district} - {v.order_locations.provider_city?.name} / {v.order_locations.provider_city?.state.acronym} </Popup>
                                        </CircleMarker>
                                    ) :
                                        <CircleMarker key={i} center={[Number(v.order_locations.client_latitude), Number(v.order_locations.client_longitude)]} pathOptions={{ color: v.product.status.color}} radius={10}>
                                            <Popup> <Typography style={{textAlign: 'center', color: v.product.status.color, fontSize: '1.2em'}}>{v.product.status.name}</Typography> <br/> {v.order_locations.client_street}, {v.order_locations.client_number} - {v.order_locations.client_district} - {v.order_locations.client_city?.name} / {v.order_locations.client_city?.state.acronym} </Popup>
                                        </CircleMarker>
                                    ) }
                                </MapContainer>
                            : <LoadItem type="alt" />}
                        </CardItem>
                    </Col>
                    <Col xs={24} md={verifyConfig(['mcb.list']) ? 8 : 24}>
                        <CardItem title={`Pedir retirada | ${productSelect.length} selecionado(s)`}>
                            <Row gutter={[8,8]} style={{width: '100%'}}>
                                { productSelect.map((v:any, i:any) => (
                                    <Col span={24} key={i} style={{display: 'flex'}}>
                                        <Typography>{v.product.code}</Typography>
                                        <IoClose style={{position: 'absolute', right: '0.4em', top: '0.4em', cursor: 'pointer'}} onClick={() => onDelProduct(v)} />
                                    </Col>  
                                )) }
                                <Col span={12}>
                                    <Button type="default" block onClick={onModal}>Ler QRcode</Button>
                                </Col>
                                <Col span={12}>
                                    <Button type="primary" block disabled={!(productSelect.length > 0)} loading={loadingButton} onClick={onSend}>Pedir retirada</Button>
                                </Col>
                            </Row>
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
                            />
                        </CardItem>
                    </Col>
                    <Modal open={modal} onCancel={onModal} footer={false} closable={false} destroyOnClose style={{top: 20}}>
                        <Scanner onScan={reader} styles={{container: { height: 472 }}}/>
                        <Input.Search onSearch={readerWrite} size="large" placeholder="Pesquisar código caçamba" style={{marginTop: 10}} enterButton="Procurar caçamba" />
                        <Typography style={{textAlign: 'center', fontSize: '1.4em', marginTop: '1em', color: 'var(--color02)'}}> {productSelect.length} caçamba(s) selecionado(s)</Typography>
                    </Modal>
                </Row>
            ) : <Row><Col span={24}><LoadItem /></Col></Row> }
        </PageDefault>
    )

}

export default MinhasCacambas;