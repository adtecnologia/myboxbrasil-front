import { Col, Row, Tabs, type TabsProps } from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
// components
import CardItem from "@/components/CardItem";
import PageDefault from "@/components/PageDefault";
import { TableReturnButton } from "@/components/Table/buttons";
import { EquipmentPermissionEnum } from "@/enums/permissions/equipment-enum";
// services
import type { PageDefaultProps } from "@/services";
// tabs
import EquipmentGallery from "./gallery";
import EquipmentForm from "./info";
import EquipmentItensList from "./itens";

export default function EquipmentTabs({ type }: PageDefaultProps) {
  const [selectedTab, setSelectedTab] = useState<string>("1");

  const tabs: TabsProps["items"] = useMemo(
    () => [
      {
        key: "1",
        label: "Equipamento",
        children: (
          <EquipmentForm
            nextTab={() => setSelectedTab("2")}
            path="equipment"
            type={type}
          />
        ),
      },
      {
        key: "2",
        label: "Galeria",
        children: (
          <EquipmentGallery
            backTab={() => setSelectedTab("1")}
            nextTab={() => setSelectedTab("3")}
            path="equipment_gallery"
            permission="cmb"
          />
        ),
        disabled: type === "add",
      },
      {
        key: "3",
        label: "Estoque",
        children: (
          <EquipmentItensList
            backTab={() => setSelectedTab("2")}
            path="equipment_itens"
            permission="cmb"
            type="list"
          />
        ),
        disabled: type === "add",
      },
    ],
    [type]
  );

  return (
    <PageDefault
      items={[
        { title: <Link to={type === "list" ? "#" : ".."}>Equipamentos</Link> },
        { title: type === "add" ? "Novo" : "Editar" },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
          <TableReturnButton permission={true} type={type} />
        </Row>
      }
      valid={
        type === "add"
          ? EquipmentPermissionEnum.STORE
          : EquipmentPermissionEnum.UPDATE
      }
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Tabs
              activeKey={selectedTab}
              items={tabs}
              onTabClick={setSelectedTab}
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
}
