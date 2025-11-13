/*import { createBrowserRouter } from "react-router-dom";
import type IRoutesAndRoles from "@/interfaces/i-routes-and-roles";
import AppLayout from "@/layouts/app";
import AuthLayout from "@/layouts/auth";
import LoginPage from "@/pages/auth/login";
import ErrorPage from "@/pages/error";
import ProtectedRoute from "./protected-route";
import RedirectIfLogged from "./redirect-if-logged";
import routesAndRoles from "./routes";

function mapRoutesWithProtection(route: IRoutesAndRoles[]): any[] {
  return route.map(({ path, element, index, children }) => ({
    path,
    index,
    element: <ProtectedRoute>{element}</ProtectedRoute>,
    children: children ? mapRoutesWithProtection(children) : undefined,
  }));
}

// routes protected
const onlyRoutes = mapRoutesWithProtection(routesAndRoles);

const routes: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RedirectIfLogged>
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      </RedirectIfLogged>
    ),
  },
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: onlyRoutes,
  },
]);

export default routes;
*/
