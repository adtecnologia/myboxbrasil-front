import { IoNewspaperOutline } from "react-icons/io5";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const orderItems: MenuItemProps = {
  key: "pedidos",
  label: "Pedidos Locação",
  icon: <IoNewspaperOutline />,
  disabled: !verifyConfig(["pdd.list"]),
};

export default orderItems;
