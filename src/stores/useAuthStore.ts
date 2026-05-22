import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProfileType = "locatario" | "locador" | "destino" | "admin" | "prefeitura" | "motorista";
export type AppRole = "admin" | "operator" | "viewer";

export interface PersonUserProfile {
  id: string;
  tenantId: string;
  tenantName: string;
  profileType: ProfileType;
  role: AppRole;
}

export interface PersonUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  profiles: PersonUserProfile[];
}

interface AuthState {
  user: PersonUser | null;
  activeProfileId: string | null;

  // Derived helpers
  activeProfile: () => PersonUserProfile | null;
  activeTenantId: () => string | null;
  activeRole: () => AppRole | null;
  activeProfileType: () => ProfileType | null;

  // Actions
  setUser: (user: PersonUser) => void;
  setActiveProfile: (profileId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeProfileId: null,

      activeProfile: () => {
        const { user, activeProfileId } = get();
        return user?.profiles.find((p) => p.id === activeProfileId) ?? null;
      },

      activeTenantId: () => get().activeProfile()?.tenantId ?? null,

      activeRole: () => get().activeProfile()?.role ?? null,

      activeProfileType: () => get().activeProfile()?.profileType ?? null,

      setUser: (user) => set({ user }),

      setActiveProfile: (profileId) => set({ activeProfileId: profileId }),

      logout: () => set({ user: null, activeProfileId: null }),
    }),
    {
      name: "mybox-auth",
    }
  )
);
