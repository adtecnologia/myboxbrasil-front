// react libraries

import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  message,
  Popover,
  Row,
  Select,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { setuid } from 'process';
import { useEffect, useState } from 'react';
import { BsClock, BsClockFill } from 'react-icons/bs';
import { GiPayMoney, GiReceiveMoney } from 'react-icons/gi';
import { IoDocument } from 'react-icons/io5';
import { Oval } from 'react-loader-spinner';
import CardItem from '../../../../components/CardItem';
import CardKPISmall from '../../../../components/CardKPISmall';
import Filter from '../../../../components/Filter';
import { InputMaskCorrect } from '../../../../components/InputMask';
import LoadItem from '../../../../components/LoadItem';
// components
import PageDefault from '../../../../components/PageDefault';
import SelectSearch from '../../../../components/SelectSearch';
import Table from '../../../../components/Table';
// services
import {
  GET_API,
  getProfileType,
  POST_API,
  POST_CATCH,
} from '../../../../services';

const FinancialMinhaConta = () => {
  // state
  const [saldoDisponivel, setSaldoDisponivel] = useState<number | string>(-1);
  const [saldoDisponivelNumber, setSaldoDisponivelNumber] = useState<number>(0);
  const [saldoBloqueado, setSaldoBloqueado] = useState<number | string>(-1);
  const [sacar, setSacar] = useState<number>(0);
  const [saldoNovo, setSaldoNovo] = useState<number>(0);

  const [action, setAction] = useState<boolean>(false);
  const [loadButton, setLoadButton] = useState<boolean>(false);
  const [loadSaque, setLoadSaque] = useState<boolean>(false);
  const [userId, setUserId] = useState<any>(null);

  const [bank, setBank] = useState<any>(null);
  const [docAccount, setDocAccount] = useState<string>('cpf');
  const [bankAccountId, setBankAccountId] = useState<number>(0);

  // form
  const [form] = Form.useForm();

  useEffect(() => {
    if (!loadSaque) {
      GET_API('/me')
        .then((rs) => rs.json())
        .then((res) => {
          setSacar(Number(0));
          setUserId(res.data.id);
          // setSaldoDisponivel(`R$ ${Number(res.data.available_balance).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`)
          setSaldoDisponivelNumber(Number(res.data.available_balance));
          setSaldoDisponivel(
            `R$ ${Number(res.data.available_balance).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
          );
          setSaldoBloqueado(
            `R$ ${Number(res.data.blocked_balance).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
          );

          GET_API('/bank_account')
            .then((rs) => rs.json())
            .then((res) => {
              if (res.data[0].id) {
                setBankAccountId(res.data[0].id);
                setDocAccount(res.data[0].person);
                setBank({ ID: res.data[0].bank_id });

                form.setFieldValue('person', res.data[0].person);
                form.setFieldValue(
                  'owner_document',
                  res.data[0].owner_document
                );
                form.setFieldValue('owner_name', res.data[0].owner_name);
                form.setFieldValue(
                  'owner_birthdate',
                  res.data[0].owner_birthdate
                );
                form.setFieldValue('account_type', res.data[0].account_type);
                form.setFieldValue('bank_id', res.data[0].bank_id);
                form.setFieldValue('agency_number', res.data[0].agency_number);
                form.setFieldValue('agency_vd', res.data[0].agency_vd);
                form.setFieldValue(
                  'account_number',
                  res.data[0].account_number
                );
                form.setFieldValue('account_vd', res.data[0].account_vd);
              } else {
                setBankAccountId(0);
              }
            });
        });
    }
  }, [loadSaque]);

  useEffect(() => {
    setSaldoNovo(Number(saldoDisponivelNumber - sacar - 5));
  }, [sacar, saldoDisponivelNumber]);

  const onSend = (values: any) => {
    setLoadButton(true);
    values.user_id = userId;
    values.default = 1;
    values.account_name = 'Minha conta';
    POST_API('/bank_account', values, bankAccountId > 0 ? bankAccountId : null)
      .then((rs) => {
        if (rs.ok) {
          message.success('Salvo com sucesso!');
        } else
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  const column: any = [
    {
      title: 'Data e hora',
      dataIndex: 'transfers.created_at',
      table: 'transfers.created_at',
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
      title: 'Banco',
      dataIndex: 'bankAccount.bank.name',
      table: 'transfers.bankAccount.agency',
      width: 'auto',
      minWidth: '260px',
      sorter: false,
      align: 'left',
      render: null,
    },
    {
      title: 'Agência',
      dataIndex: 'bankAccount.agency',
      table: 'transfers.bankAccount.agency',
      width: '120px',
      sorter: false,
      align: 'center',
      render: null,
    },
    {
      title: 'Conta',
      dataIndex: 'bankAccount.account',
      table: 'transfers.bankAccount.account',
      width: '120px',
      sorter: false,
      align: 'center',
      render: null,
    },
    {
      title: 'Valor',
      width: '120px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Col>
            <Typography>
              R${' '}
              {Number(item.value).toLocaleString('pt-br', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Situação',
      width: '120px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Tag
          color={
            item.status === 'PENDING'
              ? '#FFC107'
              : item.status === 'BANK_PROCESSING'
                ? '#007BFF'
                : item.status === 'DONE'
                  ? '#28A745'
                  : item.status === 'CANCELLED'
                    ? '#6C757D'
                    : item.status === 'FAILED'
                      ? '#DC3545'
                      : ''
          }
          style={{ margin: 0 }}
        >
          {item.status === 'PENDING'
            ? 'Pendente'
            : item.status === 'BANK_PROCESSING'
              ? 'Processando'
              : item.status === 'DONE'
                ? 'Realizado'
                : item.status === 'CANCELLED'
                  ? 'Cancelado'
                  : item.status === 'FAILED'
                    ? 'Falhou'
                    : null}
        </Tag>
      ),
    },
  ];

  const onSendSaque = () => {
    setLoadSaque(true);
    POST_API('/transfer', { value: sacar, bank_account_id: bankAccountId })
      .then((rs) => {
        if (rs.ok) {
          message.success('Pedido de saque realizado com sucesso');
        } else
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .finally(() => setLoadSaque(false));
  };

  return (
    <PageDefault
      items={[{ title: 'Minha conta' }]}
      options={
        <Row gutter={[8, 8]}>
          {/* <Col><Button  size="small">Baixar relatório</Button></Col> */}
        </Row>
      }
      valid={true}
    >
      <Row gutter={[16, 16]}>
        <Col lg={12} md={12} sm={24} xl={12} xs={24}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <CardItem title={'Minhas informações financeiras'}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onSend}
                  style={{ width: '100%' }}
                >
                  <Row className="card-register-fields" gutter={[8, 0]}>
                    <Col lg={10} md={10} sm={6} xl={5} xs={12}>
                      <Form.Item
                        label="Pessoa"
                        name="person"
                        rules={[
                          { required: true, message: 'Campo obrigatório' },
                        ]}
                      >
                        <Select onChange={setDocAccount} placeholder="Pessoa">
                          <Select.Option value="cpf">
                            Pessoa Física
                          </Select.Option>
                          <Select.Option value="cnpj">
                            Pessoa Jurídica
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col lg={14} md={14} sm={6} xl={6} xs={12}>
                      <Form.Item
                        label={docAccount === 'cpf' ? 'CPF' : 'CNPJ'}
                        name="owner_document"
                        rules={[
                          { required: true, message: 'Campo obrigatório' },
                        ]}
                      >
                        <InputMaskCorrect
                          autoComplete="off"
                          mask={
                            docAccount === 'cpf'
                              ? '999.999.999-99'
                              : '99.999.999/9999-99'
                          }
                          maskChar={''}
                        >
                          {() => (
                            <Input
                              maxLength={docAccount === 'cpf' ? 14 : 18}
                              placeholder={
                                docAccount === 'cpf'
                                  ? 'Digite seu CPF'
                                  : 'Digite seu CNPJ'
                              }
                            />
                          )}
                        </InputMaskCorrect>
                      </Form.Item>
                    </Col>
                    <Col lg={16} md={16} sm={12} xl={13} xs={24}>
                      <Form.Item
                        label="Nome"
                        name="owner_name"
                        rules={[
                          { required: true, message: 'Campo obrigatório' },
                        ]}
                      >
                        <Input placeholder="Nome" type="text" />
                      </Form.Item>
                    </Col>
                    <Col lg={8} md={8} sm={6} xl={6} xs={12}>
                      <Form.Item
                        label={
                          docAccount === 'cpf'
                            ? 'Data nascimento'
                            : 'Data abertura'
                        }
                        name="owner_birthdate"
                        rules={[
                          { required: true, message: 'Campo obrigatório' },
                        ]}
                      >
                        <Input
                          max={'9999-12-31'}
                          placeholder={
                            docAccount === 'cpf'
                              ? 'Data nascimento'
                              : 'Data abertura'
                          }
                          type="date"
                        />
                      </Form.Item>
                    </Col>
                    <Col lg={12} md={12} sm={6} xl={6} xs={12}>
                      <Form.Item
                        label="Tipo de conta"
                        name="account_type"
                        rules={[
                          { required: true, message: 'Campo obrigatório' },
                        ]}
                      >
                        <Select placeholder="Tipo de conta">
                          <Select.Option value="conta_corrente">
                            Conta corrente
                          </Select.Option>
                          <Select.Option value="conta_poupanca">
                            Conta poupança
                          </Select.Option>
                          <Select.Option value="conta_corrente_conjunta">
                            Conta corrente conjunta
                          </Select.Option>
                          <Select.Option value="conta_poupanca_conjunta">
                            Conta poupança conjunta
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col lg={12} md={12} sm={12} xl={12} xs={24}>
                      <Form.Item
                        label={'Banco'}
                        name="bank_id"
                        rules={[
                          { required: true, message: 'Campo obrigatório' },
                        ]}
                      >
                        <SelectSearch
                          change={(v: any) =>
                            form.setFieldValue('bank_id', v.value)
                          }
                          effect={bank}
                          labelField={['code', 'name']}
                          placeholder="Banco"
                          url="/bank"
                          value={form.getFieldValue('bank_id')}
                        />
                      </Form.Item>
                    </Col>
                    <Col lg={7} md={6} sm={7} xl={7} xs={14}>
                      <Form.Item
                        label="Agência - número"
                        name="agency_number"
                        rules={[
                          { required: true, message: 'Campo obrigatório' },
                        ]}
                      >
                        <Input placeholder="Agência - número" type="text" />
                      </Form.Item>
                    </Col>
                    <Col lg={5} md={6} sm={5} xl={5} xs={10}>
                      <Form.Item
                        label="Agência - dígito"
                        name="agency_vd"
                        rules={[
                          { required: true, message: 'Campo obrigatório' },
                        ]}
                      >
                        <Input
                          maxLength={1}
                          placeholder="Agência - dígito"
                          type="text"
                        />
                      </Form.Item>
                    </Col>
                    <Col lg={7} md={6} sm={7} xl={7} xs={14}>
                      <Form.Item
                        label="Conta - número"
                        name="account_number"
                        rules={[
                          { required: true, message: 'Campo obrigatório' },
                        ]}
                      >
                        <Input placeholder="Conta - número" type="text" />
                      </Form.Item>
                    </Col>
                    <Col lg={5} md={6} sm={5} xl={5} xs={10}>
                      <Form.Item
                        label="Conta - dígito"
                        name="account_vd"
                        rules={[
                          { required: true, message: 'Campo obrigatório' },
                        ]}
                      >
                        <Input
                          maxLength={1}
                          placeholder="Conta - dígito"
                          type="text"
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
                        Atualizar dados financeiros{' '}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </CardItem>
            </Col>
          </Row>
        </Col>
        <Col lg={12} md={12} sm={24} xl={12} xs={24}>
          <Row gutter={[16, 16]}>
            <Col lg={12} md={24} sm={12} xl={12} xs={24}>
              <CardKPISmall
                icon={<GiPayMoney className="card-kpi-small-icon" />}
                title="Saldo bloqueado (a receber)"
                value={saldoBloqueado}
              />
            </Col>
            <Col lg={12} md={24} sm={12} xl={12} xs={24}>
              <CardKPISmall
                icon={<GiReceiveMoney className="card-kpi-small-icon" />}
                title="Saldo disponível (recebido)"
                value={saldoDisponivel}
              />
            </Col>
            <Col span={24}>
              <CardItem title={'Solicitar saque'}>
                <Row align={'top'} gutter={[16, 16]}>
                  <Col lg={6} md={8} sm={8} xl={6} xs={10}>
                    <Input
                      addonBefore="R$"
                      max={saldoDisponivelNumber}
                      min={5}
                      onChange={(e: any) =>
                        setSacar(
                          saldoDisponivelNumber - 5 > e.target.value
                            ? e.target.value > 0
                              ? e.target.value
                              : 0
                            : saldoDisponivelNumber - 5
                        )
                      }
                      placeholder="Sacar"
                      readOnly={!(saldoDisponivelNumber > 0)}
                      style={{ textAlign: 'right' }}
                      type="number"
                      value={sacar}
                    />
                    <Button
                      block
                      disabled={
                        saldoDisponivelNumber - 5 < sacar ||
                        saldoDisponivelNumber === 0 ||
                        sacar === 0
                      }
                      loading={loadSaque}
                      onClick={onSendSaque}
                      size="large"
                      style={{ marginTop: 10 }}
                      type="primary"
                    >
                      Sacar
                    </Button>
                  </Col>
                  <Col lg={18} md={16} sm={16} xl={18} xs={14}>
                    <Row justify={'space-between'}>
                      <Col>
                        <Typography>Saldo disponível: </Typography>
                      </Col>
                      <Col>
                        <Typography style={{ color: 'var(--color02)' }}>
                          {saldoDisponivel}
                        </Typography>
                      </Col>
                    </Row>
                    <Row justify={'space-between'}>
                      <Col>
                        <Typography>Valor a ser sacado:</Typography>
                      </Col>
                      <Col>
                        <Typography style={{ color: 'var(--color02)' }}>
                          R${' '}
                          {Number(sacar).toLocaleString('pt-br', {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </Typography>
                      </Col>
                    </Row>
                    <Row justify={'space-between'}>
                      <Col>
                        <Typography>Custo do saque:</Typography>
                      </Col>
                      <Col>
                        <Typography style={{ color: 'var(--color02)' }}>
                          R${' '}
                          {Number(5).toLocaleString('pt-br', {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </Typography>
                      </Col>
                    </Row>
                    <Divider style={{ marginTop: 2, marginBottom: 2 }} />
                    <Row justify={'space-between'}>
                      <Col>
                        <Typography style={{ fontWeight: 600 }}>
                          Novo salvo:{' '}
                        </Typography>
                      </Col>
                      <Col>
                        <Typography
                          style={{ fontWeight: 600, color: 'var(--color02)' }}
                        >
                          R${' '}
                          {Number(saldoNovo).toLocaleString('pt-br', {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </Typography>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </CardItem>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <CardItem>
            <Table
              action={action}
              column={column}
              path={'transfer'}
              sorterActive={{
                order: 'DESC',
                selectColumn: 'transfers.created_at',
              }}
              type={'list'}
              useFilter={[
                {
                  type: 'select',
                  name: 'status',
                  label: 'Situação',
                  items: [
                    { value: 'PENDING', label: 'Aguardando' },
                    { value: 'BANK_PROCESSING', label: 'Processando' },
                    { value: 'DONE', label: 'Realizado' },
                    { value: 'CANCELLED', label: 'Cancelado' },
                    { value: 'FAILED', label: 'Falha' },
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
    </PageDefault>
  );
};

export default FinancialMinhaConta;
