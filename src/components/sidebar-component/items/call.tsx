import { IoHeadsetOutline } from "react-icons/io5";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const callItems: MenuItemProps = {
  key: "atendimento",
  label: "Atendimento",
  icon: <IoHeadsetOutline />,
  disabled: !verifyConfig(["ctt.list", "tkt.list"]),
  children: [
    {
      key: "atendimento&contatos",
      label: "Mensagens do site",
      disabled: !verifyConfig(["ctt.list"]),
    },
    {
      key: "atendimento&chamados",
      label: "Chamados",
      disabled: !verifyConfig(["tkt.list"]),
    },
  ],
};

export default callItems;
