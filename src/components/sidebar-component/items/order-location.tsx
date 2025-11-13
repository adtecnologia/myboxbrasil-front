import { IoBagHandleOutline } from "react-icons/io5";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const orderLocationItems: MenuItemProps = {
  key: "ordensdelocacao",
  label: "Ordens de Locação",
  icon: <IoBagHandleOutline />,
  disabled: !verifyConfig([
    "ord.agr.list",
    "ord.lcd.list",
    "ord.prc.list",
    "ord.anl.list",
    "ord.agr.cdf.list",
    "ord.cdf.list",
  ]),
  children: [
    {
      key: "ordensdelocacao&entregapendente",
      label: "Entrega pendente",
      disabled: !verifyConfig(["ord.agr.list"]),
    },
    {
      key: "ordensdelocacao&emtransito",
      label: "Em trânsito",
      disabled: !verifyConfig(["ord.ent.list"]),
    },
    {
      key: "ordensdelocacao&locada",
      label: "Locado",
      disabled: !verifyConfig(["ord.lcd.list"]),
    },
    {
      key: "ordensdelocacao&emanalise",
      label: "Em análise",
      disabled: !verifyConfig(["ord.anl.list"]),
    },
    {
      key: "ordensdelocacao&cdfemitido",
      label: "CDF emitido",
      disabled: !verifyConfig(["ord.cdf.list"]),
    },
  ],
};

export default orderLocationItems;
