import { GoBriefcase } from "react-icons/go";
import { EquipmentTypePermissionEnum } from "@/enums/permissions/equipment-type-enum";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const commercialSettingItems: MenuItemProps = {
  key: "configuracoescomerciais",
  label: "Config. Comerciais",
  icon: <GoBriefcase />,
  disabled: !verifyConfig([EquipmentTypePermissionEnum.GET, "pym.list"]),
  children: [
    {
      key: "tipos-de-equipamento",
      label: "Categorias",
      disabled: !verifyConfig([EquipmentTypePermissionEnum.GET]),
    },
    {
      key: "configuracoescomerciais&formasdepagamento",
      label: "Formas de pagamento",
      disabled: !verifyConfig(["pym.list"]),
    },
  ],
};

export default commercialSettingItems;
