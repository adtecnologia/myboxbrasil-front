import {
  Button,
  Col,
  Divider,
  Modal,
  Row,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import {
  TbBarcode,
  TbClock,
  TbFileInvoice,
  TbReceipt,
  TbUserDollar,
} from "react-icons/tb";
import { Oval } from "react-loader-spinner";
import CardItem from "@/components/CardItem";
import CardKPISmall from "@/components/CardKPISmall";
import PageDefault from "@/components/PageDefault";
import Table from "@/components/Table";
import { BillingTypeStatusEnum } from "@/enums/billing-type-enum";
import { InvoicePaymentStatusEnum } from "@/enums/invoice-payment-status-enum";
import { GET_API, POST_API, POST_CATCH } from "@/services";

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

  const returnStyle = (value: string | null) => {
    if (value) {
      return "actions-button";
    }
    return "actions-button disabled";
  };

  const onOpen = (value: string | null) => {
    if (value) {
      window.open(value);
    }
  };

  const formatNumber = (value: number) =>
    Number(value).toLocaleString("pt-br", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

  useEffect(() => {
    GET_API("/me")
      .then((rs) => rs.json())
      .then((res) => {
        setSaldoTotal(
          `R$ ${Number(res.data.total_balance).toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
        );
        setSaldoDisponivel(
          `R$ ${Number(res.data.available_balance).toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
        );
        setSaldoBloqueado(
          `R$ ${Number(res.data.blocked_balance).toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
        );
        setTotalLiquido(
          `R$ ${Number(res.data.net_total).toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
        );
      });
  }, []);

  const column: any = [
    {
      title: "Data e hora",
      dataIndex: "balances.created_at",
      table: "balances.created_at",
      width: "200px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Col>
            <Typography>{item.created_at}</Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Cliente",
      dataIndex: "invoice.client.name",
      table: "clients.name",
      width: "auto",
      minWidth: "260px",
      sorter: false,
      align: "rigth",
      render: null,
    },
    {
      title: "Tipo transação",
      dataIndex: "invoice_splits.type",
      table: "invoice_splits.type",
      width: "140px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Col span={24}>
            <Tag>{item.invoice.payment_method?.name}</Tag>
          </Col>
        </Row>
      ),
    },
    {
      title: "Transação",
      dataIndex: "balances.credit",
      table: "balances.credit",
      width: "140px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"end"} style={{ width: "100%" }}>
          <Col>
            <Typography style={{ display: "flex", alignItems: "center" }}>
              R$ {formatNumber(item.credit)}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "A receber",
      dataIndex: "balances.balance",
      table: "balances.balance",
      width: "140px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"end"} style={{ width: "100%" }}>
          <Col>
            <Typography
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration:
                  item.invoice.status === InvoicePaymentStatusEnum.REFUNDED
                    ? "line-through"
                    : "",
              }}
            >
              R$ {formatNumber(item.balance)}{" "}
              {item.balance > 0 && (
                <Tooltip
                  title={
                    <Row style={{ flexDirection: "column" }}>
                      {item.credit_breakdown.map(
                        (i: any) =>
                          Number(i.amount) > 0 && (
                            <Col key={i.amount}>{i.description}</Col>
                          )
                      )}
                    </Row>
                  }
                >
                  <span className="info">?</span>
                </Tooltip>
              )}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Custos",
      dataIndex: "balances.debit",
      table: "balances.debit",
      width: "140px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"end"} style={{ width: "100%" }}>
          <Col>
            <Typography style={{ display: "flex", alignItems: "center" }}>
              R$ {formatNumber(item.debit)}{" "}
              {item.debit > 0 && (
                <Tooltip
                  title={
                    <Row style={{ flexDirection: "column" }}>
                      {item.debit_breakdown.map(
                        (i: any) =>
                          Number(i.amount) > 0 && (
                            <Col key={i}>
                              {i.description} - R$ {formatNumber(i.amount)}
                            </Col>
                          )
                      )}
                    </Row>
                  }
                >
                  <span className="info">?</span>
                </Tooltip>
              )}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Situação",
      dataIndex: "invoice_splits.balance",
      table: "invoice_splits.balance",
      width: "140px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Col span={24}>
            <Tag color={item.invoice.payment_status.color}>
              {item.invoice.payment_status.name}
            </Tag>
          </Col>
        </Row>
      ),
    },
    {
      title: "Ações",
      width: "100px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Col>
            <Tooltip title="Ver recibo">
              <TbReceipt
                className={returnStyle(item.invoice.transaction_receipt_url)}
                onClick={() => onOpen(item.invoice.transaction_receipt_url)}
                size={18}
              />
            </Tooltip>
          </Col>
          {item.bank_slip_url && (
            <Col>
              <Tooltip title="Boleto">
                <TbBarcode
                  className="actions-button"
                  onClick={() => onOpen(item.invoice.bank_slip_url)}
                  size={18}
                />
              </Tooltip>
            </Col>
          )}
          <Col>
            <Tooltip title="Nota fiscal">
              <TbFileInvoice className="actions-button disabled" size={18} />
            </Tooltip>
          </Col>

          {item.invoice.payment_status.code !==
            InvoicePaymentStatusEnum.REFUNDED &&
            item.invoice.payment_method.key ===
              BillingTypeStatusEnum.CREDIT_CARD &&
            item.invoice.anticipation_requested === 0 && (
              <Col>
                <Tooltip title="Pedir antecipação">
                  <TbClock
                    className="actions-button"
                    onClick={() => onSimulateAntecipation(item)}
                    size={18}
                  />
                </Tooltip>
              </Col>
            )}
        </Row>
      ),
    },
  ];

  const onSimulateAntecipation = (item: any) => {
    setAntLoad(true);
    setModal(true);
    GET_API(`/anticipation/${item.invoice.id}/simulate`)
      .then((rs) => rs.json())
      .then((res) => {
        if (res.errors) {
          Modal.warning({
            title: "Oops!",
            content: res.errors[0].description,
          });
          setModal(false);
          return;
        }
        setAnt(res);
      })
      .catch(POST_CATCH)
      .finally(() => setAntLoad(false));
  };

  const onAntecipation = () => {
    setAntSendLoad(true);
    setModal(true);
    POST_API(`/anticipation/${ant.id}`, {})
      .then((rs) => rs.json())
      .then((_) => {
        setModal(false);
        setAction(!action);
      })
      .catch(POST_CATCH)
      .finally(() => setAntSendLoad(false));
  };

  return (
    <PageDefault
      items={[{ title: "Transações financeiras" }]}
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
              path={"balance"}
              sorterActive={{
                order: "DESC",
                selectColumn: "balances.created_at",
              }}
              type={"list"}
              useFilter={[
                {
                  type: "search",
                  name: "clientId",
                  label: "Cliente",
                  url: "/client",
                  labelField: ["id", "name"],
                },
                {
                  type: "select",
                  name: "paymentType",
                  label: "Tipo de transação",
                  items: [
                    { value: "CREDIT_CARD", label: "Cartão de crédito" },
                    { value: "PIX", label: "Pix" },
                    { value: "BOLETO", label: "Boleto" },
                  ],
                },
                {
                  type: "select",
                  name: "status",
                  label: "Situação",
                  items: [
                    { value: true, label: "Recebido" },
                    { value: false, label: "Aguradando" },
                  ],
                },
                {
                  type: "date",
                  name: "date_start",
                  label: "Data (início)",
                },
                {
                  type: "date",
                  name: "date_end",
                  label: "Data (final)",
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
          <Row justify={"center"}>
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
                style={{ textAlign: "center", fontSize: 20, marginBottom: 6 }}
              >
                Simulação de antecipação
              </Typography>
            </Col>
            <Col span={24} style={{ marginBottom: 10 }}>
              <Row justify={"space-between"}>
                <Col style={{ fontSize: 16 }}>
                  <b>Valor</b>
                </Col>
                <Col style={{ fontSize: 16 }}>
                  R${" "}
                  {Number(ant?.simulated_anticipation?.value).toLocaleString(
                    "pt-br",
                    { maximumFractionDigits: 2 }
                  )}
                </Col>
              </Row>
              <Row justify={"space-between"}>
                <Col style={{ fontSize: 16 }}>
                  <b>Taxa antecipação</b>
                </Col>
                <Col style={{ fontSize: 16 }}>
                  R${" "}
                  {Number(ant?.simulated_anticipation?.fee).toLocaleString(
                    "pt-br",
                    { maximumFractionDigits: 2 }
                  )}
                </Col>
              </Row>
              <Divider style={{ marginTop: 4, marginBottom: 4 }} />
              <Row justify={"space-between"}>
                <Col style={{ fontSize: 16 }}>
                  <b>A receber</b>
                </Col>
                <Col style={{ fontSize: 16, color: "var(--color01)" }}>
                  <b>
                    R${" "}
                    {Number(
                      ant?.simulated_anticipation?.net_value
                    ).toLocaleString("pt-br", { maximumFractionDigits: 2 })}
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
    </PageDefault>
  );
};

export default Financeiro;
