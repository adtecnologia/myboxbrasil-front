import type { ReactNode } from "react";

interface IRoutesAndRoles {
  index?: boolean;
  path?: string;
  element: ReactNode;
  children?: IRoutesAndRoles[];
}

export default IRoutesAndRoles;
