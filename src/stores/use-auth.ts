import { create } from "zustand";
import type IUserAuth from "@/interfaces/i-user-auth";
import { useSessionStore } from "./use-session";

interface IAuthState {
  setAuthentication: ({ user, accessToken }: IUserAuth) => void;
  logout: () => void;
}

const useAuthStore = create<IAuthState>(() => ({
  setAuthentication: ({ user, accessToken }: IUserAuth) => {
    const { setSession } = useSessionStore.getState();
    setSession({ user, accessToken });
  },
  logout: () => {
    const { setSession } = useSessionStore.getState();
    setSession(null);
  },
}));

export { useAuthStore };
