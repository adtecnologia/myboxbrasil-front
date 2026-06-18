import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { documentoToEmail, detectarTipoDocumento, onlyDigits } from "@/lib/auth-utils";

export type ProfileType =
  | "locatario"
  | "locador"
  | "destino"
  | "admin"
  | "prefeitura"
  | "motorista";

export type AppRole = "admin" | "operator" | "viewer";

export interface PersonUserProfile {
  id: string;          // user_roles.id
  tenantId: string;    // locador_id ou 'self'
  tenantName: string;
  profileType: ProfileType;
  role: AppRole;
}

export interface PersonUser {
  id: string;
  name: string;
  email: string;
  documento?: string;
  avatarUrl?: string;
  profiles: PersonUserProfile[];
}

interface AuthState {
  user: PersonUser | null;
  session: Session | null;
  activeProfileId: string | null;
  loading: boolean;

  activeProfile: () => PersonUserProfile | null;
  activeTenantId: () => string | null;
  activeRole: () => AppRole | null;
  activeProfileType: () => ProfileType | null;

  setUser: (user: PersonUser) => void;
  setActiveProfile: (profileId: string) => void;
  setSession: (session: Session | null) => void;
  refreshUser: () => Promise<void>;
  initSession: () => () => void;

  signInWithDocumento: (documento: string, senha: string) => Promise<{ error: string | null }>;
  signUpWithDocumento: (params: {
    documento: string;
    nome: string;
    senha: string;
    emailContato?: string;
    celular?: string;
    telefone?: string;
    initialRole: Exclude<ProfileType, "admin">;
  }) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

async function loadUserFromSession(session: Session): Promise<PersonUser> {
  const userId = session.user.id;

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("*").eq("user_id", userId).eq("ativo", true),
  ]);

  const profiles: PersonUserProfile[] = (roles ?? []).map((r) => ({
    id: r.id,
    tenantId: r.locador_id ?? "self",
    tenantName: "MyBox",
    profileType: r.role as ProfileType,
    role: "admin" as AppRole,
  }));

  return {
    id: userId,
    name: profile?.nome ?? session.user.email ?? "Usuário",
    email: profile?.email ?? session.user.email ?? "",
    documento: profile?.documento,
    avatarUrl: profile?.avatar_url ?? undefined,
    profiles,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      activeProfileId: null,
      loading: true,

      activeProfile: () => {
        const { user, activeProfileId } = get();
        return user?.profiles.find((p) => p.id === activeProfileId) ?? null;
      },
      activeTenantId: () => get().activeProfile()?.tenantId ?? null,
      activeRole: () => get().activeProfile()?.role ?? null,
      activeProfileType: () => get().activeProfile()?.profileType ?? null,

      setUser: (user) => set({ user }),
      setActiveProfile: (profileId) => set({ activeProfileId: profileId }),
      setSession: (session) => set({ session }),

      refreshUser: async () => {
        const session = get().session;
        if (!session) {
          set({ user: null });
          return;
        }
        const user = await loadUserFromSession(session);
        set({ user });
      },

      initSession: () => {
        // Síncrono: atualiza session no estado.
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
          set({ session });
          if (session) {
            // Defer ao próximo tick para evitar deadlocks do supabase-js
            setTimeout(() => {
              loadUserFromSession(session).then((user) => set({ user, loading: false }));
            }, 0);
          } else {
            set({ user: null, activeProfileId: null, loading: false });
          }
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
          set({ session, loading: !!session });
          if (session) {
            loadUserFromSession(session).then((user) => set({ user, loading: false }));
          } else {
            set({ loading: false });
          }
        });

        return () => subscription.subscription.unsubscribe();
      },

      signInWithDocumento: async (documento, senha) => {
        const email = documentoToEmail(documento);
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

        if (!error) {
          return { error: null };
        }

        const digits = onlyDigits(documento);
        if (digits.length === 14) {
          const legacyEmail = `cnpj${email}`;
          const { error: legacyError } = await supabase.auth.signInWithPassword({
            email: legacyEmail,
            password: senha,
          });

          return { error: legacyError?.message ?? null };
        }

        return { error: error.message };
      },

      signUpWithDocumento: async (params) => {
        const digits = onlyDigits(params.documento);
        if (digits.length !== 11 && digits.length !== 14) {
          return { error: "Documento inválido" };
        }
        const tipo_documento = detectarTipoDocumento(params.documento);
        const email = documentoToEmail(params.documento);
        const redirectUrl = `${window.location.origin}/`;

        const { error } = await supabase.auth.signUp({
          email,
          password: params.senha,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              nome: params.nome,
              documento: digits,
              tipo_documento,
              email_contato: params.emailContato ?? null,
              celular: params.celular ? onlyDigits(params.celular) : null,
              telefone: params.telefone ? onlyDigits(params.telefone) : null,
              initial_role: params.initialRole,
            },
          },
        });
        return { error: error?.message ?? null };
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, activeProfileId: null });
      },
    }),
    {
      name: "mybox-auth",
      partialize: (state) => ({ activeProfileId: state.activeProfileId }),
    }
  )
);
