import { Col, Row, Tag } from "antd";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import CardItem from "../../../../components/CardItem";
import PageDefault from "../../../../components/PageDefault";
// components
import Table from "../../../../components/Table";
import { TableReturnButton } from "../../../../components/Table/buttons";
// services
import type { PageDefaultProps } from "../../../../services";

const StationaryBucketModelItensList = ({
  type,
  permission,
}: PageDefaultProps) => {
  // state
  const [action] = useState(false);

  // params
  const { ID } = useParams();

  // table columns
  const column = [
    {
      title: "Código",
      dataIndex: "code",
      table: "code",
      width: "300px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Locador",
      dataIndex: "stationary_bucket_group.provider_name",
      table: "stationary_bucket_groups.id",
      width: "auto",
      minWidth: "200px",
      sorter: false,
      align: "left",
      render: null,
    },
    {
      title: "Disponível?",
      dataIndex: "is_available",
      table: "is_available",
      width: "140px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Tag
            color={item.is_available.color}
            style={{
              margin: 0,
            }}
          >
            {item.is_available.name}
          </Tag>
        </Row>
      ),
    },
    {
      title: "Em manutenção?",
      dataIndex: "is_under_maintenance",
      table: "is_under_maintenance",
      width: "160px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Tag
            color={item.is_under_maintenance.color}
            style={{
              margin: 0,
            }}
          >
            {item.is_under_maintenance.name}
          </Tag>
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
        { title: "Caçambas" },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
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
              defaultFilter={{ type: ID }}
              path={"stationary_bucket"}
              type={type}
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default StationaryBucketModelItensList;
