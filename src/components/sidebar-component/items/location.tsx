import { TbMapPin } from "react-icons/tb";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const locationItems: MenuItemProps = {
  key: "localidades",
  label: "Localidades",
  icon: <TbMapPin />,
  disabled: !verifyConfig(["std.list", "cdd.list"]),
  children: [
    {
      key: "localidades&estados",
      label: "Estados",
      disabled: !verifyConfig(["std.list"]),
    },
    {
      key: "localidades&cidades",
      label: "Cidades",
      disabled: !verifyConfig(["cdd.list"]),
    },
  ],
};

export default locationItems;
