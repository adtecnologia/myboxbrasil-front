import type { MenuProps } from "antd";
import callItems from "./call";
import commercialSettingItems from "./commercial-setting";
import dashboardItems from "./dashboard";
import documentItems from "./document";
import equipmentItems from "./equipment";
import financialItems from "./financial";
import lgpdItems from "./lgpd";
import locationItems from "./location";
import mySpentItems from "./my-spent";
import ocurrenceItems from "./ocurrence";
import operationalSettingItems from "./operational-setting";
import orderItems from "./order";
import orderLocationItems from "./order-location";
import reportItems from "./report";
import scheduledDeliveryItems from "./scheduled-delivery";
import scheduledWithdrawalItems from "./scheduled-withdrawal";
import solicitationItems from "./solicitation";
import trackingItems from "./tracking";
import userItems from "./user";
import vehicleItems from "./vehicle";

export type MenuItemProps = Required<MenuProps>["items"][number];

const items: MenuItemProps[] = [
  dashboardItems,
  mySpentItems,
  financialItems,
  solicitationItems,
  orderItems,
  scheduledDeliveryItems,
  scheduledWithdrawalItems,
  orderLocationItems,
  documentItems,
  ocurrenceItems,
  equipmentItems,
  vehicleItems,
  userItems,
  callItems,
  trackingItems,
  reportItems,
  lgpdItems,
  locationItems,
  commercialSettingItems,
  operationalSettingItems,
];

export default items;
