import api from "@/lib/axios";

/** Raw user shape returned by the backend (`/api/auth/*`). */
interface AuthUser {
  _id?: string;
  id?: string;
  username: string;
  email?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  createdAt?: string;
  [key: string]: unknown;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

/** Map the Mongoose user (with `_id`) into a stable app-facing shape. */
const toAppUser = (user: AuthUser) => ({
  id: user._id ?? user.id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  role: user.role ?? 'user',
  createdAt: user.createdAt,
});

export const authService = {
  getMe: async () => {
    const { data } = await api.get<AuthResponse>("/auth/me");
    return {
      ...data,
      user: data.user ? toAppUser(data.user) : undefined,
    };
  },

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

  register: async (username: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      username,
      email,
      password,
    });
    return {
      ...data,
      user: data.user ? toAppUser(data.user) : undefined,
    };
  },

  googleLogin: async (credential: string) => {
    const { data } = await api.post<AuthResponse>("/auth/google", {
      credential,
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

