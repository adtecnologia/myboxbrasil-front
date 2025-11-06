// react libraries
import { useState } from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "antd";

// components
import Table from "../../../../components/Table";
import CardItem from "../../../../components/CardItem";
import PageDefault from "../../../../components/PageDefault";
import { TableNewButton, TableReturnButton, TableTrEditButton, TableTrPassword, TableTrRecoverButton, TableTrTrashButton, TableTrashButton } from "../../../../components/Table/buttons";

// services
import { PageDefaultProps } from "../../../../services";

const TaxList = ({ type, path, permission }: PageDefaultProps) => {
  
  // states
  const [action, setAction] = useState(false);

  // table columns
  const column = [
    { title: "Nome", dataIndex: "name", table: "name", width: "auto", minWidth: '200px', sorter: true, align: "left", render: null },
    { title: "E-mail", dataIndex: "email", table: "email", width: "250px", sorter: true, align: "left", render: null },
    { title: "Login", dataIndex: "document_number", table: "document_number", width: "200px", sorter: true, align: "center", render: null },
    { title: "Ações", dataIndex: null, width: "100px", sorter: false, align: "center", render: (item: any) => (
      <Row justify={"center"} style={{ width: "100%" }}>
        <TableTrEditButton type={type} permission={permission} item={item} />
        <TableTrTrashButton type={type} permission={permission} item={item} action={() => setAction(!action)} path="user"/>
        <TableTrRecoverButton type={type} permission={permission} item={item} action={() => setAction(!action)} path="user"/>
        {/* <TableTrPassword type={type} permission={permission} item={item} action={() => setAction(!action)} path="user"/> */}
      </Row>
    )},
  ];

  return (
    <PageDefault valid={`${permission}.${type}`} items={[
      { title: <Link to={type === "list" ? "#" : ".."}>Fiscais</Link> },
      { title: type === "list" ? "Lista" : "Lixeira" },
    ]} options={
      <Row justify={"end"} gutter={[8, 8]}>
        <TableNewButton type={type} permission={permission} />
        <TableTrashButton type={type} permission={permission} />
        <TableReturnButton type={type} permission={permission} />
      </Row>
    }>
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              column={column}
              path={path}
              type={type}
              action={action}
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default TaxList;
