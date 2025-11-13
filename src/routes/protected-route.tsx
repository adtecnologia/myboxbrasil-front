import type React from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type IRoute from "@/interfaces/i-route";
import { useSessionStore } from "@/stores/use-session";

interface IProtectedRoute extends IRoute {
  children: ReactNode;
}

const ProtectedRoute: React.FC<IProtectedRoute> = ({ children }) => {
  const { session } = useSessionStore();

  if (!session) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
