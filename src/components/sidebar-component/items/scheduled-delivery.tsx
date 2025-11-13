import { TbCalendarEvent } from "react-icons/tb";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const scheduledDeliveryItems: MenuItemProps = {
  key: "entregasagendadas",
  label: "Entregas Agendadas",
  icon: <TbCalendarEvent />,
  disabled: !verifyConfig(["fmt.vep"]),
};

export default scheduledDeliveryItems;
