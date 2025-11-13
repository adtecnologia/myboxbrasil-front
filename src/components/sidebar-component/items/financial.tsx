import { IoCashOutline } from "react-icons/io5";
import { getProfileType } from "@/services";
import type { MenuItemProps } from ".";

const financialItems: MenuItemProps = {
  key: "financeiro",
  label: "Financeiro",
  icon: <IoCashOutline />,
  disabled: !(
    getProfileType() === "SELLER" ||
    getProfileType() === "LEGAL_SELLER" ||
    getProfileType() === "SELLER_EMPLOYEE" ||
    getProfileType() === "ADMIN" ||
    getProfileType() === "ADMIN_EMPLOYEE"
  ),
  children: [
    { key: "financeiro&minhaconta", label: "Minha conta", disabled: false },
    {
      key: "financeiro&resumo",
      label:
        getProfileType() === "ADMIN" || getProfileType() === "ADMIN_EMPLOYEE"
          ? "Resumo plataforma"
          : "Resumo",
      disabled: false,
    },
    { key: "financeiro&transacoes", label: "Transações", disabled: false },
    { key: "financeiro&extrato", label: "Extrato", disabled: false },
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

export default financialItems;
