import { TbCalendarCheck } from "react-icons/tb";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const scheduledWithdrawalItems: MenuItemProps = {
  key: "retiradasagendadas",
  label: "Retiradas Agendadas",
  icon: <TbCalendarCheck />,
  disabled: !verifyConfig(["fmt.vrp"]),
};

export default scheduledWithdrawalItems;
