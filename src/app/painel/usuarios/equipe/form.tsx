// react libraries

import { Button, Col, Form, Input, Modal, message, Radio, Row } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CardItem from '../../../../components/CardItem';
import { InputMaskCorrect } from '../../../../components/InputMask';
import LoadItem from '../../../../components/LoadItem';
// components
import PageDefault from '../../../../components/PageDefault';
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
// complements
import config from './config.json' with { type: 'json' };
import TeamFormPermission from './permission';

const TeamForm = ({ type, path, permission }: PageDefaultProps) => {
  // router
  const navigate = useNavigate();

  // params
  const { ID } = useParams();

  // states
  const [load, setLoad] = useState<boolean>(true);
  const [doc, setDoc] = useState('cpf');
  const [loadButton, setLoadButton] = useState<boolean>(false);
  const [per, setPer] = useState<string[]>([]);

  // form
  const [form] = Form.useForm();

  // valid params
  useEffect(() => {
    if (type === 'add') {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/user/${ID}`)
        .then((rs) => {
          if (rs.ok) return rs.json();
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        })
        .then((res) => {
          form.setFieldsValue(cleanData(res.data));
          setPer(res.data.permissions);
          setDoc(res.data.document_type);
        })
        .catch(POST_CATCH)
        .finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // function save
  const onSend = (values: any) => {
    setLoadButton(true);

    if (
      getProfileType() === 'LEGAL_CUSTOMER' ||
      getProfileType() === 'CUSTOMER' ||
      getProfileType() === 'CUSTOMER_EMPLOYEE'
    ) {
      values.profile_type = 'CUSTOMER_EMPLOYEE';
    } else if (
      getProfileType() === 'LEGAL_SELLER' ||
      getProfileType() === 'SELLER' ||
      getProfileType() === 'SELLER_EMPLOYEE'
    ) {
      values.profile_type = 'SELLER_EMPLOYEE';
    } else if (
      getProfileType() === 'ADMIN' ||
      getProfileType() === 'ADMIN_EMPLOYEE'
    ) {
      values.profile_type = 'ADMIN_EMPLOYEE';
    } else if (
      getProfileType() === 'CITY' ||
      getProfileType() === 'CITY_EMPLOYEE'
    ) {
      values.profile_type = 'CITY_EMPLOYEE';
    } else if (
      getProfileType() === 'FINAL_DESTINATION' ||
      getProfileType() === 'LEGAL_FINAL_DESTINATION' ||
      getProfileType() === 'FINAL_DESTINATION_EMPLOYEE'
    ) {
      values.profile_type = 'FINAL_DESTINATION_EMPLOYEE';
    }

    values.permission = per;

    POST_API('/user', values, ID)
      .then((rs) => {
        if (rs.ok) {
          message.success('Salvo com sucesso!');
          navigate('..');
        } else {
          return rs.json().then((res) => {
            message.error(res.message);
            return Promise.reject();
          });
        }
      })
      .finally(() => setLoadButton(false));
  };

  return (
    <PageDefault
      items={[
        { title: <Link to={type === 'list' ? '#' : '..'}>Equipe</Link> },
        { title: type === 'add' ? 'Novo' : 'Editar' },
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
                      label="Tipo Pessoa"
                      name="document_type"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Radio.Group
                        disabled={type === 'edit'}
                        onChange={(e) => setDoc(e.target.value)}
                      >
                        <Radio value={'cpf'}>Física</Radio>
                        <Radio value={'cnpj'}>Jurídica</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
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
                    <Col md={16} xs={24}>
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
                  )}
                  <Col md={doc === 'cnpj' ? 5 : 7} xs={24}>
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
                  <Col md={doc === 'cnpj' ? 5 : 7} xs={24}>
                    <Form.Item label="E-mail Secundário" name="secondary_email">
                      <Input placeholder="E-mail Secundário" />
                    </Form.Item>
                  </Col>
                  <Col md={doc === 'cnpj' ? 3 : 5} xs={24}>
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
                  <Col md={doc === 'cnpj' ? 3 : 5} xs={24}>
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
                    {getProfileType() === 'ADMIN' ||
                    getProfileType() === 'ADMIN_EMPLOYEE' ? (
                      <TeamFormPermission
                        PERMISSIONS={config.ADMIN}
                        per={per}
                        setPer={setPer}
                      />
                    ) : null}
                    {getProfileType() === 'CITY' ||
                    getProfileType() === 'CITY_EMPLOYEE' ? (
                      <TeamFormPermission
                        PERMISSIONS={config.CITY}
                        per={per}
                        setPer={setPer}
                      />
                    ) : null}
                    {getProfileType() === 'CUSTOMER' ||
                    getProfileType() === 'LEGAL_CUSTOMER' ||
                    getProfileType() === 'CUSTOMER_EMPLOYEE' ? (
                      <TeamFormPermission
                        PERMISSIONS={config.CUSTOMER}
                        per={per}
                        setPer={setPer}
                      />
                    ) : null}
                    {getProfileType() === 'SELLER' ||
                    getProfileType() === 'LEGAL_SELLER' ||
                    getProfileType() === 'SELLER_EMPLOYEE' ? (
                      <TeamFormPermission
                        PERMISSIONS={config.SELLER}
                        per={per}
                        setPer={setPer}
                      />
                    ) : null}
                    {getProfileType() === 'FINAL_DESTINATION' ||
                    getProfileType() === 'LEGAL_FINAL_DESTINATION' ||
                    getProfileType() === 'FINAL_DESTINATION_EMPLOYEE' ? (
                      <TeamFormPermission
                        PERMISSIONS={config.FINAL_DESTINATION}
                        per={per}
                        setPer={setPer}
                      />
                    ) : null}
                  </Col>
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

export default TeamForm;
