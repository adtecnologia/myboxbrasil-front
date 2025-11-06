// react libraries

import { Button, Col, Form, Input, Modal, message, Row } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

// components
import CardItem from '../../../components/CardItem';
import { InputMaskCorrect } from '../../../components/InputMask';
import LoadItem from '../../../components/LoadItem';
import PageDefault from '../../../components/PageDefault';
import SelectSearch from '../../../components/SelectSearch';
import { TableReturnButton } from '../../../components/Table/buttons';

// services
import {
  cleanData,
  GET_API,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from '../../../services';

const VehicleForm = ({ type, path, permission }: PageDefaultProps) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  // PARAMETROS
  const { ID } = useParams();

  // ESTADOS DO COMPONENTE
  const [load, setLoad] = useState(true);
  const [loadButton, setLoadButton] = useState(false);
  const [vehicleType, setVehicleType] = useState<any>(null);

  // CAMPOS FORMULARIO
  const [form] = Form.useForm();

  // ANOS
  const years = Array.from(
    { length: 30 },
    (_, index) => new Date().getFullYear() + 2 - index
  );

  // VERIFICA "NOVO" OU "EDITAR"
  useEffect(() => {
    if (type === 'add') {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/vehicle/${ID}`)
        .then((rs) => {
          if (rs.ok) return rs.json();
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        })
        .then((res) => {
          setVehicleType({ ID: res.data.vehicle_type_id });
          form.setFieldsValue(cleanData(res.data));
        })
        .catch(POST_CATCH)
        .finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // FUNÇÃO SALVAR
  const onSend = (values: any) => {
    console.log(values);
    setLoadButton(true);
    POST_API('/vehicle', values, ID)
      .then((rs) => {
        if (rs.ok) {
          message.success('Salvo com sucesso!');
          navigate('..');
        } else
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  return (
    <PageDefault
      items={[
        { title: <Link to={type === 'list' ? '#' : '..'}>Veículos</Link> },
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
                  <Col md={6} xs={10}>
                    <Form.Item
                      label="Tipo de Veículo"
                      name="vehicle_type_id"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <SelectSearch
                        change={(v: any) =>
                          form.setFieldValue('vehicle_type_id', v?.value)
                        }
                        effect={vehicleType}
                        labelField={['id', 'name']}
                        placeholder="Tipo de Veículo"
                        url="/vehicle_type"
                        value={form.getFieldValue('vehicle_type_id')}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={12}>
                    <Form.Item
                      label="Placa"
                      name="plate"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input maxLength={7} placeholder="Placa" />
                    </Form.Item>
                  </Col>
                  <Col md={4} xs={12}>
                    <Form.Item
                      label="Renavam"
                      name="renavam"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input maxLength={12} placeholder="Renavam" />
                    </Form.Item>
                  </Col>
                  <Col md={4} xs={12}>
                    <Form.Item
                      label="Marca"
                      name="brand"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input placeholder="Marca" />
                    </Form.Item>
                  </Col>
                  <Col md={4} xs={12}>
                    <Form.Item
                      label="Modelo"
                      name="model"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input placeholder="Modelo" />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={12}>
                    <Form.Item label="Versão" name="version">
                      <Input placeholder="Versão" />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={12}>
                    <Form.Item
                      label="Ano Fabricação"
                      name="year_manufacture"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <InputMaskCorrect
                        autoComplete="off"
                        mask={'9999'}
                        maskChar={''}
                      >
                        {() => <Input placeholder="Ano Fabricação" />}
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={12}>
                    <Form.Item
                      label="Ano Modelo"
                      name="year_model"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <InputMaskCorrect
                        autoComplete="off"
                        mask={'9999'}
                        maskChar={''}
                      >
                        {() => <Input placeholder="Ano Modelo" />}
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col md={5} xs={12}>
                    <Form.Item
                      label="Combustível"
                      name="fuel"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input placeholder="Combustível" type="text" />
                    </Form.Item>
                  </Col>
                  <Col md={4} xs={12}>
                    <Form.Item label="Motor" name="motor">
                      <Input placeholder="Motor" />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={12}>
                    <Form.Item label="Eixos" name="axles">
                      <Input min={0} placeholder="Eixos" type="number" />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={12}>
                    <Form.Item label="Lotação" name="capacity">
                      <Input
                        addonAfter="t"
                        min={0}
                        placeholder="Lotação"
                        style={{ width: '100%' }}
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={12}>
                    <Form.Item label="Tara" name="total_gross_weight">
                      <Input
                        addonAfter="t"
                        min={0}
                        placeholder="Tara"
                        style={{ width: '100%' }}
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Button
                      htmlType="submit"
                      loading={loadButton}
                      style={{ float: 'right', marginLeft: 6 }}
                      type="primary"
                    >
                      Salvar
                    </Button>
                    <Link to={'..'}>
                      <Button style={{ float: 'right' }} type="default">
                        Cancelar
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

export default VehicleForm;
