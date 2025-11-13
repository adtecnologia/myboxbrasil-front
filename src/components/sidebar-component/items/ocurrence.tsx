import { LuTriangleAlert } from "react-icons/lu";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const ocurrenceItems: MenuItemProps = {
  key: "ocorrencias",
  label: "Ocorrências",
  icon: <LuTriangleAlert />,
  disabled: !verifyConfig(["ocr.list"]),
};

export default ocurrenceItems;
