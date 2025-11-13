import { useContext } from "react";

import { PageInfoContext } from "@/contexts/page-info-context";

export const usePageInfo = () => {
  const context = useContext(PageInfoContext);

  if (!context) {
    throw new Error(
      "usePageInfoContext must be used within a PageInfoProvider"
    );
  }

  return context;
};
