// react libraries
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Col, Form, Input, Modal, Radio, Row, Upload, message } from "antd";
import { fromAddress } from "react-geocode";

import { TableReturnButton } from "../../../../components/Table/buttons";
// components
import PageDefault from "../../../../components/PageDefault";
import CardItem from "../../../../components/CardItem";
import LoadItem from "../../../../components/LoadItem";
import SelectSearch from "../../../../components/SelectSearch";
import { InputMaskCorrect } from "../../../../components/InputMask";

// services
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, cleanData, getUPLOADAPI } from "../../../../services";

const FinalDestinationForm = ({ type, path, permission }: PageDefaultProps) => {
  
    // router
    const navigate = useNavigate();

    // params
    const { ID } = useParams();

    // states
    const [load, setLoad] = useState<boolean>(true);
    const [loadButton, setLoadButton] = useState<boolean>(false);
    const [loadCEP, setLoadCEP] = useState<boolean>(false);
    const [city, setCity] = useState<any>(null);
    const [doc, setDoc] = useState<string>('cpf');
    const [ cityName, setCityName ] = useState<string>('');
    const [ stateAcronym, setStateAcronym ] = useState<string>('');

    // form
    const [form] = Form.useForm();

    // function save
    const onSend = (values: any) => {

        setLoadButton(true);
        const address = `${values?.street}, ${values?.number} - ${values?.district} - ${cityName} / ${stateAcronym}`

        fromAddress(address).then(({ results }) => {

            const { lat, lng } = results[0].geometry.location;

            values.latitude = lat
            values.longitude = lng

            if (values.environmental_license?.file?.response?.url) values.environmental_license = values.environmental_license.file.response.url

            POST_API(`/user`, {...values, profile_type: doc === 'cpf' ? 'final_destination' : 'legal_final_destination'}, ID).then((rs) => {
                if (rs.ok) return rs.json();
                else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
            }).then((data) => {
                message.success("Salvo com sucesso!");
                navigate("..");
            }).catch(POST_CATCH).finally(() => setLoadButton(false));

        }).catch( () => Modal.warning({ title: 'Algo deu errado', content: 'Não foi possível encontrar endereço', onOk: () => setLoadButton(false) }));
    
    };

    // load address
    const onCEP = () => {
        var zipCode = form.getFieldValue("zip_code")
        if (zipCode !== undefined && zipCode.length === 9) {
            setLoadCEP(true);
            GET_API(`/cep/${form.getFieldValue("zip_code")}`).then((rs) => {
                if (rs.ok) return rs.json();
                else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
            }).then((res) => {
                form.setFieldValue("street", res.logradouro);
                form.setFieldValue("district", res.bairro);
                setStateAcronym(res.uf)
                setCityName(res.localidade)
                setCity({ search: res.localidade, filters: { uf: res.uf } });
            }).catch(POST_CATCH).finally(() => setLoadCEP(false));
        }
    };

    // valid params
    useEffect(() => {
        if (type === "add") {
            setLoad(false);
        } else {
            setLoad(true);
            GET_API(`/user/${ID}`).then((rs) => {
                if (rs.ok) return rs.json();
                else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
            }).then((res) => {
                setDoc(res.data.document_type);
                form.setFieldsValue(cleanData(res.data));
                if (res.data.address?.zip_code) {
                    form.setFieldValue('zip_code', res.data.address.zip_code)
                    form.setFieldValue('street', res.data.address.street)
                    form.setFieldValue('number', res.data.address.number)
                    form.setFieldValue('complement', res.data.address.complement)
                    form.setFieldValue('district', res.data.address.district)
                    setCity({ ID: res.data.address.city.id });
                    setStateAcronym(res.data.address.city.state.acronym)
                    setCityName(res.data.address.city.name)
                }
            }).catch(POST_CATCH).finally(() => setLoad(false));
        }
    }, [type, path, form, ID]);

  return (
    <PageDefault valid={`${permission}.${type}`} items={[
        { title: <Link to={type === "list" ? "#" : ".."}>Destino final</Link> },
        { title: type === "add" ? "Novo" : "Editar" },
    ]} options={
        <Row justify={"end"} gutter={[8, 8]}>
          <TableReturnButton type={type} permission={permission} />
        </Row>
    }>
        <Row gutter={[16, 16]}>
            <Col md={24} xs={24}>
                { load ? (
                    <LoadItem />
                ) : (
                    <CardItem>
                        <Form layout="vertical" form={form} onFinish={onSend}>
                            <Row gutter={[8, 8]}>
                                <Col xs={24} md={4}>
                                    <Form.Item name="document_type" label="Tipo Pessoa" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                                        <Radio.Group onChange={(e) => setDoc(e.target.value)} disabled={type === "edit"}>
                                            <Radio value={'cpf'}>Física</Radio>
                                            <Radio value={'cnpj'}>Jurídica</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={4}>
                                    <Form.Item name="document_number" label="Login" rules={[ { required: true, message: "Campo obrigatório!" } ]}>
                                        <InputMaskCorrect disabled={type === "edit"} maskChar={''} autoComplete="off"  mask={ doc === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99' }>
                                            { () => <Input disabled={type === "edit"} maxLength={ doc === 'cpf' ? 14 : 18 } placeholder={ doc === 'cpf' ? 'CPF' : 'CNPJ' } /> }
                                        </InputMaskCorrect>
                                    </Form.Item>
                                </Col>
                                { doc === 'cnpj' ? (
                                    <>
                                        <Col xs={24} md={8}>
                                            <Form.Item name="name" label="Razão Social" rules={[ { required: true, message: "Campo obrigatório!" } ]} >
                                                <Input placeholder="Razão Social" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Form.Item name="fantasy_name" label="Nome Fantasia">
                                                <Input placeholder="Nome Fantasia" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={4}>
                                            <Form.Item name="state_registration" label="Inscrição Estadual">
                                                <Input placeholder="Inscrição Estadual" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={4}>
                                            <Form.Item name="municipal_registration" label="Inscrição Municipal">
                                                <Input placeholder="Inscrição Municipal" />
                                            </Form.Item>
                                        </Col>
                                    </>
                                ) : (
                                    <Col xs={24} md={16}>
                                        <Form.Item name="name" label="Nome" rules={[ { required: true, message: "Campo obrigatório!" } ]}>
                                            <Input placeholder="Nome" />
                                        </Form.Item>
                                    </Col>
                                )}
                                <Col xs={24} md={ doc === 'cnpj' ? 5 : 7}>
                                    <Form.Item name="email" label="E-mail Principal" rules={[ { required: true, message: "Campo obrigatório!" } ]}>
                                        <Input placeholder="E-mail Principal" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={ doc === 'cnpj' ? 5 : 7}>
                                    <Form.Item name="secondary_email" label="E-mail Secundário">
                                        <Input placeholder="E-mail Secundário" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={ doc === 'cnpj' ? 3 : 5}>
                                    <Form.Item name="secondary_phone" label="Celular" rules={[ { required: true, message: "Campo obrigatório!" } ]} >
                                        <InputMaskCorrect maskChar={''} autoComplete="off"  mask={"(99) 99999-9999"}>
                                            { () => <Input maxLength={15}  placeholder="Celular"/> }
                                        </InputMaskCorrect>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={ doc === 'cnpj' ? 3 : 5}>
                                    <Form.Item name="phone" label="Telefone">
                                        <InputMaskCorrect maskChar={''} autoComplete="off"  mask={"(99) 9999-9999"}>
                                            { () => <Input maxLength={15} placeholder="Telefone" /> }
                                        </InputMaskCorrect>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={3}>
                                    <Form.Item name="zip_code" label="CEP" rules={[ { required: true, message: "Campo obrigatório!" } ]}>
                                        <InputMaskCorrect onBlur={onCEP} maskChar={''} autoComplete="off"  mask={"99999-999"}>
                                            { () => <Input maxLength={9} placeholder="CEP" /> }
                                        </InputMaskCorrect>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={21}>
                                    <Form.Item name="street" label="Logradouro" rules={[ { required: true, message: "Campo obrigatório!" } ]}>
                                        <Input placeholder="Logradouro" disabled={loadCEP} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={3}>
                                    <Form.Item name="number" label="Número" rules={[ { required: true, message: "Campo obrigatório!" } ]}>
                                        <Input placeholder="Número" disabled={loadCEP} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={9}>
                                    <Form.Item name="complement" label="Complemento">
                                        <Input placeholder="Complemento" disabled={loadCEP} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name="district" label="Bairro" rules={[ { required: true, message: "Campo obrigatório!" } ]}>
                                        <Input placeholder="Bairro" disabled={loadCEP} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name="city_id" label="Cidade - Estado" rules={[ { required: true, message: "Campo obrigatório!" } ]}>
                                        <SelectSearch
                                            effect={city}
                                            placeholder="Cidade"
                                            disabled={loadCEP}
                                            url="/city"
                                            value={form.getFieldValue("city_id")}
                                            change={(v: any) => form.setFieldValue("city_id", v.value)}
                                            labelField={["name", "state.acronym"]}
                                        />
                                    </Form.Item>
                                </Col>
                                {doc === 'cnpj' ? (
                                    <>
                                        <Col xs={24} md={8}>
                                            <Form.Item name="responsible_name" label="Responsável - Nome">
                                                <Input placeholder="Responsável - Nome" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={4}>
                                            <Form.Item name="responsible_document" label="Responsável - CPF">
                                                <InputMaskCorrect maskChar={''} autoComplete="off"  mask={'999.999.999-99'}>
                                                    { () => <Input maxLength={14} placeholder={'Responsável - CPF'} /> }
                                                </InputMaskCorrect>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={6}>
                                            <Form.Item name="responsible_office" label="Responsável - Cargo" >
                                                <Input placeholder="Responsável - Cargo" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={6}>
                                            <Form.Item name="responsible_departament" label="Responsável - Departamento" >
                                                <Input placeholder="Responsável - Departamento" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={7}>
                                            <Form.Item name="responsible_email" label="Responsável - E-mail Principal" >
                                                <Input placeholder="Responsável - E-mail Principal" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={7}>
                                            <Form.Item name="responsible_secondary_email" label="Responsável - E-mail Secundário" >
                                                <Input placeholder="Responsável - E-mail Secundário" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={5}>
                                            <Form.Item name="responsible_phone" label="Responsável - Telefone" >
                                                <InputMaskCorrect maskChar={''} autoComplete="off"  mask={"(99) 9999-9999"}>
                                                    { () => <Input maxLength={14} placeholder="Responsável - Telefone" /> }
                                                </InputMaskCorrect>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={5}>
                                            <Form.Item name="responsible_secondary_phone" label="Responsável - Celular" >
                                                <InputMaskCorrect maskChar={''} autoComplete="off"  mask={"(99) 99999-9999"}>
                                                    { () => <Input maxLength={15} placeholder="Responsável - Celular" /> }
                                                </InputMaskCorrect>
                                            </Form.Item>
                                        </Col>
                                    </>
                                ) : null}
                                <Col xs={24} md={20}>
                                    <Form.Item name="environmental_license" label="Licença ambiental" rules={[ { required: type === 'add', message: "Campo obrigatório!" } ]}>
                                        <Upload
                                            maxCount={1}
                                            showUploadList={true}
                                            accept="application/pdf"
                                            action={getUPLOADAPI}
                                        >
                                            <Button type="default" block className="btn-default" shape="default">Anexar nova licença</Button> 
                                        </Upload>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={4}>
                                    <Form.Item name="environmental_license_expiration" label="Validade" rules={[ { required: true, message: "Campo obrigatório!" } ]}>
                                        <Input type="date" placeholder="Validade" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Button  htmlType="submit" type="primary" style={{ float: "right", marginLeft: 6 }} loading={loadButton} >Salvar </Button>
                                    <Link to={".."}>
                                        <Button  type="default" style={{ float: "right" }}>Cancelar</Button>
                                    </Link>
                                </Col>
                            </Row>
                        </Form>
                    </CardItem>
                )}
            </Col>
        </Row>
    </PageDefault>
  );
};

export default FinalDestinationForm;
