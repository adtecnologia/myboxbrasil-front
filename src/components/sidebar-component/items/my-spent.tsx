import { IoCashOutline } from "react-icons/io5";
import { getProfileType } from "@/services";
import type { MenuItemProps } from ".";

const mySpentItems: MenuItemProps = {
  key: "gastos",
  label: "Meus gastos",
  icon: <IoCashOutline />,
  disabled: !(
    getProfileType() === "CUSTOMER" ||
    getProfileType() === "LEGAL_CUSTOMER" ||
    getProfileType() === "CUSTOMER_EMPLOYEE"
  ),
  children: [
    { key: "gastos&meusgastos", label: "Meus gastos", disabled: false },
    {
      key: "gastos&faturasabertas",
      label: "Faturas em aberto",
      disabled: false,
    },
    {
      key: "gastos&faturasfechadas",
      label: "Faturas em fechadas",
      disabled: false,
    },
  ],
};

export default mySpentItems;
