// react libraries

import {
  Button,
  Col,
  Collapse,
  Divider,
  Form,
  Modal,
  message,
  Popover,
  Row,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';
import { BsClock, BsClockFill } from 'react-icons/bs';
import { HiDownload, HiReceiptTax } from 'react-icons/hi';
import { IoDocument } from 'react-icons/io5';
import { TbUserDollar } from 'react-icons/tb';
import { Oval } from 'react-loader-spinner';
import CardItem from '../../../../components/CardItem';
import CardKPISmall from '../../../../components/CardKPISmall';
import Filter from '../../../../components/Filter';
import LoadItem from '../../../../components/LoadItem';
// components
import PageDefault from '../../../../components/PageDefault';
import Table from '../../../../components/Table';
// services
import {
  GET_API,
  getProfileID,
  getProfileType,
  getToken,
  getUPLOADAPI,
  POST_API,
} from '../../../../services';

const Financeiro = () => {
  // state
  const [saldoTotal, setSaldoTotal] = useState<number | string>(-1);
  const [saldoDisponivel, setSaldoDisponivel] = useState<number | string>(-1);
  const [saldoBloqueado, setSaldoBloqueado] = useState<number | string>(-1);
  const [totalLiquido, setTotalLiquido] = useState<number | string>(-1);

  const [action, setAction] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [antLoad, setAntLoad] = useState<boolean>(false);
  const [antSendLoad, setAntSendLoad] = useState<boolean>(false);
  const [ant, setAnt] = useState<any>(null);

  const [balance, setBalance] = useState<number>(0);

  const [note, setNote] = useState<any[]>([]);
  const [noteModal, setNoteModal] = useState<boolean>(false);
  const [noteLoading, setNoteLoading] = useState<boolean>(false);

  const seller =
    getProfileType() === 'SELLER' ||
    getProfileType() === 'LEGAL_SELLER' ||
    getProfileType() === 'SELLER_EMPLOYEE';

  useEffect(() => {
    GET_API('/me')
      .then((rs) => rs.json())
      .then((res) => {
        setSaldoTotal(
          `R$ ${Number(res.data.total_balance).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
        );
        setSaldoDisponivel(
          `R$ ${Number(res.data.available_balance).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
        );
        setSaldoBloqueado(
          `R$ ${Number(res.data.blocked_balance).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
        );
        setTotalLiquido(
          `R$ ${Number(res.data.net_total).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
        );
      });
  }, []);

  const column: any = [
    {
      title: 'Data e hora',
      dataIndex: 'balances.created_at',
      table: 'balances.created_at',
      width: '200px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Col>
            <Typography>{item.created_at}</Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'order.client',
      table: 'clients.name',
      width: 'auto',
      minWidth: '260px',
      sorter: false,
      align: 'rigth',
      render: null,
    },
    {
      title: 'Tipo transação',
      dataIndex: 'order_splits.type',
      table: 'order_splits.type',
      width: '140px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Col>
            <Typography>{item.order.payment_type_name}</Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Transação',
      dataIndex: 'balances.credit',
      table: 'balances.credit',
      width: '140px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'end'} style={{ width: '100%' }}>
          <Col>
            <Typography style={{ display: 'flex', alignItems: 'center' }}>
              R${' '}
              {Number(item.credit).toLocaleString('pt-br', {
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'A receber',
      dataIndex: 'balances.balance',
      table: 'balances.balance',
      width: '140px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'end'} style={{ width: '100%' }}>
          <Col>
            <Typography
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration:
                  item.order.status === 'REFUNDED' ? 'line-through' : '',
              }}
            >
              R${' '}
              {Number(seller ? item.debit : item.balance).toLocaleString(
                'pt-br',
                {
                  maximumFractionDigits: 2,
                }
              )}{' '}
              {item.balance > 0 ? (
                <Tooltip
                  title={
                    <Row style={{ flexDirection: 'column' }}>
                      {item.credit_breakdown.map((i: any) =>
                        Number(i.amount) > 0 ? <Col>{i.description}</Col> : null
                      )}
                    </Row>
                  }
                >
                  <span className="info">?</span>
                </Tooltip>
              ) : null}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Custos',
      dataIndex: 'balances.debit',
      table: 'balances.debit',
      width: '140px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'end'} style={{ width: '100%' }}>
          <Col>
            <Typography style={{ display: 'flex', alignItems: 'center' }}>
              R${' '}
              {Number(seller ? item.balance : item.debit).toLocaleString(
                'pt-br',
                {
                  maximumFractionDigits: 2,
                }
              )}{' '}
              {item.debit > 0 ? (
                <Tooltip
                  title={
                    <Row style={{ flexDirection: 'column' }}>
                      {item.debit_breakdown.map((i: any) =>
                        Number(i.amount) > 0 ? <Col>{i.description}</Col> : null
                      )}
                    </Row>
                  }
                >
                  <span className="info">?</span>
                </Tooltip>
              ) : null}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Situação',
      dataIndex: 'order_splits.balance',
      table: 'order_splits.balance',
      width: '140px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          {item.order.status === 'REFUNDED' ? (
            <Col>
              <Tag color="#F94A52">Estornado</Tag>
            </Col>
          ) : (
            <Col>
              <Tag
                color={
                  item.gateway_compensated && item.delivery_compensated
                    ? '#0E7A0D'
                    : item.order_split.anticipation_requested === 1
                      ? '#00A8FF'
                      : '#FFA500'
                }
              >
                {item.gateway_compensated && item.delivery_compensated
                  ? 'Recebido'
                  : item.order_split.anticipation_requested === 1
                    ? 'Aguardando antecipação'
                    : 'Aguardando'}
              </Tag>
            </Col>
          )}
        </Row>
      ),
    },
    {
      title: 'Ações',
      width: '100px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row gutter={[4, 4]} justify={'center'} style={{ width: '100%' }}>
          {!item.order.invoice_url && item.order.status !== 'REFUNDED' ? (
            <Col>
              <Tooltip title="Nota fiscal">
                <Button
                  onClick={() => onInvoicedata(item)}
                  shape="circle"
                  size="small"
                  type="primary"
                >
                  <HiReceiptTax />
                </Button>
              </Tooltip>
            </Col>
          ) : null}
          {item.order.invoice_url ? (
            <Col>
              <Tooltip title="Nota fiscal">
                <Button
                  onClick={() => window.open(`${item.order.invoice_url}`)}
                  shape="circle"
                  size="small"
                  type="primary"
                >
                  <HiDownload />
                </Button>
              </Tooltip>
            </Col>
          ) : null}
          {/* <Col><Tooltip title="Comprovante"><Button size="small" type="primary" shape="circle"><IoDocument /></Button></Tooltip></Col> */}
          {item.order.status !== 'REFUNDED' &&
          item.order.payment_type !== 'PIX' &&
          item.order_split.anticipation_requested === 0 ? (
            <Col>
              <Tooltip title="Pedir antecipação">
                <Button
                  onClick={() => onSimulateAntecipation(item)}
                  shape="circle"
                  size="small"
                  type="primary"
                >
                  <BsClockFill />
                </Button>
              </Tooltip>
            </Col>
          ) : null}
        </Row>
      ),
    },
  ];

  const onInvoicedata = (item: any) => {
    setNoteLoading(true);
    setBalance(item.id);
    GET_API(`/balance/${item.id}/invoice_data`)
      .then((rs) => rs.json())
      .then((res) => {
        setNote(res.data);
        setNoteModal(true);
      })
      .finally(() => setNoteLoading(false));
  };

  const onSimulateAntecipation = (item: any) => {
    setAntLoad(true);
    setModal(true);
    POST_API(`/anticipation/${item.order_splits_id}/simulate`, {})
      .then((rs) => rs.json())
      .then((res) => {
        setAnt(res);
      })
      .finally(() => setAntLoad(false));
  };

  const onAntecipation = () => {
    setAntSendLoad(true);
    setModal(true);
    POST_API(`/anticipation/${ant.id}`, {})
      .then((rs) => rs.json())
      .then((res) => {
        setModal(false);
        setAction(!action);
      })
      .finally(() => setAntSendLoad(false));
  };

  const onSend = (values: any) => {
    if (!values.note) {
      message.warning({ content: 'Anexe uma nota fiscal para continuar' });
      return;
    }
    setNoteLoading(true);
    POST_API(`/balance/${balance}/invoice`, {
      note: values.note.file.response.url,
    })
      .then((rs) => {
        if (rs.ok) {
          message.success('Nota anexada!');
          setNote([]);
          setNoteModal(false);
          setAction(!action);
        } else
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .finally(() => setNoteLoading(false));
  };

  return (
    <PageDefault
      items={[{ title: 'Transações financeiras' }]}
      options={
        <Row gutter={[8, 8]}>
          {/* <Col><Button  size="small">Baixar relatório</Button></Col> */}
        </Row>
      }
      valid={true}
    >
      <Row gutter={[16, 16]}>
        <Col lg={6} md={12} sm={12} xl={6} xs={24}>
          <CardKPISmall
            icon={<TbUserDollar className="card-kpi-small-icon" />}
            title="Saldo total"
            value={saldoTotal}
          />
        </Col>
        <Col lg={6} md={12} sm={12} xl={6} xs={24}>
          <CardKPISmall
            icon={<TbUserDollar className="card-kpi-small-icon" />}
            title="Saldo bloqueado (a receber)"
            value={saldoBloqueado}
          />
        </Col>
        <Col lg={6} md={12} sm={12} xl={6} xs={24}>
          <CardKPISmall
            icon={<TbUserDollar className="card-kpi-small-icon" />}
            title="Saldo disponível (recebido)"
            value={saldoDisponivel}
          />
        </Col>
        <Col lg={6} md={12} sm={12} xl={6} xs={24}>
          <CardKPISmall
            icon={<TbUserDollar className="card-kpi-small-icon" />}
            title="Total líquido"
            value={totalLiquido}
          />
        </Col>
        <Col span={24}>
          <CardItem>
            <Table
              action={action}
              column={column}
              path={'balance'}
              sorterActive={{
                order: 'DESC',
                selectColumn: 'balances.created_at',
              }}
              type={'list'}
              useFilter={[
                {
                  type: 'search',
                  name: 'clientId',
                  label: 'Cliente',
                  url: '/client',
                  labelField: ['id', 'name'],
                },
                {
                  type: 'select',
                  name: 'paymentType',
                  label: 'Tipo de transação',
                  items: [
                    { value: 'CREDIT_CARD', label: 'Cartão de crédito' },
                    { value: 'PIX', label: 'Pix' },
                    { value: 'BOLETO', label: 'Boleto' },
                  ],
                },
                {
                  type: 'select',
                  name: 'status',
                  label: 'Situação',
                  items: [
                    { value: true, label: 'Recebido' },
                    { value: false, label: 'Aguradando' },
                  ],
                },
                {
                  type: 'date',
                  name: 'date_start',
                  label: 'Data (início)',
                },
                {
                  type: 'date',
                  name: 'date_end',
                  label: 'Data (final)',
                },
              ]}
            />
          </CardItem>
        </Col>
      </Row>
      <Modal
        closable={false}
        footer={false}
        onCancel={() => setModal(false)}
        open={modal}
        width={360}
      >
        {antLoad ? (
          <Row justify={'center'}>
            <Col style={{ marginTop: 16 }}>
              <Oval
                ariaLabel="oval-loading"
                color="var(--color01)"
                height="50"
                secondaryColor="var(--color01)"
                visible={true}
                width="50"
                wrapperClass=""
                wrapperStyle={{}}
              />
            </Col>
          </Row>
        ) : (
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Typography
                style={{ textAlign: 'center', fontSize: 20, marginBottom: 6 }}
              >
                Simulação de antecipação
              </Typography>
            </Col>
            <Col span={24} style={{ marginBottom: 10 }}>
              <Row justify={'space-between'}>
                <Col style={{ fontSize: 16 }}>
                  <b>Valor</b>
                </Col>
                <Col style={{ fontSize: 16 }}>
                  R${' '}
                  {Number(ant?.simulated_anticipation?.value).toLocaleString(
                    'pt-br',
                    { maximumFractionDigits: 2 }
                  )}
                </Col>
              </Row>
              <Row justify={'space-between'}>
                <Col style={{ fontSize: 16 }}>
                  <b>Taxa antecipação</b>
                </Col>
                <Col style={{ fontSize: 16 }}>
                  R${' '}
                  {Number(ant?.simulated_anticipation?.fee).toLocaleString(
                    'pt-br',
                    { maximumFractionDigits: 2 }
                  )}
                </Col>
              </Row>
              <Divider style={{ marginTop: 4, marginBottom: 4 }} />
              <Row justify={'space-between'}>
                <Col style={{ fontSize: 16 }}>
                  <b>A receber</b>
                </Col>
                <Col style={{ fontSize: 16, color: 'var(--color01)' }}>
                  <b>
                    R${' '}
                    {Number(
                      ant?.simulated_anticipation?.net_value
                    ).toLocaleString('pt-br', { maximumFractionDigits: 2 })}
                  </b>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              2 dias úteis após a solicitação (mediante análise de crédito)
            </Col>
            <Col span={12}>
              <Button block onClick={() => setModal(false)}>
                Cancelar
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block
                loading={antSendLoad}
                onClick={onAntecipation}
                type="primary"
              >
                Pedir antecipação
              </Button>
            </Col>
          </Row>
        )}
      </Modal>
      <Modal
        footer={false}
        onCancel={() => setNoteModal(false)}
        open={noteModal}
        title="Dados para emissão da nota fiscal"
      >
        {note.length > 0 ? (
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Typography className="">Pedido #{note[0]?.order_id}</Typography>
            </Col>
            <Col span={24}>
              <Collapse>
                {note.map((v: any, i: number) => (
                  <Collapse.Panel header={`Ordem de locação #${v.id}`} key={i}>
                    <Typography>
                      <b>Cliente:</b> {v.client.name}
                    </Typography>
                    <Typography>
                      <b>E-mail:</b> {v.client.email}
                    </Typography>
                    <Typography>
                      <b>{String(v.client.document_type).toUpperCase()}</b>{' '}
                      {v.client.document_number}
                    </Typography>
                    <Divider style={{ marginTop: 8, marginBottom: 8 }} />
                    <Typography>
                      <b>Endereço:</b> {v.client.address.street},{' '}
                      {v.client.address.number}
                    </Typography>
                    <Typography>
                      <b>Bairro:</b> {v.client.address.district}
                    </Typography>
                    <Typography>
                      <b>Cidade:</b> {v.client.address.city} /{' '}
                      {v.client.address.state}
                    </Typography>
                    <Divider style={{ marginTop: 8, marginBottom: 8 }} />
                    {v.items.length > 0 ? (
                      <>
                        <Typography>
                          <b>Modelo:</b>{' '}
                          {
                            v.items[0].product.stationary_bucket_group
                              .stationary_bucket_type.name
                          }
                        </Typography>
                        <Typography>
                          <b>Cor:</b>{' '}
                          {v.items[0].product.stationary_bucket_group.color}
                        </Typography>
                        <Typography>
                          <b>Material:</b>{' '}
                          {v.items[0].product.stationary_bucket_group.material}
                        </Typography>
                        <Typography>
                          <b>Quantidade:</b> {v.items[0].quantity}
                        </Typography>
                        <Typography>
                          <b>Valor total:</b> R${' '}
                          {Number(v.items[0].price).toLocaleString('pt-br', {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </Typography>
                        <Divider style={{ marginTop: 8, marginBottom: 8 }} />
                        {v.items.map((v1: any, i1: number) => (
                          <Typography>
                            <b>Item #{i1 + 1}</b> {v1.product.code}
                          </Typography>
                        ))}
                      </>
                    ) : (
                      <Typography>Nenhuma caçamba selecionada ainda</Typography>
                    )}
                  </Collapse.Panel>
                ))}
              </Collapse>
            </Col>
            <Col span={24}>
              <Form onFinish={onSend}>
                <Form.Item name={'note'} style={{ marginBottom: 0 }}>
                  <Upload
                    accept="application/pdf"
                    action={getUPLOADAPI}
                    headers={{
                      Authorization: 'Bearer ' + getToken(),
                      Profile: getProfileID(),
                    }}
                    maxCount={1}
                    showUploadList={true}
                  >
                    <Button
                      block
                      className="btn-default"
                      style={{ marginBottom: -10 }}
                      type="default"
                    >
                      Anexar nota fiscal
                    </Button>
                  </Upload>
                </Form.Item>
                <Button
                  block
                  className="btn-primary"
                  htmlType="submit"
                  loading={noteLoading}
                  style={{ marginTop: 10 }}
                  type="primary"
                >
                  Salvar
                </Button>
              </Form>
            </Col>
          </Row>
        ) : (
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Typography>Pedido aguardando confirmação</Typography>
            </Col>
          </Row>
        )}
      </Modal>
    </PageDefault>
  );
};

export default Financeiro;
