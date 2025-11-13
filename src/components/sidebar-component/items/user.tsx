import { IoPeopleOutline } from "react-icons/io5";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const userItems: MenuItemProps = {
  key: "usuarios",
  label: "Usuários",
  icon: <IoPeopleOutline />,
  disabled: !verifyConfig([
    "lct.list",
    "lcd.list",
    "dtf.list",
    "eqp.list",
    "mot.list",
  ]),
  children: [
    {
      key: "usuarios&destinofinal",
      label: "Destino Final",
      disabled: !verifyConfig(["dtf.list"]),
    },
    {
      key: "usuarios&equipe",
      label: "Equipe",
      disabled: !verifyConfig(["eqp.list"]),
    },
    {
      key: "usuarios&locatarios",
      label: "Locatários",
      disabled: !verifyConfig(["lct.list"]),
    },
    {
      key: "usuarios&locadores",
      label: "Locadores",
      disabled: !verifyConfig(["lcd.list"]),
    },
    {
      key: "usuarios&motoristas",
      label: "Motorista",
      disabled: !verifyConfig(["mot.list"]),
    },
    {
      key: "usuarios&prefeituras",
      label: "Prefeituras",
      disabled: !verifyConfig(["hal.list"]),
    },
    {
      key: "usuarios&fiscais",
      label: "Fiscais",
      disabled: !verifyConfig(["tax.list"]),
    },
  ],
};

export default userItems;
