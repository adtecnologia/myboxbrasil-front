// react libraries

import { Col, Row } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import CardItem from "../../../components/CardItem";

// components
import PageDefault from "../../../components/PageDefault";
import Table from "../../../components/Table";
import {
  TableNewButton,
  TableReturnButton,
  TableTrashButton,
  TableTrEditButton,
  TableTrRecoverButton,
  TableTrTrashButton,
} from "../../../components/Table/buttons";
// services
import type { PageDefaultProps } from "../../../services";

const VehicleList = ({ type, path, permission }: PageDefaultProps) => {
  // state
  const [action, setAction] = useState(false);

  // table columns
  const column = [
    {
      title: "Placa",
      dataIndex: "plate",
      table: "plate",
      width: "160px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Renavam",
      dataIndex: "renavam",
      table: "renavam",
      width: "180px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Marca",
      dataIndex: "brand",
      table: "brand",
      width: "180px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Modelo",
      dataIndex: "model",
      table: "model",
      width: "200px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Tipo de Veículo",
      dataIndex: "vehicle_type.name",
      table: "vehicle_types.name",
      width: "auto",
      minWidth: "200px",
      sorter: true,
      align: "left",
      render: null,
    },
    {
      title: "Ações",
      dataIndex: null,
      width: "100px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <TableTrEditButton item={item} permission={permission} type={type} />
          <TableTrTrashButton
            action={() => setAction(!action)}
            item={item}
            path={path}
            permission={permission}
            type={type}
          />
          <TableTrRecoverButton
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

  return (
    <PageDefault
      items={[
        { title: <Link to={type === "list" ? "#" : ".."}>Veículos</Link> },
        { title: type === "list" ? "Lista" : "Lixeira" },
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
            <Table
              action={action}
              column={column}
              path={path}
              type={type}
              useFilter={[
                {
                  type: "search",
                  name: "vehicle_type_id",
                  label: "Tipo de Veículo",
                  url: "/vehicle_type",
                  labelField: ["id", "name"],
                },
              ]}
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default VehicleList;
