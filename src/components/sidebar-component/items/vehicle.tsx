import { PiTruck } from "react-icons/pi";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const vehicleItems: MenuItemProps = {
  key: "veiculos",
  label: "Veículos",
  icon: <PiTruck />,
  disabled: !verifyConfig(["vcl.list"]),
};

export default vehicleItems;
