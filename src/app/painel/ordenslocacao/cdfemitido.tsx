// BIBLIOTECAS REACT
import { useEffect, useState } from "react";
import { Button, Col, Form, Image, Input, Modal, Row, Segmented, Tag, Tooltip, Typography } from "antd";

// SERVIÇOS
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, getProfileType, getToken, verifyConfig } from "../../../services";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// COMPONENTES
import PageDefault from "../../../components/PageDefault";
import CardItem from "../../../components/CardItem";
import Table from "../../../components/Table";
import LoadItem from "../../../components/LoadItem";
import { TbCamera, TbSend, TbSend2 } from "react-icons/tb";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { TableTrMapProductButton } from "../../../components/Table/buttons";
import { MdCheckBoxOutlineBlank, MdOutlineCheckBox } from "react-icons/md";
import SelectSearch from "../../../components/SelectSearch";
import { IoDocumentAttachOutline } from "react-icons/io5";
import MapFullScreen from "../../../components/MapFullScreen";

const OrdemLocacaoCDFEmitido = ({ type, path, permission } : PageDefaultProps ) => {

    // ESTADOS DO COMPONENTE
    const [ loadingButton, setLoadingButton ] = useState(false);
    const [ action, setAction ] = useState(false);
    const [ loadMap, setLoadMap ] = useState(false);
    const [ modalGallery, setModalGallery ] = useState(false);
    const [ coord, setCoord ] = useState<any>(null)
    const [ data, setData ] = useState<any>(null)
    const [ product, setProduct ] = useState<any[]>([])
    const [ productSelect, setProductSelect ] = useState<any[]>([])
    const [ gallery, setGallery ] = useState<any[]>([])

    const [ destination ] = useState<any>('')
    const [ driver ] = useState<any>('')
    const [ vehicle ] = useState<any>('')
    const [ typeDestination, setTypeDestination ] = useState<''|'return_provider'|'go_to_the_final_destination'>('')
    const [ modal, setModal ] = useState(false);
    const [ file, setFile ] = useState<any>('');
    const [ open, setOpen ] = useState<boolean>(false)

    const onLoadMap = () => setLoadMap(!loadMap)
    const onModalGallery = () => setModalGallery(!modalGallery)

    const [ form ] = Form.useForm()

    const onProduct = (item:any) => {
        
        onLoadMap()

        var temp = productSelect
        
        if ( temp.filter((v) => Number(v.id) === Number(item.id)).length > 0 ) {
            temp.splice(temp.indexOf(item), 1)
        } else {
            temp.push(item)
        }
        
        setProductSelect(temp)

        onLoadMap()

    }

    // DEFINE COLUNAS DA TABELA
    const column = [
        { title: 'Data Locação', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'order_locations.created_at', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center'}}>{item.location_date_format}</Typography>
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
        { title: 'Código Caçamba', dataIndex: 'CODE', table: 'stationary_bucket.CODE', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center'}}>{item.product.code}</Typography>
                    <Typography style={{color: 'var(--color02)', textAlign: 'center'}}>Modelo {item.product.stationary_bucket_group.stationary_bucket_type.name}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Locação', dataIndex: 'CODE', table: 'stationary_bucket.CODE', width: '180px', sorter: false, align: 'center', render: (item:any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                { item.delivery_location_date ? <Typography><Tag color="green">{item.driver_location?.name} - {item.driver_location?.cnh}</Tag></Typography> : null }
                { item.delivery_location_date ? <Typography><Tag color="red">{item.vehicle_location?.plate} - {item.vehicle_location?.vehicle_type.name}</Tag></Typography> : null }
            </Row>
        ) },
        { title: 'Retirada', dataIndex: 'CODE', table: 'stationary_bucket.CODE', width: '180px', sorter: false, align: 'center', render: (item:any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                <Typography><Tag style={{textAlign: 'center'}}>{ item.delivery_withdrawl_date ? `Agendado para ${item.delivery_withdrawl_date_format}` : 'Aguardando retirada' }</Tag></Typography>
                { item.delivery_withdrawl_date ? <Typography><Tag color="green">{item.driver_withdraw?.name} - {item.driver_withdraw?.cnh}</Tag></Typography> : null }
                { item.delivery_withdrawl_date ? <Typography><Tag color="red">{item.vehicle_withdraw?.plate} - {item.vehicle_withdraw?.vehicle_type.name}</Tag></Typography> : null }
            </Row>
        ) },
        { title: 'Ações', dataIndex: null, width: '100px', sorter: false, align: 'center', render: (item: any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                <Col><Tooltip title="CDF"><IoDocumentAttachOutline size={18} className="actions-button" onClick={() => openPDF(item.mtr.cdf_id)}/></Tooltip></Col>
                <TableTrMapProductButton type={type} permission={permission} item={item} path={path} />
            </Row>
        ) },
    ]

    const openPDF = (id:string) => {
        GET_API(`/cdf/${id}`).then(rs => rs.json()).then(res => {
            setFile(res.data.link)
            setModal(true)
        }).catch(POST_CATCH)
    }

    // CARREGA DADOS
    const load = () => {
        form.setFieldValue('type_destination', 'go_to_the_final_destination')
        GET_API('/address?default=1').then(rs => rs.json()).then(res => {
            setCoord([ res.data[0].latitude, res.data[0].longitude ])
        }).catch(POST_CATCH)
    }

    const onSend = (values:any) => {

        setLoadingButton(true)

        values.type_destination = typeDestination

        try {
            
            productSelect.forEach(item => {
                
                POST_API(`/order_location_product`, values, item.id)
                .then((rs) => {
                    if (rs.ok) { } else {
                        Modal.warning({ title: "Algo deu errado", content: 'Não foi possível agendar entrega' });
                    }
                })
                .catch(POST_CATCH)
    
            });

            form.resetFields()
            setProductSelect([])
            setAction(!action)

        } catch (error) {
            POST_CATCH()
        } finally {
            setLoadingButton(false)
        }

    }

    useEffect(() => load(), [])
    useEffect(() => onLoadMap(), [product])
    useEffect(() => {
        GET_API(`/me`).then((rs) => {
            if (rs.ok) return rs.json();
            else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
          }).then((res) => {
            setTypeDestination(res.data.environmental_license_verify === 'y' ? 'return_provider' : 'go_to_the_final_destination')
          }).catch(POST_CATCH);
    }, [])

    return (
        <PageDefault valid={`${permission}.list`} items={[
            { title: 'CDF Emitido' }
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
                            defaultFilter={{ status: 'CDFE' }}
                            getList={setProduct}
                        />
                    </CardItem>
                </Col>
            </Row>
            <Modal style={{top: 20}} title="Fotos da locação" open={modalGallery} onCancel={onModalGallery} footer={false}>
                <Row gutter={[8,8]}>
                    { gallery.length === 0 ? <Col span={24}><LoadItem type="alt" /></Col> : gallery.map((v, i) => <Col span={12} key={i}><Image src={v.url} /></Col>) }
                </Row>
            </Modal>
            <Modal className="modalpdf" width={'100%'} style={{top: 20}} open={modal} onCancel={() => setModal(false)} destroyOnClose footer={false}>
                <Row>
                    <Col span={24}>
                        <object>
                            <embed id="pdfID" type="text/html" width="100%" height="600" src={`${file}`} />
                        </object>
                    </Col>
                </Row>
            </Modal>
            <MapFullScreen startStatus={['CDFE']} open={open} setOpen={setOpen} />
        </PageDefault>
    )

}

export default OrdemLocacaoCDFEmitido;