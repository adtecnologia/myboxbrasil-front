/** biome-ignore-all lint/suspicious/noExplicitAny: sem tipagem */
import { Carousel, Col, Image, Row, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
// components
import CardItem from "@/components/CardItem";
import PageDefault from "@/components/PageDefault";
import Table from "@/components/Table";
import {
  TableNewButtonNew,
  TableTrEditButton,
  TableTrRecoverButton,
  TableTrTrashButton,
} from "@/components/Table/buttons";
import { EquipmentPermissionEnum } from "@/enums/permissions/equipment-enum";
import { ProfileTypeEnum } from "@/enums/profile-type-enum";
// services
import {
  formatNumber,
  getProfileType,
  IMAGE_NOT_FOUND,
  type PageDefaultProps,
} from "@/services";

const EquipmentList = ({ type, path, permission }: PageDefaultProps) => {
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
      title: "Tipo de equipamento",
      dataIndex: "equipment_type.name",
      table: "equipment_types.name",
      width: "200px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Valores",
      dataIndex: "rental_price_day",
      table: "rental_price_day",
      width: "180px",
      sorter: false,
      align: "left",
      render: (item: any) => (
        <div style={{ width: "100%" }}>
          <Typography>
            Diária:{" "}
            <span style={{ color: "var(--color01)", float: "right" }}>
              R$ {formatNumber(item.rental_price_day)}
            </span>
          </Typography>
          <Typography>
            Semanal:{" "}
            <span style={{ color: "var(--color01)", float: "right" }}>
              R$ {formatNumber(item.rental_price_week)}
            </span>
          </Typography>
          <Typography>
            Quinzenal:{" "}
            <span style={{ color: "var(--color01)", float: "right" }}>
              R$ {formatNumber(item.rental_price_fortnight)}
            </span>
          </Typography>
          <Typography>
            Mensal:{" "}
            <span style={{ color: "var(--color01)", float: "right" }}>
              R$ {formatNumber(item.rental_price_month)}
            </span>
          </Typography>
        </div>
      ),
    },
    {
      title: "Disponíveis",
      dataIndex: "stock",
      table: "stock",
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
        { title: <Link to={type === "list" ? "#" : ".."}>Equipamentos</Link> },
        { title: type === "list" ? "Lista" : "Lixeira" },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
          {(getProfileType() === ProfileTypeEnum.SELLER ||
            getProfileType() === ProfileTypeEnum.LEGAL_SELLER ||
            getProfileType() === ProfileTypeEnum.SELLER_EMPLOYEE) && (
            <TableNewButtonNew permission={EquipmentPermissionEnum.STORE} />
          )}
        </Row>
      }
      valid={EquipmentPermissionEnum.GET}
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
                  label: "Tippo de equipamento",
                  url: "/equipment-type",
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

export default EquipmentList;
