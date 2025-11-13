import { GoLock } from "react-icons/go";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const lgpdItems: MenuItemProps = {
  key: "lgpd",
  label: "LGPD",
  icon: <GoLock />,
  disabled: !verifyConfig(["acp.list", "trm.list", "plt.list"]),
  children: [
    {
      key: "lgpd&aceites",
      label: "Aceites dos usuários",
      disabled: !verifyConfig(["acp.list"]),
    },
    {
      key: "lgpd&termosdeuso",
      label: "Termos de uso",
      disabled: !verifyConfig(["trm.list"]),
    },
    {
      key: "lgpd&politicadeprivacidade",
      label: "Política de privacidade",
      disabled: !verifyConfig(["plt.list"]),
    },
  ],
};

export default lgpdItems;
