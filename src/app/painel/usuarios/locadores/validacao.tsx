/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { Button, Col, Form, Input, Modal, message, Row, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import StatisticComponent from '@/components/StatisticComponent';
import CardItem from '../../../../components/CardItem';
import LoadItem from '../../../../components/LoadItem';
// components
import PageDefault from '../../../../components/PageDefault';
import { TableReturnButton } from '../../../../components/Table/buttons';
// services
import {
  GET_API,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from '../../../../services';

const LocadorValidacaoForm = ({ path, permission }: PageDefaultProps) => {
  // router
  const navigate = useNavigate();

  // params
  const { ID } = useParams();

  // states
  const [load, setLoad] = useState<boolean>(true);
  const [loadButton, setLoadButton] = useState<boolean>(false);
  const [data, setData] = useState<any>();
  const [visible, setVisible] = useState<boolean>(false);
  // form
  const [form] = Form.useForm();

  const onRecuse = (values: { message: string }) => {
    setLoadButton(true);
    POST_API('/notification', { ...values, user_to_id: ID })
      .then((rs) => rs.json())
      .then(() => {
        POST_API(
          '/user',
          {
            municipal_approval_status: 'rejected',
            municipal_approved_reason: values.message,
            profile_type: 'seller',
          },
          ID
        );
        setVisible(false);
        message.success('Motivo enviado!');
        navigate('..');
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  // function save
  const onSend = () => {
    Modal.confirm({
      title: 'Atenção!',
      content: 'Deseja aprovar esse cadastro?',
      cancelText: 'Não',
      okText: 'Sim',
      onOk: () => {
        setLoadButton(true);
        POST_API(
          '/user',
          {
            municipal_approval_status: 'approved',
            profile_type: 'final_destination',
          },
          ID
        )
          .then((rs) => rs.json())
          .then(() => {
            message.success('Salvo com sucesso!');
            navigate('..');
          })
          .catch(POST_CATCH)
          .finally(() => setLoadButton(false));
      },
    });
    setLoadButton(true);
  };

  // valid params
  // biome-ignore lint/correctness/useExhaustiveDependencies: ignorar
  useEffect(() => {
    setLoad(true);
    GET_API(`/user/${ID}`)
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        setData(res.data);
      })
      .catch(POST_CATCH)
      .finally(() => setLoad(false));
  }, [path, form, ID]);

  return (
    <PageDefault
      items={[
        { title: <Link to={'..'}>Locadores</Link> },
        { title: 'Validação' },
      ]}
      options={
        <Row gutter={[8, 8]} justify={'end'}>
          <TableReturnButton permission={permission} type={'edit'} />
        </Row>
      }
      valid={`${permission}.val`}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          {load ? (
            <LoadItem />
          ) : (
            <CardItem>
              <Row gutter={[8, 8]} justify={'end'}>
                <Col lg={4} xl={4}>
                  <Statistic
                    title="Data de cadastro"
                    value={data?.created_at}
                  />
                </Col>
                <Col lg={14} xl={14}>
                  <Statistic title="Nome" value={data?.name} />
                </Col>
                <Col lg={6} xl={6}>
                  <Statistic title="Documento" value={data?.document_number} />
                </Col>
                <Col lg={12} xl={12}>
                  <Statistic title="E-mail" value={data?.email} />
                </Col>
                <Col lg={6} xl={6}>
                  <Statistic
                    decimalSeparator=""
                    groupSeparator=""
                    title="Telefone"
                    value={`${data?.phone ?? '-'}`}
                  />
                </Col>
                <Col lg={6} xl={6}>
                  <Statistic
                    decimalSeparator=""
                    groupSeparator=""
                    title="Celular"
                    value={`${data?.secondary_phone}`}
                  />
                </Col>
                <Col lg={10} xl={10}>
                  <Statistic
                    title="Logradouro"
                    value={`${data?.address.street}`}
                  />
                </Col>
                <Col lg={4} xl={4}>
                  <Statistic
                    decimalSeparator=","
                    groupSeparator="."
                    title="Número"
                    value={`${data?.address.number}`}
                  />
                </Col>
                <Col lg={10} xl={10}>
                  <Statistic
                    decimalSeparator=","
                    groupSeparator="."
                    title="Bairro"
                    value={`${data?.address.district}`}
                  />
                </Col>
                <Col lg={20} xl={20}>
                  <StatisticComponent
                    title="Licença ambiental"
                    value={
                      data?.environmental_license ? (
                        <Link
                          style={{
                            textWrap: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%',
                            display: 'inherit',
                          }}
                          target="_blank"
                          to={data?.environmental_license}
                        >
                          {data?.environmental_license}
                        </Link>
                      ) : (
                        'Não anexada'
                      )
                    }
                  />
                </Col>
                <Col lg={4} xl={4}>
                  <Statistic
                    title="Vencimento"
                    value={`${data?.environmental_license_expiration_format ?? '-'}`}
                  />
                </Col>
                <Col span={3}>
                  <Button
                    block
                    loading={loadButton}
                    onClick={() => setVisible(true)}
                  >
                    Recusar
                  </Button>
                </Col>
                <Col span={3}>
                  <Button
                    block
                    loading={loadButton}
                    onClick={onSend}
                    type="primary"
                  >
                    Aprovar
                  </Button>
                </Col>
              </Row>
            </CardItem>
          )}
        </Col>
        <Modal
          cancelText="Cancelar"
          okButtonProps={{ loading: loadButton }}
          okText="Enviar motivo"
          onCancel={() => setVisible(false)}
          onOk={() => form.submit()}
          open={visible}
          title="Por que foi recusado?"
        >
          <Form form={form} onFinish={onRecuse}>
            <Form.Item
              name={'message'}
              rules={[{ required: true, message: 'Campo obrigatório!' }]}
            >
              <Input.TextArea
                placeholder="Descreva o motivo aqui..."
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Row>
    </PageDefault>
  );
};

export default LocadorValidacaoForm;
