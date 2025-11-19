import { IoCashOutline } from "react-icons/io5";
import { getProfileType } from "@/services";
import type { MenuItemProps } from ".";

const mySpentItems: MenuItemProps = {
  key: "despesas",
  label: "Despesas",
  icon: <IoCashOutline />,
  disabled: !(
    getProfileType() === "CUSTOMER" ||
    getProfileType() === "LEGAL_CUSTOMER" ||
    getProfileType() === "CUSTOMER_EMPLOYEE"
  ),
  children: [
    { key: "despesas", label: "Despesas", disabled: false },
    {
      key: "despesas&faturasabertas",
      label: "Faturas em aberto",
      disabled: false,
    },
    {
      key: "despesas&faturasfechadas",
      label: "Faturas em fechadas",
      disabled: false,
    },
  ],
};

export default mySpentItems;
