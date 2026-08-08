import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/axios";

export interface User {
  id?: string;
  username: string;
  email?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _ready: boolean; // true after hydration + initializeAuth completes
  login: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _ready: false,

      login: (user, token) => {
        // Persist token + user to localStorage
        localStorage.setItem("mioralane-token", token);
        localStorage.setItem("mioralane-user", JSON.stringify(user));

        set({ user, token, isAuthenticated: true, _ready: true });
      },

      logout: () => {
        localStorage.removeItem("mioralane-token");
        localStorage.removeItem("mioralane-user");
        set({ user: null, token: null, isAuthenticated: false, _ready: true });
      },

      initializeAuth: async () => {
        try {
          // 1. Restore from localStorage first (fast, synchronous)
          const storedToken = localStorage.getItem("mioralane-token");
          const storedUser = localStorage.getItem("mioralane-user");

          if (storedToken && storedUser) {
            try {
              const user = JSON.parse(storedUser) as User;
              set({ user, token: storedToken, isAuthenticated: true });

              // 2. Verify with backend in the background
              const { data } = await api.get("/auth/me");
              if (data.success && data.user) {
                const freshUser: User = {
                  id: data.user._id ?? data.user.id,
                  username: data.user.username,
                  email: data.user.email,
                  avatar: data.user.avatar,
                  role: data.user.role ?? 'user',
                  createdAt: data.user.createdAt,
                };
                set({ user: freshUser, isAuthenticated: true });
                localStorage.setItem("mioralane-user", JSON.stringify(freshUser));
              }
            } catch {
              // Corrupted JSON → clear and try cookie-based verification
              localStorage.removeItem("mioralane-user");
              await get().initializeAuth();
              return;
            }
          } else {
            // No localStorage data → try cookie-based verification
            try {
              const { data } = await api.get("/auth/me");
              if (data.success && data.user) {
                const user: User = {
                  id: data.user._id ?? data.user.id,
                  username: data.user.username,
                  email: data.user.email,
                  avatar: data.user.avatar,
                  role: data.user.role ?? 'user',
                  createdAt: data.user.createdAt,
                };
                // Save to localStorage for next load
                localStorage.setItem("mioralane-user", JSON.stringify(user));
                set({ user, isAuthenticated: true });
              }
            } catch {
              // No valid session → stay logged out
            }
          }
        } catch {
          // Network error → keep existing state if any
        } finally {
          set({ _ready: true });
        }
      },
    }),
    {
      name: "mioralane-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return () => {
          useAuthStore.getState().initializeAuth();
        };
      },
    },
  ),
);
