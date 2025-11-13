import { Navigate } from "react-router-dom";
import type IRoute from "@/interfaces/i-route";
import { useSessionStore } from "@/stores/use-session";

const RedirectIfLogged = ({ children }: IRoute) => {
  const { session } = useSessionStore();

  if (session) {
    return <Navigate replace to="/" />;
  }

  return children;
};

export default RedirectIfLogged;
