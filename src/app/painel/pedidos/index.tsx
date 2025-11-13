import { Col, Row, Tag, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import { HiDownload } from "react-icons/hi";
// icons
import {
  TbShoppingCartCheck,
  TbShoppingCartOff,
  TbShoppingCartPause,
  TbShoppingCartX,
} from "react-icons/tb";
import { Link } from "react-router-dom";
import { OrderLocationStatusEnum } from "@/enums/order-location-status-enum";
import CardItem from "../../../components/CardItem";
import CardKPISmall from "../../../components/CardKPISmall";
import PageDefault from "../../../components/PageDefault";
// components
import Table from "../../../components/Table";
import {
  TableTrDetailButton,
  TableTrMapButton,
} from "../../../components/Table/buttons";
// services
import { GET_API, type PageDefaultProps } from "../../../services";

const Order = ({ type, path, permission }: PageDefaultProps) => {
  // state
  const [action, setAction] = useState(false);
  const [aguardando, setAguardando] = useState<number>(-1);
  const [aceitos, setAceitos] = useState<number>(-1);
  const [recusados, setRecusados] = useState<number>(-1);
  const [cancelados, setCancelados] = useState<number>(-1);

  // table columns
  const column = [
    {
      title: "Data Abertura",
      dataIndex: "created_at",
      table: "order_locations.created_at",
      width: "180px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Typography>{item.created_at}</Typography>
          <Tag color={item.status.color} style={{ textAlign: "center" }}>
            {item.status.name} <br />
            {item.status.code !== OrderLocationStatusEnum.PENDING
              ? item.updated_at
              : null}
          </Tag>
        </Row>
      ),
    },
    {
      title: "Locatário / Local locação",
      dataIndex: "provider.name",
      table: "order_locations.id",
      width: "auto",
      minWidth: "300px",
      sorter: true,
      align: "left",
      render: (item: any) => (
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Typography>Pedido: n° {item.id}</Typography>
            <Typography>{item.client.name}</Typography>
            <Typography style={{ color: "var(--color02)" }}>
              {item.client_street}, {item.client_number} -{" "}
              {item.client_district} - {item.client_city?.name} /{" "}
              {item.client_city?.state?.acronym}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Quantidade",
      dataIndex: "quantity",
      table: "order_locations.quantity",
      width: "100px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Valor Total",
      dataIndex: "total",
      table: "(order_location.PRICE*order_location.QTDE)",
      width: "160px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row align={"middle"} justify={"center"} style={{ width: "100%" }}>
          <Col>R$ {Number(item.total).toLocaleString("pt-br")}</Col>
        </Row>
      ),
    },
    {
      title: "Situação Caçambas",
      dataIndex: "STATUS_NAME",
      table: "order_location.STATUS",
      width: "300px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row style={{ width: "100%", flexDirection: "column" }}>
          <Col>
            <Typography
              className="cacamba-desc"
              style={{ textAlign: "center" }}
            >
              <span>Modelo {item.product.stationary_bucket_type.name}</span>
            </Typography>
          </Col>
          {item?.items.map((v: any) => (
            <Col key={v.id}>
              <Typography className="cacamba-desc">
                <span>{v.product} - </span>
                {v.status.name}
              </Typography>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      title: "Ações",
      dataIndex: null,
      width: "100px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          {item.order_invoice_url ? (
            <Col>
              <Tooltip title="Nota fiscal">
                <Link target="_blank" to={item.order_invoice_url}>
                  <HiDownload className="actions-button" size={18} />
                </Link>
              </Tooltip>
            </Col>
          ) : null}
          <TableTrDetailButton
            action={() => setAction(!action)}
            item={item}
            path={path}
            permission={permission}
            type={type}
          />
          <TableTrMapButton
            action={() => setAction(!action)}
            item={item}
            path={path}
            permission={permission}
            type={type}
          />
        </Row>
      ),
    },
  ];

  // CARREGAS PEDIDOS POR STATUS
  useEffect(() => {
    setAguardando(-1);
    setAceitos(-1);
    setRecusados(-1);
    setCancelados(-1);

    GET_API("/dashboard/orderbystatus")
      .then((rs) => rs.json())
      .then((res) => {
        setAguardando(res.data.waiting);
        setAceitos(res.data.accepted);
        setRecusados(res.data.refused);
        setCancelados(res.data.canceled);
      });
  }, []);

  return (
    <PageDefault items={[{ title: "Pedidos" }]} valid={`${permission}.${type}`}>
      <Row gutter={[16, 16]}>
        <Col lg={6} md={12} sm={12} xl={6} xs={24}>
          <CardKPISmall
            icon={<TbShoppingCartPause className="card-kpi-small-icon" />}
            title="Aguardando confirmação"
            value={aguardando}
          />
        </Col>
        <Col lg={6} md={12} sm={12} xl={6} xs={24}>
          <CardKPISmall
            icon={<TbShoppingCartCheck className="card-kpi-small-icon" />}
            title="Pedidos aceitos"
            value={aceitos}
          />
        </Col>
        <Col lg={6} md={12} sm={12} xl={6} xs={24}>
          <CardKPISmall
            icon={<TbShoppingCartX className="card-kpi-small-icon" />}
            title="Pedidos recusados"
            value={recusados}
          />
        </Col>
        <Col lg={6} md={12} sm={12} xl={6} xs={24}>
          <CardKPISmall
            icon={<TbShoppingCartOff className="card-kpi-small-icon" />}
            title="Pedidos cancelados"
            value={cancelados}
          />
        </Col>
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              action={action}
              column={column}
              defaultFilter={{ TYPE_USER: "PROVIDER_ID" }}
              path={path}
              sorterActive={{ selectColumn: "-created_at" }}
              type={type}
              useFilter={[
                {
                  type: "select",
                  label: "Situação",
                  name: "status",
                  items: [
                    {
                      label: "Aguardando confirmação",
                      value: OrderLocationStatusEnum.PENDING,
                    },
                    {
                      label: "Pedido aceito",
                      value: OrderLocationStatusEnum.ACCEPTED,
                    },
                    {
                      label: "Pedido recusado",
                      value: OrderLocationStatusEnum.REJECTED,
                    },
                    {
                      label: "Pedido cancelado",
                      value: OrderLocationStatusEnum.CANCELED,
                    },
                  ],
                },
              ]}
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default Order;
