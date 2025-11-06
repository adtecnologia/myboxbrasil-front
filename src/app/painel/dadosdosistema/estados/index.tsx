// react libraries
import { useState } from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "antd";

// components
import Table from "../../../../components/Table";
import CardItem from "../../../../components/CardItem";
import PageDefault from "../../../../components/PageDefault";

// services
import { PageDefaultProps } from "../../../../services";

const StateList = ({ type, path, permission }: PageDefaultProps) => {
  
  // states
  const [action] = useState(false);

  // table columns
  const column = [
    { title: "Sigla", dataIndex: "acronym", table: "acronym", width: "80px", sorter: true, align: "center", render: null },
    { title: "Nome", dataIndex: "name", table: "name", width: "auto", minWidth: '200px', sorter: true, align: "left", render: null },
    { title: "IBGE", dataIndex: "ibge_code", table: "ibge_code", width: "100px", sorter: true, align: "center", render: null },
  ];

  return (
    <PageDefault valid={`${permission}.${type}`} items={[
        { title: <Link to={type === "list" ? "#" : ".."}>Estados</Link> },
        { title: type === "list" ? "Lista" : "Lixeira" },
    ]}>
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table column={column} path={path} type={type} action={action} />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default StateList;
