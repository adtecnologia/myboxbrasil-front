// react libraries

import { Button, Col, InputNumber, Modal, Row, message } from "antd";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import CardItem from "../../../../components/CardItem";
import PageDefault from "../../../../components/PageDefault";
// components
import Table from "../../../../components/Table";
import {
  TableNewButton,
  TableReturnButton,
  TableTrashButton,
} from "../../../../components/Table/buttons";
// services
import { POST_API, POST_CATCH, type PageDefaultProps } from "../../../../services";

const ClientesEspeciais = ({
  type,
  path,
  permission,
}: PageDefaultProps) => {
  const { ID } = useParams();

  // state
  const [action, setAction] = useState(false);
  const [values, setValues] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const handleSaveValue = async (id: string, value: number) => {
    if (!value || value <= 0) {
      message.error("Por favor, insira um valor válido");
      return;
    }

    setLoading((prev) => ({ ...prev, [id]: true }));

    POST_API(`${path}`, { value }, id)
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      })
      .then((_) => {
        message.success("Valor atualizado com sucesso!");
        setAction(!action);
      })
      .catch(POST_CATCH)
      .finally(() => setLoading((prev) => ({ ...prev, [id]: false })));
  };

  // table columns
  const column = [
    {
      title: "Foto",
      dataIndex: "photo",
      table: "photo",
      width: "100px",
      sorter: false,
      align: "center",
      render: (item: any) => <img alt="modelo" src={item.photo} width="100%" />,
    },
    {
      title: "Modelo",
      dataIndex: "name",
      table: "name",
      width: "auto",
      minWidth: "160px",
      sorter: true,
      align: "left",
      render: null,
    },
   {
      title: "Valor",
      dataIndex: "value",
      table: "value",
      width: "250px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row gutter={8} wrap={false}>
          <Col flex="auto">
            <InputNumber
              addonBefore="R$"
              min={0.01}
              placeholder="Valor"
              step={0.01}
              style={{ width: "100%" }}
              type="number"
              value={values[item.id] ?? item.value}
              onChange={(value) =>
                setValues((prev) => ({ ...prev, [item.id]: value || 0 }))
              }
            />
          </Col>
          <Col>
            <Button
              type="primary"
              loading={loading[item.id]}
              onClick={() => handleSaveValue(item.id, values[item.id] ?? item.value)}
            >
              Salvar
            </Button>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <PageDefault
      items={[
        { title: <Link to={type === "list" ? "#" : ".."}>Locatários</Link> },
        { title: `Clientes especiais do cliente (${ID})` },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
          <TableNewButton permission={permission} type={type} />
          <TableTrashButton permission={permission} type={type} />
          <TableReturnButton permission={permission} type={type} />
        </Row>
      }
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

export default ClientesEspeciais;
