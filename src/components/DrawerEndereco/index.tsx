// BIBLIOTECAS REACT
import { Button, Card, Col, Drawer, Form, Input, Modal, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { fromAddress } from "react-geocode";

// ICONES
import { IoSearch } from "react-icons/io5";

// CSS
import './style.css';

// SERVIÇOS
import { GET_API, POST_API, POST_CATCH } from "../../services";

// COMPONENTES
import SelectSearch from "../SelectSearch";
import LoadItem from "../LoadItem";
import { InputMaskCorrect } from "../InputMask";

// INTERFACE
interface DrawerEnderecoInterface {
    open: boolean,
    close: any,
    address: any,
    setAddress: any,
    disabledClose?: boolean,
    provider?: number
}

const DrawerEndereco = ( { open, close, address, setAddress, disabledClose = false, provider = 0 } : DrawerEnderecoInterface ) => {

    // ESTADOS DO COMPONENTE
    const [ newAddress, setNewAddress ] = useState<boolean>(false)
    const [ addressList, setAddressList ] = useState<any[]>([])
    const [ loadCEP, setLoadCEP ] = useState<any>(false)
    const [ loadButton, setLoadButton ] = useState<any>(true)
    const [ city, setCity ] = useState<any>(null);
    const [ search, setSearch ] = useState<string>('')
    const [ cityName, setCityName ] = useState<any>('');
    const [ stateAcronym, setStateAcronym ] = useState<any>('');

    const onNewAddress = () => setNewAddress(!newAddress)

    // FUNÇÃO BUSCAR CEP
    const onCEP = () => {
        setLoadCEP(true)
        GET_API('/cep/'+form.getFieldValue('zip_code'))
        .then((rs) => {
            if (!rs.ok) {
              Modal.warning({ title: "Algo deu errado", content: rs.statusText });
            }
            return rs.json();
        }).then((res) => {
            console.log(res)
            form.setFieldValue('street', res.logradouro)
            form.setFieldValue('district', res.bairro)
            setStateAcronym(res.uf)
            setCityName(res.localidade)
            setCity({ search: '', filters: { uf: res.uf, city: res.localidade} });
        }).catch(POST_CATCH).finally( () => setLoadCEP(false) )
    }
    
    // FUNÇÃO SALVAR
    const onSend = (values: any) => {

        const address = `${values?.street}, ${values?.number} - ${values?.district} - ${cityName} / ${stateAcronym}`
        setLoadButton(true)
        fromAddress(address).then(({ results }) => {

            const { lat, lng } = results[0].geometry.location;

            values.latitude = lat
            values.longitude = lng
            
            POST_API(`/address`, values)
            .then((rs) => {
                if (rs.ok) {
                    return rs.json();
                } else {
                    Modal.warning({ title: "Algo deu errado", content: rs.statusText });
                }
            })
            .then(() => {
                setNewAddress(false)
                onSearch()
            })
            .catch(POST_CATCH)
            .finally(() => setLoadButton(false));

        }).catch( () => Modal.warning({ title: 'Algo deu errado', content: 'Não foi possível encontrar endereço' }));
        
    }
    
    // FUNÇÃO PESQUISAR
    const onSearch = () => {
        setLoadButton(true)

        GET_API(`/address?search=${search}&provider=${provider}`)
        .then((rs) => {
          if (!rs.ok) {
            Modal.warning({ title: "Algo deu errado", content: rs.statusText });
          }
          return rs.json();
        })
        .then((res) => {
            setAddressList(res.data)
        }).catch(POST_CATCH).finally( () => setLoadButton(false) )

    }

    const [ form ] = Form.useForm()

    useEffect(() => {
        if (open) onSearch()
    }, [search, open])

    useEffect(() => {
        close()
    }, [address])

    return (
        <Drawer open={open} onClose={disabledClose ? () => {} : close} title="Selecionar endereço">
            { newAddress ? (
                <Form layout='vertical' form={form} onFinish={onSend}>
                    <Row gutter={[8,0]}>
                        <Col span={24}>
                            <Form.Item name="name" label="Salvar endereço como" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <Input placeholder="Nome"  />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="zip_code"
                                label="CEP"
                                rules={[
                                    { required: true, message: "Campo obrigatório!" },
                                ]}
                            >
                                <InputMaskCorrect onBlur={onCEP} maskChar={''} autoComplete="off"  mask={"99999-999"}>
                                    { () => <Input maxLength={9} placeholder="CEP" /> }
                                </InputMaskCorrect>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="street" label="Logradouro" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <Input placeholder="Logradouro" disabled={loadCEP} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="number" label="Número">
                                <Input placeholder="Número" disabled={loadCEP} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="complement" label="Complemento">
                                <Input placeholder="Complemento" disabled={loadCEP} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="district" label="Bairro" rules={[{required: true, message: 'Campo obrigatório!'}]}>
                                <Input placeholder="Bairro" disabled={loadCEP} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24}>
                            <Form.Item
                                name="city_id"
                                label="Cidade - Estado"
                                rules={[
                                    { required: true, message: "Campo obrigatório!" },
                                ]}
                            >
                                <SelectSearch
                                    effect={city}
                                    placeholder="Cidade"
                                    disabled={loadCEP}
                                    url="/city"
                                    value={form.getFieldValue("city_id")}
                                    change={(v: any) =>
                                    form.setFieldValue("city_id", v.value)
                                    }
                                    labelField={["name", "state.acronym"]}
                                />
                                </Form.Item>
                            </Col>
                        <Col span={12}>
                            <Button onClick={onNewAddress} block type='default'>Cancelar</Button>
                        </Col>
                        <Col span={12}>
                            <Button block type='primary' loading={loadButton} htmlType='submit'>Salvar</Button>
                        </Col>
                    </Row>
                </Form>
            ) : (
                <Row gutter={[8,16]}>
                    <Col span={24}>
                        <Input prefix={<IoSearch color="var(--color02)" />} size="large" placeholder="Buscar em endereço" value={search} onChange={(v) => setSearch(v.target.value)} />
                    </Col>
                    { loadButton ? <Col span={24}><LoadItem type='alt' /></Col> : addressList.length > 0 ? addressList.map((v, i) => (
                        <Col span={24} key={i}>
                            <Card size='small' hoverable onClick={() => setAddress(v)}>
                                <Typography className='ad-title'>{v.name}</Typography>
                                <Typography>{v.street}, {v.number} - {v.district} - {v.city.name} / {v.city.state.acronym}</Typography>
                            </Card>
                        </Col>
                    )) : <Col span={24}><Typography>Não há mais endereços</Typography></Col> }
                    <Col span={24}>
                        <Button onClick={onNewAddress} block type='primary'>Novo endereço</Button>
                    </Col>
                </Row>
            ) }
        </Drawer>
    )

}

export default DrawerEndereco;