// components
import { Col, List, Modal, Row, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";
import {
  TbBarcode,
  TbClipboardText,
  TbFileInvoice,
  TbMoneybag,
  TbReceipt,
} from "react-icons/tb";
import CardItem from "@/components/CardItem";
import PageDefault from "@/components/PageDefault";
import Table from "@/components/Table";
import { GET_API, getProfileType } from "@/services";

export default function FaturasFechadas() {
  const [action] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [order, setOrder] = useState<any[]>([]);

  const isSeller =
    getProfileType() === "SELLER" ||
    getProfileType() === "LEGAL_SELLER" ||
    getProfileType() === "SELLER_EMPLOYEE";

  const isCustomer =
    getProfileType() === "CUSTOMER" ||
    getProfileType() === "LEGAL_CUSTOMER" ||
    getProfileType() === "CUSTOMER_EMPLOYEE";

  const formatNumber = (value: number) =>
    Number(value).toLocaleString("pt-br", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

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

  const onLoadOrder = (id: number) => {
    GET_API(`/order_location?invoiceId=${id}`)
      .then((rs) => rs.json())
      .then((res) => {
        setOrder(res.data);
        setOpen(true);
      });
  };

  const column = [
    {
      title: "Abertura",
      dataIndex: "period_start",
      table: "invoices.period_start",
      width: "130px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Vencimento",
      dataIndex: "due_date",
      table: "invoices.due_date",
      width: "130px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Situação",
      dataIndex: "ppayment_status",
      table: "invoices.payment_status",
      width: "150px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row justify={"space-between"} style={{ width: "100%" }}>
          <Col span={24}>
            <Tag color={item.payment_status.color}>
              {item.payment_status.name}
            </Tag>
          </Col>
        </Row>
      ),
    },
    {
      title: "Locador",
      dataIndex: "provider.name",
      table: "providers.name",
      width: "auto",
      minWidth: "200px",
      sorter: true,
      align: "left",
      render: null,
      hide: isSeller,
    },
    {
      title: "Locatário",
      dataIndex: "client.name",
      table: "clients.name",
      width: "auto",
      minWidth: "200px",
      sorter: true,
      align: "left",
      render: null,
      hide: isCustomer,
    },
    {
      title: "Pagamento",
      dataIndex: "payment_method.name",
      table: "invoices.total",
      width: "130px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row justify={"space-between"} style={{ width: "100%" }}>
          <Col span={24}>
            <Tag>{item.payment_method.name}</Tag>
          </Col>
        </Row>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      table: "invoices.total",
      width: "130px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row justify={"space-between"} style={{ width: "100%" }}>
          <Col>
            <Typography>R$</Typography>
          </Col>
          <Col>
            <Typography>{formatNumber(item.total)}</Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Ações",
      dataIndex: null,
      width: "140px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Col>
            <Tooltip title="Ver pedido">
              <TbClipboardText
                className="actions-button"
                onClick={() => onLoadOrder(item.id)}
                size={18}
              />
            </Tooltip>
          </Col>
          {item.bank_slip_url && (
            <Col>
              <Tooltip title="Boleto">
                <TbBarcode
                  className="actions-button"
                  onClick={() => onOpen(item.bank_slip_url)}
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
          {isCustomer && (
            <Col>
              <Tooltip title="Ver fatura">
                <TbMoneybag
                  className={returnStyle(item.invoice_url)}
                  onClick={() => onOpen(item.invoice_url)}
                  size={18}
                />
              </Tooltip>
            </Col>
          )}
          <Col>
            <Tooltip title="Ver recibo">
              <TbReceipt
                className={returnStyle(item.transaction_receipt_url)}
                onClick={() => onOpen(item.transaction_receipt_url)}
                size={18}
              />
            </Tooltip>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <PageDefault
      items={[
        {
          title: "Faturas fechadas",
        },
      ]}
      valid={true}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              action={action}
              column={column}
              defaultFilter={{ status: "closed" }}
              path={"invoices"}
              type={"list"}
            />
          </CardItem>
        </Col>
      </Row>
      <Modal
        {...{ open }}
        footer={false}
        onCancel={() => {
          setOrder([]);
          setOpen(false);
        }}
      >
        <List
          dataSource={order}
          renderItem={(item) => (
            <div
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                borderBottomStyle: "solid",
                borderBottomWidth: 1,
                borderBottomColor: "black",
              }}
            >
              <Typography style={{ fontSize: 16, color: "var(--color01)" }}>
                Pedido #{item.order_id}
              </Typography>
              <Typography>Data do pedido: {item.created_at}</Typography>
              <Typography>Valor: R$ {formatNumber(item.total)}</Typography>
              <Typography>
                Local: {item.client_street} {item.client_number},{" "}
                {item.client_district}, {item.client_city.name}
              </Typography>
            </div>
          )}
        />
      </Modal>
    </PageDefault>
  );
}
