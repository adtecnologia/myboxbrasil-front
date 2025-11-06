// BIBLIOTECAS REACT
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button, Col, Form, Input, Modal, Row, message } from "antd"

// SERVIÇOS
import { MaskCEP, POST_API, POST_CATCH, PageDefaultProps, getToken } from "../../../../../services"

// COMPONENTES
import CardItem from "../../../../../components/CardItem"
import LoadItem from "../../../../../components/LoadItem"
import PageDefault from "../../../../../components/PageDefault"
import SelectSearch from "../../../../../components/SelectSearch"
import { TableReturnButton } from "../../../../../components/Table/buttons"
import { fromAddress } from "react-geocode"

const DestinoFinalForm = ( { type, path, permission } : PageDefaultProps ) => {

    // RESPONSAVEL PELA ROTA
    const navigate = useNavigate()
    
    // PARAMETROS 
    const { ID } = useParams()

    // ESTADOS DO COMPONENTE
    const [ load, setLoad ] = useState(true)
    const [ doc, setDoc ] = useState(false)
    const [ loadButton, setLoadButton ] = useState(false)
    const [ loadCEP, setLoadCEP ] = useState(false)
    const [ city, setCity ] = useState<any>(null);
    const [ cityName, setCityName ] = useState<any>('');
    const [ state, setState ] = useState<any>(null);
    const [ stateAcronym, setStateAcronym ] = useState<any>('');

    // CAMPOS FORMULARIO
    const [form] = Form.useForm()

    // VERIFICA "NOVO" OU "EDITAR"
    useEffect(() => {
        if (type === 'add') { setLoad(false) } else {
            setLoad(true)
            POST_API(`/${path}/search.php`, { token: getToken(), filter: JSON.stringify({ ID: ID }), type }).then(rs => rs.json()).then(res => {
                if (res.return) {
                    form.setFieldsValue(res.data[0])
                    setState({ID: res.data[0].STATE_ID})
                    setCity({ID: res.data[0].CITY_ID})
                    setStateAcronym(res.data[0].STATE_ACRONYM)
                    setCityName(res.data[0].CITY_NAME)
                } else { Modal.warning({ title: 'Algo deu errado', content: res.msg }) }
            }).catch(POST_CATCH).finally( () => setLoad(false))
        }
    }, [type, path, form, ID]);

    // FUNÇÃO SALVAR
    const onSend = (values: any) => {

        const address = `${values?.STREET}, ${values?.NUMB} - ${values?.DISTRICT} - ${cityName} / ${stateAcronym}`
        setLoadButton(true)
        fromAddress(address).then(({ results }) => {
            const { lat, lng } = results[0].geometry.location;
            values.ID = ID
            values.LATITUDE = lat
            values.LONGITUDE = lng
            POST_API(`/${path}/save.php`, { token: getToken(), master: JSON.stringify(values) }).then(rs => rs.json()).then(res => {
                if (res.return) {
                    message.success(res.msg)
                    navigate('..')
                } else { Modal.warning({ title: 'Algo deu errado', content: res.msg }) }
            }).catch(POST_CATCH).finally( () => setLoadButton(false) )
        }).catch( () => Modal.warning({ title: 'Algo deu errado', content: 'Não foi possível encontrar endereço' }));
        
    }

    // FUNÇÃO BUSCAR CEP
    const onCEP = () => {
        setLoadCEP(true)
        POST_API('/cep/search.php', { token: getToken(), master: JSON.stringify({CEP: form.getFieldValue('CEP')}) }).then(rs => rs.json()).then(res => {
            if (res.return) {
                form.setFieldValue('STREET', res.data.nome_logradouro)
                form.setFieldValue('DISTRICT', res.data.bairro)
                setStateAcronym(res.data.uf)
                setCityName(res.data.nome_localidade)
                setState({ACRONYM: res.data.uf})
                setCity({search: res.data.nome_localidade+' - '+res.data.uf})
            } else {
                Modal.warning({ title: 'Algo deu errado', content: res.msg })
            }
        }).catch(POST_CATCH).finally( () => setLoadCEP(false) )
    }

    useEffect(() => {
        form.resetFields()
    }, [doc])
    
    return (
        <PageDefault valid={`${permission}.${type}`} items={[
            { title: <Link to={ type === 'list' ? '#' : '..' }>Destino Final</Link> },
            { title: type === 'add' ? 'Novo' : 'Editar' },
        ]} options={
            <Row justify={'end'} gutter={[8,8]}>
                <TableReturnButton type={type} permission={permission} />
            </Row>
        }>
            <Row gutter={[16,16]}>
                <Col md={24} xs={24}>
                    { load ? <LoadItem /> :
                        <CardItem>
                            <Form layout="vertical" form={form} onFinish={onSend}>
                                <Row gutter={[8,8]}>
                                    <Col xs={24} md={24}>
                                        <Form.Item name="NAME" label="Nome" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                            <Input placeholder="Nome" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={3}>
                                        <Form.Item name="CEP" label="CEP" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                            <Input placeholder="CEP" onKeyPress={MaskCEP} maxLength={9} onBlur={onCEP}  />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={21}>
                                        <Form.Item name="STREET" label="Logradouro" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                            <Input placeholder="Logradouro" disabled={loadCEP} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={4}>
                                        <Form.Item name="NUMB" label="Número">
                                            <Input placeholder="Número" disabled={loadCEP} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={10}>
                                        <Form.Item name="DISTRICT" label="Bairro" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                            <Input placeholder="Bairro" disabled={loadCEP} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={7}>
                                        <Form.Item name="CITY_ID" label="Cidade" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                            <SelectSearch effect={city} placeholder="Cidade" disabled={loadCEP} url="/city/select.php" value={form.getFieldValue('CITY_ID')} change={(v:any) => form.setFieldValue('CITY_ID', v.value)}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={3}>
                                        <Form.Item name="STATE_ID" label="Estado" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                            <SelectSearch effect={state} placeholder="Estado" disabled={loadCEP} url="/state/select.php" value={form.getFieldValue('STATE_ID')} change={(v:any) => form.setFieldValue('STATE_ID', v.value)}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Button shape="round" htmlType="submit" type="primary" style={{float: 'right', marginLeft: 6}} loading={loadButton}>Salvar</Button>
                                        <Link to={'..'}><Button shape="round" type="default" style={{float: 'right'}}>Cancelar</Button></Link>
                                    </Col>
                                </Row>
                            </Form>
                        </CardItem>
                    }
                </Col>
            </Row>
        </PageDefault>
    )

}

export default DestinoFinalForm;