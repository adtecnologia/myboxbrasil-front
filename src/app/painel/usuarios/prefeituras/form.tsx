// react libraries

import { Button, Col, Form, Input, Modal, message, Radio, Row } from 'antd';
import { useEffect, useState } from 'react';
import { fromAddress } from 'react-geocode';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CardItem from '../../../../components/CardItem';
import { InputMaskCorrect } from '../../../../components/InputMask';
import LoadItem from '../../../../components/LoadItem';
// components
import PageDefault from '../../../../components/PageDefault';
import SelectSearch from '../../../../components/SelectSearch';
import { TableReturnButton } from '../../../../components/Table/buttons';
// services
import {
  cleanData,
  GET_API,
  getProfileType,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from '../../../../services';

const CityhallForm = ({ type, path, permission }: PageDefaultProps) => {
  // router
  const navigate = useNavigate();

  // params
  const { ID, USER } = useParams();

  // states
  const [load, setLoad] = useState<boolean>(true);
  const [doc, setDoc] = useState('cnpj');
  const [loadButton, setLoadButton] = useState<boolean>(false);
  const [per, setPer] = useState<string[]>([]);

  // form
  const [form] = Form.useForm();
  const [loadCEP, setLoadCEP] = useState<boolean>(false);
  const [cityName, setCityName] = useState<string>('');
  const [stateAcronym, setStateAcronym] = useState<string>('');

  // load address
  const onCEP = () => {
    setLoadCEP(true);
    GET_API(`/cep/${form.getFieldValue('zip_code')}`)
      .then((rs) => {
        if (rs.ok) return rs.json();
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        form.setFieldValue('street', res.logradouro);
        form.setFieldValue('district', res.bairro);
      })
      .catch(POST_CATCH)
      .finally(() => setLoadCEP(false));
  };

  // valid params
  useEffect(() => {
    GET_API(`/city/${ID}`)
      .then((rs) => rs.json())
      .then((response) => {
        form.setFieldValue('city_id', ID);
        form.setFieldValue(
          'city_name',
          `${response.data.name} / ${response.data.state.acronym}`
        );
        setStateAcronym(response.data.state.acronym);
        setCityName(response.data.name);
      });

    if (type === 'add') {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/user/${USER}`)
        .then((rs) => {
          if (rs.ok) return rs.json();
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        })
        .then((res) => {
          form.setFieldsValue(cleanData(res.data));

          form.setFieldValue('zip_code', res.data.address.zip_code);
          form.setFieldValue('street', res.data.address.street);
          form.setFieldValue('number', res.data.address.number);
          form.setFieldValue('complement', res.data.address.complement);
          form.setFieldValue('district', res.data.address.district);

          setPer(res.data.permissions);
          setDoc(res.data.document_type);
        })
        .catch(POST_CATCH)
        .finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // function save
  const onSend = (values: any) => {
    // console.log(values)
    // return

    setLoadButton(true);

    const address = `${values?.street}, ${values?.number} - ${values?.district} - ${cityName} / ${stateAcronym}`;

    fromAddress(address)
      .then(({ results }) => {
        const { lat, lng } = results[0].geometry.location;

        values.latitude = lat;
        values.longitude = lng;

        POST_API('/cityhall', { ...values, city_hall: ID }, USER)
          .then((rs) => {
            if (rs.ok) {
              message.success('Salvo com sucesso!');
              navigate('..');
            } else
              Modal.warning({
                title: 'Algo deu errado',
                content: rs.statusText,
              });
          })
          .catch(POST_CATCH)
          .finally(() => setLoadButton(false));
      })
      .catch(() =>
        Modal.warning({
          title: 'Algo deu errado',
          content: 'Não foi possível encontrar endereço',
        })
      );
  };

  return (
    <PageDefault
      items={[
        { title: <Link to={type === 'list' ? '#' : '..'}>Prefeitura</Link> },
        { title: type === 'add' ? 'Liberar acesso' : 'Editar' },
      ]}
      options={
        <Row gutter={[8, 8]} justify={'end'}>
          <TableReturnButton permission={permission} type={type} />
        </Row>
      }
      valid={`${permission}.${type}`}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          {load ? (
            <LoadItem />
          ) : (
            <CardItem>
              <Form form={form} layout="vertical" onFinish={onSend}>
                <Row gutter={[8, 8]}>
                  <Col md={4} xs={24}>
                    <Form.Item
                      label="Login"
                      name="document_number"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <InputMaskCorrect
                        autoComplete="off"
                        disabled={type === 'edit'}
                        mask={
                          doc === 'cpf'
                            ? '999.999.999-99'
                            : '99.999.999/9999-99'
                        }
                        maskChar={''}
                      >
                        {() => (
                          <Input
                            disabled={type === 'edit'}
                            maxLength={doc === 'cpf' ? 14 : 18}
                            placeholder={doc === 'cpf' ? 'CPF' : 'CNPJ'}
                          />
                        )}
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  {doc === 'cnpj' ? (
                    <>
                      <Col md={8} xs={24}>
                        <Form.Item
                          label="Razão Social"
                          name="name"
                          rules={[
                            { required: true, message: 'Campo obrigatório!' },
                          ]}
                        >
                          <Input placeholder="Razão Social" />
                        </Form.Item>
                      </Col>
                      <Col md={8} xs={24}>
                        <Form.Item label="Nome Fantasia" name="fantasy_name">
                          <Input placeholder="Nome Fantasia" />
                        </Form.Item>
                      </Col>
                      <Col md={4} xs={24}>
                        <Form.Item
                          label="Inscrição Estadual"
                          name="state_registration"
                        >
                          <Input placeholder="Inscrição Estadual" />
                        </Form.Item>
                      </Col>
                      <Col md={4} xs={24}>
                        <Form.Item
                          label="Inscrição Municipal"
                          name="municipal_registration"
                        >
                          <Input placeholder="Inscrição Municipal" />
                        </Form.Item>
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col md={11} xs={24}>
                        <Form.Item
                          label="Nome"
                          name="name"
                          rules={[
                            { required: true, message: 'Campo obrigatório!' },
                          ]}
                        >
                          <Input placeholder="Nome" />
                        </Form.Item>
                      </Col>
                      <Col md={3} xs={24}>
                        <Form.Item label="CNH" name="cnh">
                          <Input placeholder="CNH" />
                        </Form.Item>
                      </Col>
                      <Col md={3} xs={24}>
                        <Form.Item
                          label="Vencimento CNH"
                          name="cnh_expiration_date"
                        >
                          <Input placeholder="Vencimento CNH" type="date" />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                  <Col md={doc === 'cnpj' ? 6 : 7} xs={24}>
                    <Form.Item
                      label="E-mail Principal"
                      name="email"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input placeholder="E-mail Principal" />
                    </Form.Item>
                  </Col>
                  <Col md={doc === 'cnpj' ? 6 : 7} xs={24}>
                    <Form.Item label="E-mail Secundário" name="secondary_email">
                      <Input placeholder="E-mail Secundário" />
                    </Form.Item>
                  </Col>
                  <Col md={doc === 'cnpj' ? 4 : 5} xs={24}>
                    <Form.Item
                      label="Celular"
                      name="secondary_phone"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <InputMaskCorrect
                        autoComplete="off"
                        mask={'(99) 99999-9999'}
                        maskChar={''}
                      >
                        {() => <Input maxLength={15} placeholder="Celular" />}
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col md={doc === 'cnpj' ? 4 : 5} xs={24}>
                    <Form.Item label="Telefone" name="phone">
                      <InputMaskCorrect
                        autoComplete="off"
                        mask={'(99) 9999-9999'}
                        maskChar={''}
                      >
                        {() => <Input maxLength={15} placeholder="Telefone" />}
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={24}>
                    <Form.Item
                      label="CEP"
                      name="zip_code"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <InputMaskCorrect
                        autoComplete="off"
                        mask={'99999-999'}
                        maskChar={''}
                        onBlur={onCEP}
                      >
                        {() => <Input maxLength={9} placeholder="CEP" />}
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col md={21} xs={24}>
                    <Form.Item
                      label="Logradouro"
                      name="street"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input disabled={loadCEP} placeholder="Logradouro" />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={24}>
                    <Form.Item
                      label="Número"
                      name="number"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input disabled={loadCEP} placeholder="Número" />
                    </Form.Item>
                  </Col>
                  <Col md={9} xs={24}>
                    <Form.Item label="Complemento" name="complement">
                      <Input disabled={loadCEP} placeholder="Complemento" />
                    </Form.Item>
                  </Col>
                  <Col md={6} xs={24}>
                    <Form.Item
                      label="Bairro"
                      name="district"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input disabled={loadCEP} placeholder="Bairro" />
                    </Form.Item>
                  </Col>
                  <Col md={6} xs={24}>
                    <Form.Item
                      label="Cidade - Estado"
                      name="city_name"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input disabled={true} placeholder="Cidade - Estado" />
                    </Form.Item>
                    <Form.Item
                      hidden
                      name="city_id"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  {doc === 'cnpj' ? (
                    <>
                      <Col md={8} xs={24}>
                        <Form.Item
                          label="Responsável - Nome"
                          name="responsible_name"
                        >
                          <Input placeholder="Responsável - Nome" />
                        </Form.Item>
                      </Col>
                      <Col md={4} xs={24}>
                        <Form.Item
                          label="Responsável - CPF"
                          name="responsible_document"
                        >
                          <InputMaskCorrect
                            autoComplete="off"
                            mask={'999.999.999-99'}
                            maskChar={''}
                          >
                            {() => (
                              <Input
                                maxLength={14}
                                placeholder={'Responsável - CPF'}
                              />
                            )}
                          </InputMaskCorrect>
                        </Form.Item>
                      </Col>
                      <Col md={6} xs={24}>
                        <Form.Item
                          label="Responsável - Cargo"
                          name="responsible_office"
                        >
                          <Input placeholder="Responsável - Cargo" />
                        </Form.Item>
                      </Col>
                      <Col md={6} xs={24}>
                        <Form.Item
                          label="Responsável - Departamento"
                          name="responsible_departament"
                        >
                          <Input placeholder="Responsável - Departamento" />
                        </Form.Item>
                      </Col>
                      <Col md={7} xs={24}>
                        <Form.Item
                          label="Responsável - E-mail Principal"
                          name="responsible_email"
                        >
                          <Input placeholder="Responsável - E-mail Principal" />
                        </Form.Item>
                      </Col>
                      <Col md={7} xs={24}>
                        <Form.Item
                          label="Responsável - E-mail Secundário"
                          name="responsible_secondary_email"
                        >
                          <Input placeholder="Responsável - E-mail Secundário" />
                        </Form.Item>
                      </Col>
                      <Col md={5} xs={24}>
                        <Form.Item
                          label="Responsável - Telefone"
                          name="responsible_phone"
                        >
                          <InputMaskCorrect
                            autoComplete="off"
                            mask={'(99) 9999-9999'}
                            maskChar={''}
                          >
                            {() => (
                              <Input
                                maxLength={14}
                                placeholder="Responsável - Telefone"
                              />
                            )}
                          </InputMaskCorrect>
                        </Form.Item>
                      </Col>
                      <Col md={5} xs={24}>
                        <Form.Item
                          label="Responsável - Celular"
                          name="responsible_secondary_phone"
                        >
                          <InputMaskCorrect
                            autoComplete="off"
                            mask={'(99) 99999-9999'}
                            maskChar={''}
                          >
                            {() => (
                              <Input
                                maxLength={15}
                                placeholder="Responsável - Celular"
                              />
                            )}
                          </InputMaskCorrect>
                        </Form.Item>
                      </Col>
                    </>
                  ) : null}
                  <Col span={24}>
                    <Button
                      htmlType="submit"
                      loading={loadButton}
                      style={{ float: 'right', marginLeft: 6 }}
                      type="primary"
                    >
                      {' '}
                      Salvar{' '}
                    </Button>
                    <Link to={'..'}>
                      <Button style={{ float: 'right' }} type="default">
                        {' '}
                        Cancelar{' '}
                      </Button>
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

export default CityhallForm;
