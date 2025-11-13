import { IoConstructOutline } from "react-icons/io5";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const equipmentItems: MenuItemProps = {
  key: "equipamentos",
  label: "Equipamentos",
  icon: <IoConstructOutline />,
  disabled: !verifyConfig(["cmb.list"]),
  children: [
    {
      key: "acesso-e-elevacao",
      label: "Acesso e Elevação",
      disabled: !verifyConfig(["and.list"]),
    },
    {
      key: "andaimes",
      label: "Andaimes",
      disabled: !verifyConfig(["and.list"]),
    },
    {
      key: "cacambas",
      label: "Caçambas",
      disabled: !verifyConfig(["cmb.list"]),
    },
    {
      key: "compactacao",
      label: "Compactação",
      disabled: !verifyConfig(["btn.list"]),
    },
    {
      key: "concretagem",
      label: "Concretagem",
      disabled: !verifyConfig(["emp.list"]),
    },
    {
      key: "containers",
      label: "Containers",
      disabled: !verifyConfig(["emp.list"]),
    },
    {
      key: "empilhadeiras",
      label: "Empilhadeiras",
      disabled: !verifyConfig(["emp.list"]),
    },
    {
      key: "ferramentas-eletricas",
      label: "Ferramentas Elétricas",
      disabled: !verifyConfig(["emp.list"]),
    },
    {
      key: "furacao-demolicao",
      label: "Furação e Demolição",
      disabled: !verifyConfig(["emp.list"]),
    },
    {
      key: "outros-equipamentos",
      label: "Outros Equipamentos",
      disabled: !verifyConfig(["emp.list"]),
    },
  ],
};

export default equipmentItems;
