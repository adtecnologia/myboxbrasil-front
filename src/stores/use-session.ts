import { create } from "zustand";
import { persist } from "zustand/middleware";
import type IUserAuth from "@/interfaces/i-user-auth";

interface IUseSessionStore {
  session: IUserAuth | null;
  setSession: (v: IUserAuth | null) => void;
}

const useSessionStore = create<IUseSessionStore>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    { name: "@myboxbrasil:user-session" }
  )
);

export { useSessionStore };
