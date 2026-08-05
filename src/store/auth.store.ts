import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("mioralane-token", token);
        }
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("mioralane-token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "mioralane-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
