// react libraries

import { Col, Row } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import CardItem from "../../../../components/CardItem";
import PageDefault from "../../../../components/PageDefault";
// components
import Table from "../../../../components/Table";
import {
  TableNewButton,
  TableReturnButton,
  TableTrashButton,
  TableTrCacambaButton,
  TableTrEditButton,
  TableTrRecoverButton,
  TableTrTrashButton,
} from "../../../../components/Table/buttons";
// services
import type { PageDefaultProps } from "../../../../services";

const StationaryBucketModelList = ({
  type,
  path,
  permission,
}: PageDefaultProps) => {
  // state
  const [action, setAction] = useState(false);

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
      title: "Capacidade",
      dataIndex: "m3",
      table: "m3",
      width: "120px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "A",
      dataIndex: "letter_a",
      table: "letter_a",
      width: "90px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "B",
      dataIndex: "letter_b",
      table: "letter_b",
      width: "90px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "C",
      dataIndex: "letter_c",
      table: "letter_c",
      width: "90px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "D",
      dataIndex: "letter_d",
      table: "letter_d",
      width: "90px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "E",
      dataIndex: "letter_e",
      table: "letter_e",
      width: "90px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "F",
      dataIndex: "letter_f",
      table: "letter_f",
      width: "90px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Caçambas",
      dataIndex: "total",
      table: "total",
      width: "120px",
      sorter: false,
      align: "center",
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
          <TableTrCacambaButton
            item={item}
            permission={permission}
            type={type}
          />
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
        {
          title: (
            <Link to={type === "list" ? "#" : ".."}>Modelos de Caçamba</Link>
          ),
        },
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
            <Table action={action} column={column} path={path} type={type} />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default StationaryBucketModelList;
