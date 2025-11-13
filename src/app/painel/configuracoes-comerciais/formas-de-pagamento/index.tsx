import { Col, Modal, Row, Tag, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import CardItem from "../../../../components/CardItem";
import PageDefault from "../../../../components/PageDefault";
// components
import Table from "../../../../components/Table";

// services
import {
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from "../../../../services";

const PaymentMethodList = ({ type, path, permission }: PageDefaultProps) => {
  // state
  const [action, setAction] = useState(false);

  // table columns
  const column = [
    {
      title: "Nome",
      dataIndex: "name",
      table: "name",
      width: "auto",
      minWidth: "200px",
      sorter: true,
      align: "left",
      render: (item: any) => <Typography>{item.name}</Typography>,
    },
    {
      title: "Ativo",
      dataIndex: "active",
      table: "active",
      width: "150px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Tag
            color={item.active.color}
            onClick={() => onChange(item, item.active.name === "Sim")}
            style={{
              margin: 0,
              width: "100%",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            {item.active.name}
          </Tag>
        </Row>
      ),
    },
  ];

  const onChange = (item: any, field: boolean) => {
    Modal.confirm({
      title: "Atenção",
      content: `Deseja alterar o valor para ${field ? "NÃO" : "SIM"}?`,
      okText: "Sim",
      cancelText: "Não",
      onOk: () => {
        POST_API(`/${path}`, { active: field ? 0 : 1 }, item.id)
          .then((rs) => {
            if (rs.ok) {
              setAction(!action);
            } else {
              Modal.warning({
                title: "Algo deu errado",
                content: rs.statusText,
              });
            }
          })
          .catch(POST_CATCH);
      },
    });
  };

  return (
    <PageDefault
      items={[
        {
          title: (
            <Link to={type === "list" ? "#" : ".."}>Formas de pagamento</Link>
          ),
        },
        { title: type === "list" ? "Lista" : "Lixeira" },
      ]}
      valid={`${permission}.${type}`}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table action={action} column={column} path={path} type={type} />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default PaymentMethodList;
