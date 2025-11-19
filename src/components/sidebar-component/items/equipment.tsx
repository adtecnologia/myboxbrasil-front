import { IoConstructOutline } from "react-icons/io5";
import { EquipmentPermissionEnum } from "@/enums/permissions/equipment-enum";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const equipmentItems: MenuItemProps = {
  key: "equipamentos",
  label: "Equipamentos",
  icon: <IoConstructOutline />,
  disabled: !verifyConfig(["cmb.list", EquipmentPermissionEnum.GET]),
  children: [
    {
      key: "cacambas",
      label: "Caçambas",
      disabled: !verifyConfig(["cmb.list"]),
    },
    {
      key: "equipamentos",
      label: "Equipamentos",
      disabled: !verifyConfig([EquipmentPermissionEnum.GET]),
    },
  ],
};

export default equipmentItems;
