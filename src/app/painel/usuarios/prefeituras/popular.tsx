import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Row,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
// components
import CardItem from '../../../../components/CardItem';
import PageDefault from '../../../../components/PageDefault';
import { TableReturnButton } from '../../../../components/Table/buttons';
// services
import {
  GET_API,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from '../../../../services';

const CityhallPopular = ({ type, path, permission }: PageDefaultProps) => {
  // router
  const navigate = useNavigate();

  // params
  const { ID } = useParams();

  // states
  const [prefeitura, setPrefeitura] = useState<any>(null);
  const [loadButton, setLoadButton] = useState<boolean>(false);

  // form
  const [form] = Form.useForm();

  // valid params
  // biome-ignore lint/correctness/useExhaustiveDependencies: ignorar
  useEffect(() => {
    GET_API(`/city/${ID}`)
      .then((rs) => rs.json())
      .then((response) => {
        setPrefeitura(response.data);

        form.setFieldsValue({
          qtde_customer_cpf: 0,
          qtde_customer_cnpj: 0,
          qtde_seller_cpf: 0,
          qtde_seller_cnpj: 0,
          qtde_destination_cpf: 0,
          qtde_destination_cnpj: 0,
          total_stationary: 0,
          total_order_location: 0,
          estado: response.data.state.acronym,
          code_cidade: '',
        });
      });
  }, [type, path, form, ID]);

  // function save
  const onSend = (values: {
    qtde_customer_cpf: 0;
    qtde_customer_cnpj: 0;
    qtde_seller_cpf: 0;
    qtde_seller_cnpj: 0;
    qtde_destination_cpf: 0;
    qtde_destination_cnpj: 0;
    total_stationary: 0;
    total_order_location: 0;
    estado: '';
    code_cidade: '';
  }) => {
    // return

    setLoadButton(true);

    POST_API('/popular_dados', { ...values, city_id: ID })
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({
          title: 'Algo deu errado',
          content: rs.statusText,
        });
      })
      .then((res) => {
        if (res?.nome) {
          message.warning(res.nome);
        } else {
          message.success(res.message);
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  return (
    <PageDefault
      items={[
        { title: <Link to={type === 'list' ? '#' : '..'}>Prefeitura</Link> },
        { title: 'Popular dados' },
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
          <CardItem>
            <Form form={form} layout="vertical" onFinish={onSend}>
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Typography style={{ fontSize: 24, fontWeight: 600 }}>
                    Popular dados - {prefeitura?.name}
                  </Typography>
                </Col>
                <Form.Item hidden name={'estado'}>
                  <Input />
                </Form.Item>
                <Col md={4} xs={24}>
                  <Form.Item
                    label="Qtde.: Locatários CPF"
                    name="qtde_customer_cpf"
                  >
                    <InputNumber
                      addonAfter="UN"
                      defaultValue={0}
                      max={10}
                      min={0}
                      width={'100%'}
                    />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item
                    label="Qtde.: Locatários CNPJ"
                    name="qtde_customer_cnpj"
                  >
                    <InputNumber
                      addonAfter="UN"
                      defaultValue={0}
                      max={10}
                      min={0}
                      width={'100%'}
                    />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item
                    label="Qtde.: Locadores CPF"
                    name="qtde_seller_cpf"
                  >
                    <InputNumber
                      addonAfter="UN"
                      defaultValue={0}
                      max={10}
                      min={0}
                      width={'100%'}
                    />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item
                    label="Qtde.: Locadores CNPJ"
                    name="qtde_seller_cnpj"
                  >
                    <InputNumber
                      addonAfter="UN"
                      defaultValue={0}
                      max={10}
                      min={0}
                      width={'100%'}
                    />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item
                    label="Qtde.: Destino Final CPF"
                    name="qtde_destination_cpf"
                  >
                    <InputNumber
                      addonAfter="UN"
                      defaultValue={0}
                      max={10}
                      min={0}
                      width={'100%'}
                    />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item
                    label="Qtde.: Destino Final CNPJ"
                    name="qtde_destination_cnpj"
                  >
                    <InputNumber
                      addonAfter="UN"
                      defaultValue={0}
                      max={10}
                      min={0}
                      width={'100%'}
                    />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item label="Adicionar Caçambas" name="total_stationary">
                    <InputNumber
                      addonAfter="UN"
                      defaultValue={0}
                      max={200}
                      min={0}
                      width={'100%'}
                    />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item
                    label="Adicionar Ordens de Locação"
                    name="total_order_location"
                  >
                    <InputNumber
                      addonAfter="UN"
                      defaultValue={0}
                      max={50}
                      min={0}
                      width={'100%'}
                    />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item label="Locatário específico" name="customer_id">
                    <Input placeholder="ID de locatário" width={'100%'} />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item label="Locador específico" name="seller_id">
                    <Input placeholder="ID de locador" width={'100%'} />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item label="Motorista específico" name="driver_id">
                    <Input placeholder="ID de motorista" width={'100%'} />
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item
                    label="Destinador específico"
                    name="destination_id"
                  >
                    <Input placeholder="ID de destinador" width={'100%'} />
                  </Form.Item>
                </Col>
                <Col md={6} xs={24}>
                  <Form.Item
                    label="Confirmar código da cidade (4devs)"
                    name="code_cidade"
                  >
                    <Input
                      placeholder="Necessário para API 4Devs"
                      width={'100%'}
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
        </Col>
      </Row>
    </PageDefault>
  );
};

export default CityhallPopular;
