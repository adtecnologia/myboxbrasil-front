import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Garante que apenas usuários autenticados acessem rotas filhas.
 * Inicializa a sessão do Supabase uma única vez no app.
 */
export const SessionInitializer = ({ children }: { children: React.ReactNode }) => {
  const initSession = useAuthStore((s) => s.initSession);
  useEffect(() => {
    const cleanup = initSession();
    return cleanup;
  }, [initSession]);
  return <>{children}</>;
};

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export const RequireProfile = ({ children }: { children: React.ReactNode }) => {
  const activeProfileId = useAuthStore((s) => s.activeProfileId);
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  if (!activeProfileId) {
    return <Navigate to="/selecionar-perfil" replace />;
  }
  return <>{children}</>;
};
