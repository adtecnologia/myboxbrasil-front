import { Navigate } from "react-router-dom";
import type IRoutesAndRoles from "@/interfaces/i-routes-and-roles";
import DashboardPage from "@/pages/app/dashboard";

const baseRoutes: IRoutesAndRoles[] = [
  {
    index: true,
    element: <Navigate to="dashboard" />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
];

const routesAndRoles: IRoutesAndRoles[] = [...baseRoutes];

export default routesAndRoles;
