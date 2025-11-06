// BIBLIOTECAS REACT
import { useEffect, useState } from "react";
import { Button, Col, Divider, Form, Image, Input, InputNumber, List, message, Modal, Row, Segmented, Select, Tag, Tooltip, Typography } from "antd";

// SERVIÇOS
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, getProfileType, getToken, verifyConfig } from "../../../services";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// COMPONENTES
import PageDefault from "../../../components/PageDefault";
import CardItem from "../../../components/CardItem";
import Table from "../../../components/Table";
import LoadItem from "../../../components/LoadItem";
import { TbCamera, TbFileSearch, TbSend, TbSend2 } from "react-icons/tb";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { TableTrMapProductButton } from "../../../components/Table/buttons";
import { MdCheckBoxOutlineBlank, MdOutlineCheckBox } from "react-icons/md";
import SelectSearch from "../../../components/SelectSearch";
import { IoClose, IoDocumentAttachOutline } from "react-icons/io5";
import { HiOutlineDocumentMagnifyingGlass } from "react-icons/hi2";
import { CiFileOff } from "react-icons/ci";
import { Scanner } from "@yudiel/react-qr-scanner";
import MapFullScreen from "../../../components/MapFullScreen";

const OrdemLocacaoEmAnalise = ({ type, path, permission } : PageDefaultProps ) => {

    // ESTADOS DO COMPONENTE
    const [ loadingButton, setLoadingButton ] = useState(false);
    const [ action, setAction ] = useState(false);
    const [ loadMap, setLoadMap ] = useState(false);
    const [ modalGallery, setModalGallery ] = useState(false);
    const [ coord, setCoord ] = useState<any>(null)
    const [ product, setProduct ] = useState<any[]>([])
    const [ productSelect, setProductSelect ] = useState<any>(null)
    const [ gallery, setGallery ] = useState<any[]>([])
    const [ residue, setResidue ] = useState<any[]>([])
    const [ mtr, setmtr ] = useState<any>()
    const [ valid, setValid ] = useState<boolean>(false)

    const [ modalForm, setModalForm ] = useState(false);
    const [ modal, setModal ] = useState(false);
    const [ file, setFile ] = useState<any>('');

    const [ modelValue, setModelValue ] = useState<any>();
    const [ modalCDF, setModalCDF ] = useState<boolean>(false);
    const [ CDF, setCDF ] = useState<any[]>([]);
    const [ modalQRCode, setModalQRCode ] = useState<boolean>(false);

    const openPDF = (url:string) => {
        setFile(url)
        setModal(true)
    }

    const [ destination ] = useState<any>('')
    const [ driver ] = useState<any>('')
    const [ vehicle ] = useState<any>('')
    const [ model ] = useState<any>('')
    const [ open, setOpen ] = useState<boolean>(false)


    const onLoadMap = () => setLoadMap(!loadMap)
    const onModalGallery = () => setModalGallery(!modalGallery)


    const [ form ] = Form.useForm()

    const onProductSelect = (item:any) => {
        GET_API(`/cdf/${item.mtr.cdf_id}`)
        .then((rs) => {
            if (rs.ok) {
                return rs.json();
            } else {
                Modal.warning({ title: "Algo deu errado", content: 'Não foi possível atualizar caçamba' });
            }
        }).then((res) => {
            console.log(res.data.items)
            setTimeout(() => {
                setCDF(res.data.items)
                setProductSelect(item)
                setModalCDF(true)
            }, 500);
        })
        .catch(POST_CATCH)
        
    }

    // DEFINE COLUNAS DA TABELA
    const column = [
        { title: 'Data Retirada', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'order_locations.created_at', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center'}}>{item.withdraw_date_format}</Typography>
                    <Typography><center><Tag color={item.status.color} style={{margin: 0}}>{item.status.name}</Tag></center></Typography>
                </Col>
            </Row>
        ) },
        { title: 'Local destino', dataIndex: 'CLIENT_NAME', table: 'order_locations.id', width: 'auto', minWidth: '300px', sorter: true, align: 'left', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography>MTR: n° {item.mtr.id}</Typography>
                    { getProfileType() === 'LEGAL_FINAL_DESTINATION' || getProfileType() === 'FINAL_DESTINATION' || getProfileType() === 'FINAL_DESTINATION_DRIVER' ? <Typography>{item.order_locations.client.name}</Typography> : null }
                    <Typography style={{color: 'var(--color02)'}}>{item.order_locations.provider_street}, {item.order_locations.provider_number} - {item.order_locations.provider_district} - {item.order_locations.provider_city?.name} / {item.order_locations.provider_city?.state.acronym}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Código Caçamba', dataIndex: 'CODE', table: 'stationary_bucket.CODE', width: '200px', sorter: true, align: 'center', render: (item:any) => (
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
                { item.delivery_withdrawl_date ? <Typography><Tag color="green">{item.driver_withdraw?.name} - {item.driver_withdraw?.cnh}</Tag></Typography> : null }
                { item.delivery_withdrawl_date ? <Typography><Tag color="red">{item.vehicle_withdraw?.plate} - {item.vehicle_withdraw?.vehicle_type.name}</Tag></Typography> : null }
            </Row>
        ) },
        { title: 'Ações', dataIndex: null, width: '120px', sorter: false, align: 'center', render: (item: any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                { valid ?
                    verifyConfig([`${permission}.edit`]) && item.mtr.status === 'DELIVERED' ? <Col><Tooltip title="CDF não emitido"><TbFileSearch onClick={() => onProductSelect(item)}  className="actions-button" /></Tooltip></Col> : null 
                : null }
                <Col><Tooltip title="MTR"><IoDocumentAttachOutline size={18} className="actions-button" onClick={() => openPDF(item.mtr.link)}/></Tooltip></Col>
                { getProfileType() === 'LEGAL_SELLER' || getProfileType() === 'SELLER' || getProfileType() === 'SELLER_EMPLOYEE' ?
                    <Col><Tooltip title="Fotos"><TbCamera size={18} className="actions-button" onClick={() => openGallery(item)}/></Tooltip></Col>
                : null }
                <TableTrMapProductButton type={type} permission={permission} item={item} path={path} />
            </Row>
        ) },
    ]

    const onAddItem = () => {
        setCDF([ ...CDF, { residue_id: null, meters: null, residue_tecnology_id: null } ])
    }

    const updateStationary = (item:any) => {

        Modal.confirm({
            title: "Enivar caçamba para manutenção e limpeza?",
            icon: <ExclamationCircleOutlined />,
            cancelText: "Não",
            okText: "Sim",
            onOk() {
                POST_API(`/stationary_bucket`, { status: 'ML' }, item.id)
                .then((rs) => {
                    if (rs.ok) {
                        setAction(!action)
                        Modal.success({ title: "Sucesso", content: 'Caçamba atualizada com sucesso' });
                    } else {
                        Modal.warning({ title: "Algo deu errado", content: 'Não foi possível atualizar caçamba' });
                    }
                })
                .catch(POST_CATCH)
            }
        })

    }

    const openGallery = (item:any) => {
        setGallery([])
        onModalGallery()
        GET_API(`/order_location_product_gallery?orderLocationProductId=${item.id}&status=AR`).then(rs => rs.json()).then((res:any) => {
            setGallery(res.data)
        }).catch(POST_CATCH)
    }

    // CARREGA DADOS
    const load = () => {
        GET_API('/address?default=1').then(rs => rs.json()).then(res => {
            setCoord([ res.data[0].latitude, res.data[0].longitude ])
        }).catch(POST_CATCH)
    }

    const onSend = (values:any) => {

        var valores:any = [];
        Object.keys(mtr).map((v) => {
            valores.push({ id: v, meters: mtr[v] })
        })
        

        try {

            POST_API(`/order_location_product`, {...values, status: 'ADF'}, productSelect.id)
            .then((rs) => {
                if (rs.ok) { } else {
                    Modal.warning({ title: "Algo deu errado", content: 'Não foi possível agendar entrega' });
                }
            })
            .catch(POST_CATCH)
    

            POST_API('/final_mtr', { 
                mtrs: productSelect.id,
                residues: JSON.stringify(valores)
            }).then((rs) => {
                if (!rs.ok) { 
                    Modal.warning({ title: "Algo deu errado", content: 'Não foi possível emitir MTR Final' });
                    return;
                } else {
        
                    form.resetFields()
                    setProductSelect(null)
                    setAction(!action)
                }
            })

        } catch (error) {
            POST_CATCH()
        } finally {
            setLoadingButton(false)
        }

    }

    const onUpdateCDF = (value:any, field:any, index:any) => {

        var temp = CDF;
        temp[index][field] = value
        setCDF(temp)

    }

    const onSendCDFFinaly = () => {
        setModalQRCode(true)
        POST_API('/cdf', { items: JSON.stringify(Object.values(CDF)) }, productSelect.mtr.cdf_id).then((rs) => {
            if (!rs.ok) { 
                Modal.warning({ title: "Algo deu errado", content: 'Não foi possível emitir CDF' });
                return;
            } else {
                POST_API('/order_location_product', { status: 'CDFE'}, productSelect.id)
                setModalCDF(false)
                setAction(!action)
                Modal.success({ title: "Sucesso", content: 'CDF emitido' });
            }
        }).finally(() => setModalQRCode(false))
    }

    useEffect(() => load(), [])
    useEffect(() => onLoadMap(), [product])
    useEffect(() => {
        GET_API(`/me`).then((rs) => {
            if (rs.ok) return rs.json();
            else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
          }).then((res) => {
            setValid(res.data.environmental_license)
          }).catch(POST_CATCH);
    }, [])

    return (
        <PageDefault valid={`${permission}.list`} items={[
            { title: 'Em análise' }
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
                                { getProfileType() === 'LEGAL_FINAL_DESTINATION' || getProfileType() === 'FINAL_DESTINATION' || getProfileType() === 'FINAL_DESTINATION_DRIVER' ? (
                                    <CircleMarker center={[Number(coord[0]), Number(coord[1])]} pathOptions={{ color: 'blue'}} radius={10}>
                                        <Popup> Minha empresa </Popup>
                                    </CircleMarker>
                                ) : null }
                                { product.map((v, i) => (
                                    <CircleMarker key={i} center={[Number(v.order_locations.provider_latitude), Number(v.order_locations.provider_longitude)]} pathOptions={{ color: v.status.color}} radius={10}>
                                        <Popup> <Typography style={{textAlign: 'center', color: v.status.color, fontSize: '1.2em'}}>{v.status.name}</Typography> <br/> {v.order_locations.provider_street}, {v.order_locations.provider_number} - {v.order_locations.provider_district} - {v.order_locations.provider_city?.name} / {v.order_locations.provider_city?.state.acronym} </Popup>
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
                                { getProfileType() === 'LEGAL_FINAL_DESTINATION' || getProfileType() === 'FINAL_DESTINATION' || getProfileType() === 'FINAL_DESTINATION_DRIVER' ? (
                                    <CircleMarker center={[Number(coord[0]), Number(coord[1])]} pathOptions={{ color: 'blue'}} radius={10}>
                                        <Popup> Minha empresa </Popup>
                                    </CircleMarker>
                                ) : null }
                                { product.map((v, i) => (
                                    <CircleMarker key={i} center={[Number(v.order_locations.provider_latitude), Number(v.order_locations.provider_longitude)]} pathOptions={{ color: v.status.color}} radius={10}>
                                        <Popup> <Typography style={{textAlign: 'center', color: v.status.color, fontSize: '1.2em'}}>{v.status.name}</Typography> <br/> {v.order_locations.provider_street}, {v.order_locations.provider_number} - {v.order_locations.provider_district} - {v.order_locations.provider_city?.name} / {v.order_locations.provider_city?.state.acronym} </Popup>
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
                            defaultFilter={{ statusIn: 'ETDF,EA' }}
                            getList={setProduct}
                        />
                    </CardItem>
                </Col>
            </Row>
            <Modal style={{top: 20}} title="Fotos da retirada" open={modalGallery} onCancel={onModalGallery} footer={false}>
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
            <Modal title={`Tratamento resíduos MTR nº${productSelect?.mtr?.id}`} width={'90%'} open={modalCDF} onCancel={() => setModalCDF(false)} destroyOnClose footer={false}>
                <List
                    bordered
                    size="small"
                    header={<Row justify={'end'}><Button type="primary"  onClick={onAddItem}>Adicionar tratamento</Button></Row>}
                    footer={<Row justify={'end'} gutter={[8,8]}><Col><Button onClick={onSendCDFFinaly} type="primary"  loading={modalQRCode}>Salvar e emitir CDF</Button></Col></Row>}
                    locale={{emptyText: 'Nenhum item cadastrado'}}
                    dataSource={CDF}
                    renderItem={(item, index) => (
                        <List.Item key={index}>
                            <Row style={{width: '100%'}} gutter={[8,8]}>
                                <Col xs={8} md={9}>
                                    <Select placeholder="Classe resíduo" style={{width: '100%'}} onChange={(v) => onUpdateCDF(v, 'residue_id', index)}>
                                        { productSelect.mtr.items.map((v:any, i:any) => <Select.Option key={i} value={v.residue_id}>{v.residue.name}</Select.Option>) }
                                    </Select>
                                </Col>
                                <Col xs={16} md={9}>
                                    <SelectSearch placeholder="Tratamento" effect={item.residue_tecnology_id} url="/residue_tecnology" change={(v: any) => onUpdateCDF(v?.value, 'residue_tecnology_id', index)} labelField={['id','name']} />
                                </Col>
                                <Col xs={20} md={4}>
                                    <InputNumber style={{width: '100%'}} placeholder="M³" onChange={(v) => onUpdateCDF(v, 'meters', index)} />
                                </Col>
                                <Col xs={4} md={2}>
                                    <Button block onClick={() => setCDF(CDF.filter((val, inx) => inx !== index))}>X</Button>
                                </Col>
                            </Row>
                        </List.Item>
                    )}
                />
            </Modal>
            <Modal title={'Gerar MTR final e agendar destino final'} width={'90%'} style={{top: 20}} open={modalForm} onCancel={() => setModalForm(false)} destroyOnClose footer={false}>
                <Form form={form} layout="vertical" onFinish={onSend}>
                    <Row gutter={[8,4]}>
                        <Col span={24}>
                            <Divider orientation="left">Dados agendamento</Divider>
                        </Col>
                        <Col xl={3} lg={4} md={6} sm={8} xs={24}>
                            <Form.Item label="Data envio" name="delivery_final_destination" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <Input type="date" min={new Date().toISOString().slice(0, 10)} />
                            </Form.Item>
                        </Col>
                        <Col xl={21} lg={20} md={18} sm={16} xs={24}>
                            <Form.Item label="Destino final" name="destination_id" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <SelectSearch labelField={['name', 'document_number']} placeholder="Nome - Documento" effect={destination} value={form.getFieldValue('destination_id')} url="/final_destination" change={(v:any) => form.setFieldValue('destination_id', v?.value)} />
                            </Form.Item>
                        </Col>
                        <Col xl={5} lg={5} md={5} sm={12} xs={24}>
                            <Form.Item label="Motorista" name="final_destination_driver_id" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <SelectSearch labelField={['name', 'cnh']} placeholder="Nome - CNH" effect={driver} value={form.getFieldValue('final_destination_driver_id')} url="/driver" change={(v:any) => form.setFieldValue('final_destination_driver_id', v?.value)} />
                            </Form.Item>
                        </Col>
                        <Col xl={5} lg={5} md={5} sm={12} xs={24}>
                            <Form.Item label="Veiculo" name="final_destination_vehicle_id" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <SelectSearch labelField={['plate', 'vehicle_type.name']} placeholder="Placa - Tipo" effect={vehicle} value={form.getFieldValue('final_destination_vehicle_id')} url="/vehicle" change={(v:any) => form.setFieldValue('final_destination_vehicle_id', v?.value)} />
                            </Form.Item>
                        </Col>
                        <Col xl={5} lg={5} md={5} sm={12} xs={24}>
                            <Form.Item label="Modelo de caçamba" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <SelectSearch labelField={['name', 'm3']} placeholder="Nome - M³" effect={model} value={modelValue} url="/stationary_bucket_type" change={(v:any) => setModelValue(v?.value)} />
                            </Form.Item>
                        </Col>
                        <Col xl={5} lg={5} md={5} sm={12} xs={24}>
                            <Form.Item label="Caçamba" name="final_stationary_bucket_id" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <SelectSearch labelField={['code', 'status.name']} placeholder="Código - Situação" effect={{ filters: {status: 'D', type: modelValue} }} value={form.getFieldValue('final_stationary_bucket_id')} url="/stationary_bucket" filter={`&status=D&type=${modelValue}`} change={(v:any) => form.setFieldValue('final_stationary_bucket_id', v?.value)} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Divider orientation="left">Dados MTR</Divider>
                        </Col>
                        { residue.map((v1:any, i1:any) => (
                            <Col xs={24} sm={12} md={8}>
                                <InputNumber onChange={(v) => setmtr({ ...mtr, [v1.residue_id]: v })} addonBefore={<Typography style={{width: 100}}>{v1.residue.name}</Typography>} style={{width: '100%'}} addonAfter="m³" />
                            </Col>
                        )) }
                        <Col span={24}>
                            <Button style={{float: 'right'}} type="primary" htmlType="submit" loading={loadingButton}>Gerar</Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            <MapFullScreen startStatus={['ETDF','EA']} open={open} setOpen={setOpen} />
        </PageDefault>
    )

}

export default OrdemLocacaoEmAnalise;