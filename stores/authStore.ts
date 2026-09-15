import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "customer" | "broker";

type AuthState = {
  accessToken: string | null;
  userRole: UserRole | null;

  setAuth: (accessToken: string, userRole: UserRole) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userRole: null,

      setAuth: (accessToken, userRole) => {
        set({
          accessToken,
          userRole,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          userRole: null,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);