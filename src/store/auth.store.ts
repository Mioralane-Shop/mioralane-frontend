import { create } from "zustand";
import { authService } from "@/services/auth.service";
import {
  clearLegacyAuthStorage,
  registerAuthStateClearer,
} from "@/lib/auth-session";

export interface User {
  id?: string;
  username: string;
  email?: string;
  avatar?: string;
  role?: "user" | "admin";
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  _ready: boolean;
  login: (user: User) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => {
  const clearSession = () => {
    clearLegacyAuthStorage();
    set({ user: null, isAuthenticated: false, _ready: true });
  };

  registerAuthStateClearer(clearSession);

  return {
    user: null,
    isAuthenticated: false,
    _ready: false,

    login: (user) => {
      clearLegacyAuthStorage();
      set({ user, isAuthenticated: true, _ready: true });
    },

    logout: () => {
      clearSession();
    },

    initializeAuth: async () => {
      clearLegacyAuthStorage();
      set({ _ready: false });

      try {
        const { user } = await authService.getMe();

        if (user) {
          set({ user, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      } catch (error) {
        const status =
          typeof error === "object" && error && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;

        if (status === 401) {
          clearSession();
          return;
        }
      } finally {
        set({ _ready: true });
      }
    },
  };
});
