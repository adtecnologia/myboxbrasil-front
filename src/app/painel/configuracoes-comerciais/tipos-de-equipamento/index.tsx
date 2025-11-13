// react libraries

import { Col, Modal, Row, Tag } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import CardItem from "@/components/CardItem";
// components
import PageDefault from "@/components/PageDefault";
import Table from "@/components/Table";
import { TableTrEditButton } from "@/components/Table/buttons";
import { EquipmentTypePermissionEnum } from "@/enums/permissions/equipment-type-enum";
// services
import {
  IMAGE_NOT_FOUND,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from "@/services";

export default function EquipmentTypePage({
  type,
  path,
  permission,
}: PageDefaultProps) {
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
      render: (item: any) => (
        <img
          alt="tipo-de-equipamento-foto"
          src={item.photo ?? IMAGE_NOT_FOUND}
          width="100%"
        />
      ),
    },
    {
      title: "Tipo de equipamento",
      dataIndex: "name",
      table: "name",
      width: "200px",
      sorter: true,
      align: "left",
      render: null,
    },
    {
      title: "Descrição",
      dataIndex: "description",
      table: "description",
      width: "auto",
      minWidth: "300px",
      sorter: true,
      align: "left",
      render: null,
    },
    {
      title: "Ativo",
      dataIndex: "is_active",
      table: "is_active",
      width: "150px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Tag
            color={item.is_active.color}
            onClick={() => onChange(item, item.is_active.name === "Ativo")}
            style={{
              margin: 0,
              width: "100%",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            {item.is_active.name}
          </Tag>
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
          <TableTrEditButton item={item} permission={permission} type={type} />
        </Row>
      ),
    },
  ];

  const onChange = (item: any, field: boolean) => {
    Modal.confirm({
      title: "Atenção",
      content: `Deseja alterar status para ${field ? "Inativo" : "Ativo"}?`,
      okText: "Sim",
      cancelText: "Não",
      onOk: () => {
        POST_API(`/${path}`, { is_active: field ? 0 : 1 }, item.id)
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
            <Link to={type === "list" ? "#" : ".."}>Tipos de equipamento</Link>
          ),
        },
        { title: type === "list" ? "Lista" : "Lixeira" },
      ]}
      valid={EquipmentTypePermissionEnum.GET}
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
}
