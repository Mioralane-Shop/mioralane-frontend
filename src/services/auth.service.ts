import api from "@/lib/axios";

/** Raw user shape returned by the backend (`/api/auth/*`). */
interface AuthUser {
  _id?: string;
  id?: string;
  username: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

/** Map the Mongoose user (with `_id`) into a stable app-facing shape. */
const toAppUser = (user: AuthUser) => ({
  id: user._id ?? user.id,
  username: user.username,
  createdAt: user.createdAt,
});

export const authService = {
  login: async (username: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      username,
      password,
    });
    return {
      ...data,
      user: data.user ? toAppUser(data.user) : undefined,
    };
  },

  register: async (username: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      username,
      password,
    });
    return {
      ...data,
      user: data.user ? toAppUser(data.user) : undefined,
    };
  },

  logout: async () => {
    const { data } = await api.post<AuthResponse>("/auth/logout");
    return data;
  },
};

