import { IoDocumentAttachOutline } from "react-icons/io5";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const documentItems: MenuItemProps = {
  key: "documentos",
  label: "Documentos",
  icon: <IoDocumentAttachOutline />,
  disabled: !verifyConfig(["mtr.list"]),
};

export default documentItems;
