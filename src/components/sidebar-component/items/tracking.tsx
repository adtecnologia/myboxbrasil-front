import { TbRoute } from "react-icons/tb";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const trackingItems: MenuItemProps = {
  key: "rastreamento",
  label: "Rastreamento",
  icon: <TbRoute />,
  disabled: !verifyConfig(["rou.list"]),
};

export default trackingItems;
