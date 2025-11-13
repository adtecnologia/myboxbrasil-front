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
  TableTrEditButton,
  TableTrRecoverButton,
  TableTrTrashButton,
} from "../../../../components/Table/buttons";
// services
import { getProfileType, type PageDefaultProps } from "../../../../services";

const TeamList = ({ type, path, permission }: PageDefaultProps) => {
  // states
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
      render: null,
    },
    {
      title: "E-mail",
      dataIndex: "email",
      table: "email",
      width: "300px",
      sorter: true,
      align: "left",
      render: null,
    },
    {
      title: "Login",
      dataIndex: "document_number",
      table: "document_number",
      width: "200px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "CNH",
      dataIndex: "cnh",
      table: "cnh",
      width: "160px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Vencimento CNH",
      dataIndex: "cnh_expiration_date_format",
      table: "cnh_expiration_date",
      width: "160px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Ações",
      dataIndex: null,
      width: "100px",
      sorter: false,
      align: "center",
      hide:
        getProfileType() === "ADMIN" || getProfileType() === "ADMIN_EMPLOYEE",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <TableTrEditButton item={item} permission={permission} type={type} />
          <TableTrTrashButton
            action={() => setAction(!action)}
            item={item}
            path="user"
            permission={permission}
            type={type}
          />
          <TableTrRecoverButton
            action={() => setAction(!action)}
            item={item}
            path="user"
            permission={permission}
            type={type}
          />
          {/* <TableTrPassword type={type} permission={permission} item={item} action={() => setAction(!action)} path="user"/> */}
        </Row>
      ),
    },
  ];

  return (
    <PageDefault
      items={[
        { title: <Link to={type === "list" ? "#" : ".."}>Motorista</Link> },
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

export default TeamList;
