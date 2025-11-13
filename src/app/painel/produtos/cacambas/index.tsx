/** biome-ignore-all lint/suspicious/noExplicitAny: sem tipagem */
import { Carousel, Col, Image, Row, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
// components
import CardItem from "@/components/CardItem";
import PageDefault from "@/components/PageDefault";
import Table from "@/components/Table";
import {
  TableNewButton,
  TableReturnButton,
  TableTrashButton,
  TableTrEditButton,
  TableTrRecoverButton,
  TableTrTrashButton,
} from "@/components/Table/buttons";
// services
import {
  formatNumber,
  getProfileType,
  IMAGE_NOT_FOUND,
  type PageDefaultProps,
} from "@/services";

const StationatyBucketList = ({ type, path, permission }: PageDefaultProps) => {
  // states
  const [action, setAction] = useState(false);

  // columns
  const column = [
    {
      title: "Fotos",
      dataIndex: "gallery",
      table: "created_at",
      width: "80px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          {item.gallery.length > 0 ? (
            <Carousel
              arrows={item.gallery.length > 1}
              autoplay
              dots={item.gallery.length > 1}
              style={{ width: "60px" }}
            >
              {item.gallery.map((v: any) => (
                <div key={v.id}>
                  <Image preview={false} src={v.url} width={"100%"} />
                </div>
              ))}
            </Carousel>
          ) : (
            <Image preview={false} src={IMAGE_NOT_FOUND} width={"100%"} />
          )}
        </Row>
      ),
    },
    {
      title: "Locador",
      dataIndex: "provider_name",
      table: "stationary_bucket_types.name",
      width: "300px",
      sorter: true,
      align: "left",
      render: (item: any) => (
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Typography style={{ fontWeight: "700", fontSize: 16 }}>
              {item.provider_name}
            </Typography>
          </Col>
          <Col span={24}>
            <Typography>{item.provider_document_number}</Typography>
          </Col>
        </Row>
      ),
      hide:
        getProfileType() === "SELLER" ||
        getProfileType() === "LEGAL_SELLER" ||
        getProfileType() === "SELLER_EMPLOYEE",
    },
    {
      title: "Modelo",
      dataIndex: "stationary_bucket_type.name",
      table: "stationary_bucket_types.name",
      width: "140px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Tipo Locação",
      dataIndex: "type_local_name",
      table: "type_local_name",
      width: "180px",
      sorter: false,
      align: "center",
      render: null,
    },
    {
      title: "Preço Locação",
      dataIndex: "price_external",
      table: "price_external",
      width: "180px",
      sorter: false,
      align: "left",
      render: (item: any) => (
        <div style={{ width: "100%" }}>
          <Typography>
            Loc. Externa:{" "}
            <span style={{ color: "var(--color01)", float: "right" }}>
              R$ {formatNumber(item.price_external)}
            </span>
          </Typography>
          <Typography>
            Loc. Interna:{" "}
            <span style={{ color: "var(--color01)", float: "right" }}>
              R$ {formatNumber(item.price_internal)}
            </span>
          </Typography>
        </div>
      ),
    },
    {
      title: "Dias Locação",
      dataIndex: "days_external",
      table: "days_external",
      width: "180px",
      sorter: false,
      align: "left",
      render: (item: any) => (
        <div style={{ width: "100%" }}>
          <Typography>
            Loc. Externa:{" "}
            <span style={{ color: "var(--color01)", float: "right" }}>
              Até {item.days_external} dias
            </span>
          </Typography>
          <Typography>
            Loc. Interna:{" "}
            <span style={{ color: "var(--color01)", float: "right" }}>
              Até {item.days_internal} dias
            </span>
          </Typography>
        </div>
      ),
    },
    {
      title: "Tampa",
      dataIndex: "type_lid_name",
      table: "type_lid",
      width: "140px",
      sorter: false,
      align: "center",
      render: null,
    },
    {
      title: "Cores",
      dataIndex: "color",
      table: "color",
      width: "140px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Disponíveis",
      dataIndex: "stock",
      table: "stationary_bucket_group.stock",
      width: "auto",
      minWidth: "140px",
      sorter: false,
      align: "center",
      render: null,
    },
    {
      title: "Ações",
      dataIndex: null,
      width: "120px",
      sorter: false,
      hide:
        getProfileType() === "CITY" ||
        getProfileType() === "ADMIN" ||
        getProfileType() === "ADMIN_EMPLOYEE",
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
        { title: <Link to={type === "list" ? "#" : ".."}>Caçambas</Link> },
        { title: type === "list" ? "Lista" : "Lixeira" },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
          {getProfileType() === "CITY" ? null : (
            <TableNewButton permission={permission} type={type} />
          )}
          {getProfileType() === "CITY" ? null : (
            <TableTrashButton permission={permission} type={type} />
          )}
          {getProfileType() === "CITY" ? null : (
            <TableReturnButton permission={permission} type={type} />
          )}
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
                  name: "type",
                  label: "Modelo",
                  url: "/stationary_bucket_type",
                  labelField: "name",
                },
                {
                  type: "select",
                  name: "type_lid",
                  label: "Tampa",
                  items: [
                    { label: "Tampa Articulada", value: "A" },
                    { label: "Tampa Corrediça", value: "C" },
                    { label: "Sem Tampa", value: "S" },
                  ],
                },
                {
                  type: "select",
                  name: "type_local",
                  label: "Tipo Locação",
                  items: [
                    { label: "Externa", value: "E" },
                    { label: "Interna", value: "I" },
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

export default StationatyBucketList;
