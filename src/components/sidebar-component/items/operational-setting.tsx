import { GoGear } from "react-icons/go";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const operationalSettingItems: MenuItemProps = {
  key: "configuracoesoperacionais",
  label: "Config. Operacionais",
  icon: <GoGear />,
  disabled: !verifyConfig(["tec.list", "mcm.list", "rsd.list", "tvc.list"]),
  children: [
    {
      key: "configuracoesoperacionais&tecnologiatratamento",
      label: "Tecnologia de Tratamento",
      disabled: !verifyConfig(["tec.list"]),
    },
    {
      key: "configuracoesoperacionais&modelosdecacamba",
      label: "Modelos de Caçamba",
      disabled: !verifyConfig(["mcm.list"]),
    },

    {
      key: "configuracoesoperacionais&residuos",
      label: "Classes de Residuo",
      disabled: !verifyConfig(["rsd.list"]),
    },
    {
      key: "configuracoesoperacionais&tiposdeveiculos",
      label: "Tipos de Veículos",
      disabled: !verifyConfig(["tvc.list"]),
    },
  ],
};

export default operationalSettingItems;
