import { LiaDumpsterSolid } from "react-icons/lia";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const solicitationItems: MenuItemProps = {
  key: "pedirlocacao",
  label: "Solicitar locação",
  icon: <LiaDumpsterSolid size={26} />,
  disabled: !verifyConfig(["pdd.add"]),
};

export default solicitationItems;
