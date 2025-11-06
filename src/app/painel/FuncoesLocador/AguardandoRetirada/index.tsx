// BIBLIOTECAS REACT
import { useEffect, useState } from "react";
import { Button, Col, Form, Input, Modal, Row, Segmented, Tag, Typography } from "antd";

// SERVIÇOS
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, getToken, verifyConfig } from "../../../../services";

// COMPONENTES
import PageDefault from "../../../../components/PageDefault";
import CardItem from "../../../../components/CardItem";
import Table from "../../../../components/Table";
import LoadItem from "../../../../components/LoadItem";
import SelectSearch from "../../../../components/SelectSearch";
import { TbMapPin, TbMapPinOff } from "react-icons/tb";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { MdCheckBoxOutlineBlank, MdOutlineCheckBox } from "react-icons/md";
import { TableTrMapProductButton } from "../../../../components/Table/buttons";

const AguardandoRetiradaList = ({ type, path, permission } : PageDefaultProps ) => {

    // ESTADOS DO COMPONENTE
    const [ loadingButton, setLoadingButton ] = useState(false);
    const [ action, setAction ] = useState(false);
    const [ loadMap, setLoadMap ] = useState(false);
    const [ coord, setCoord ] = useState<any>(null)
    const [ product, setProduct ] = useState<any[]>([])
    const [ destination ] = useState<any>('')
    const [ driver ] = useState<any>('')
    const [ vehicle ] = useState<any>('')
    const [ typeDestination, setTypeDestination ] = useState<'return_provider'|'go_to_the_final_destination'>('go_to_the_final_destination')

    const onProduct = (item:any) => {
        
        onLoadMap()

        var temp = product
        
        if ( temp.filter((v) => Number(v.id) === Number(item.id)).length > 0 ) {
            temp.splice(temp.indexOf(item), 1)
        } else {
            temp.push(item)
        }

        form.setFieldValue('type_destination', typeDestination)
        
        setProduct(temp)

        onLoadMap()

    }

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
        { title: 'Data Retirada', dataIndex: 'DATE_RETIRADA_DELIVERY', table: 'order_location_product.DATE_RETIRADA_DELIVERY', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                <Typography><Tag style={{textAlign: 'center'}}>{ item.delivery_withdrawl_date ? `Agendado para ${item.delivery_withdrawl_date_format}` : 'Aguardando retirada' }</Tag></Typography>
                { item.delivery_withdrawl_date ? <Typography><Tag color="green">{item.driver_withdraw.name} - {item.driver_withdraw.cnh}</Tag></Typography> : null }
                { item.delivery_withdrawl_date ? <Typography><Tag color="red">{item.vehicle_withdraw.plate} - {item.vehicle_withdraw.vehicle_type.name}</Tag></Typography> : null }
            </Row>
        ) },
        { title: 'Ações', dataIndex: null, width: '100px', sorter: false, align: 'center', render: (item: any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                { verifyConfig(['vrp.edit']) ? product.filter((v) => Number(v.id) === Number(item.id)).length > 0 ? <Col><MdOutlineCheckBox onClick={() => onProduct(item)} size={18} className="actions-button"/></Col>
                : <Col><MdCheckBoxOutlineBlank onClick={() => onProduct(item)} size={18} className="actions-button"/></Col> : null}
                <TableTrMapProductButton type={type} permission={permission} item={item} action={() => setAction(!action)} path={path} />
            </Row>
        ) },
    ]

     // CARREGA DADOS
     const load = () => {
        GET_API('/address?active=1').then(rs => rs.json()).then(res => {
            setCoord([ res.data[0].latitude, res.data[0].longitude ])
        }).catch(POST_CATCH)
    }

    const [ form ] = Form.useForm()

    const onSend = (values:any) => {

        setLoadingButton(true)

        try {
            
            product.forEach(item => {
                
                POST_API(`/order_location_product`, values, item.id)
                .then((rs) => {
                    if (rs.ok) { } else {
                        Modal.warning({ title: "Algo deu errado", content: 'Não foi possível agendar entrega' });
                    }
                })
                .catch(POST_CATCH)
    
            });

        } catch (error) {
            POST_CATCH()
        } finally {
            form.resetFields()
            setProduct([])
            setAction(!action)
            setLoadingButton(false)
        }

    }

    useEffect(() => load(), [])

    return (
        <PageDefault valid={`vrp.list`} items={[
            { title: 'Aguardando Retirada' }
        ]}>
            <Row gutter={[16,16]}>
                <Col xs={24} md={ verifyConfig(['vrp.edit']) ? 16 : 24 }>
                    <CardItem>
                        { coord ? loadMap ?
                            <MapContainer center={[Number(coord[0]), Number(coord[1])]} zoom={14} scrollWheelZoom={false} style={{width:'100%',height:412}}>
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
                            <MapContainer center={[Number(coord[0]), Number(coord[1])]} zoom={14} scrollWheelZoom={false} style={{width:'100%',height:412}}>
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
                <Col xs={24} md={ verifyConfig(['vrp.edit']) ? 8 : 24 }>
                    <CardItem title={`Agendar retirada | ${product.length} selecionado(s)`}>
                        <Form layout="vertical" form={form} onFinish={onSend}>
                            <Row gutter={[8,0]}>
                                <Col span={8}>
                                    <Form.Item label="Data e hora entrega" name="delivery_withdrawl_date" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                        <Input type="date" min={new Date().toISOString().slice(0, 10)} />
                                    </Form.Item>
                                </Col>
                                <Col span={16}>
                                    <Form.Item label="Local de destino" name="type_destination" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                        <Segmented block onChange={setTypeDestination} options={[ { label: 'Ir para destino final', value: 'go_to_the_final_destination' }, { label: 'Retornar para empresa', value: 'return_provider', disabled: true } ]} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            { typeDestination === 'go_to_the_final_destination' ? (
                                <Form.Item label="Destino final" name="destination_id" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                    <SelectSearch labelField={['name', 'document_number']} placeholder="Nome - Documento" effect={destination} value={form.getFieldValue('destination_id')} url="/final_destination" change={(v:any) => form.setFieldValue('destination_id', v?.value)} />
                                </Form.Item>
                            ) : null }
                            <Form.Item label="Motorista" name="withdraw_driver_id" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <SelectSearch labelField={['name', 'cnh']} placeholder="Nome - CNH" effect={driver} value={form.getFieldValue('withdraw_driver_id')} url="/driver" change={(v:any) => form.setFieldValue('withdraw_driver_id', v?.value)} />
                            </Form.Item>
                            <Form.Item label="Veiculo" name="withdraw_vehicle_id" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <SelectSearch labelField={['plate', 'vehicle_type.name']} placeholder="Placa - Tipo" effect={vehicle} value={form.getFieldValue('withdraw_vehicle_id')} url="/vehicle" change={(v:any) => form.setFieldValue('withdraw_vehicle_id', v?.value)} />
                            </Form.Item>
                            <Button htmlType="submit" type="primary" block disabled={!(product.length > 0)} loading={loadingButton}>Agendar</Button>
                        </Form>
                    </CardItem>
                </Col>
                <Col md={24} xs={24}>
                    <CardItem>
                        <Table
                            column={column}
                            path={'order_location_product'}
                            type={type}
                            action={action}
                            defaultFilter={{ status: 'AR' }}
                        />
                    </CardItem>
                </Col>
            </Row>
        </PageDefault>
    )

}

export default AguardandoRetiradaList;