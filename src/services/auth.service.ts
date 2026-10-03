import api from "@/lib/axios";
import { clearCsrfToken, setCsrfToken } from "@/lib/csrf";

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
  user?: AuthUser;
  /**
   * Session-bound CSRF token (P1.1), echoed back as `X-CSRF-Token` on
   * state-changing requests. `null` when the API could not derive one.
   */
  csrfToken?: string | null;
}

/**
 * Stores the token and returns everything else.
 *
 * The token is kept out of the value handed back to components on purpose: it
 * is a session credential, and React state / a React Query cache is somewhere
 * it could be rendered, serialized or shipped to an error reporter by accident.
 */
const captureSession = (data: AuthResponse): Omit<AuthResponse, "csrfToken"> => {
  setCsrfToken(data.csrfToken);

  return { success: data.success, message: data.message, user: data.user };
};

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
    const session = captureSession(data);

    return {
      ...session,
      user: session.user ? toAppUser(session.user) : undefined,
    };
  },

  login: async (username: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      username,
      password,
    });
    const session = captureSession(data);

    return {
      ...session,
      user: session.user ? toAppUser(session.user) : undefined,
    };
  },

  register: async (username: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      username,
      email,
      password,
    });
    const session = captureSession(data);

    return {
      ...session,
      user: session.user ? toAppUser(session.user) : undefined,
    };
  },

  googleLogin: async (credential: string) => {
    const { data } = await api.post<AuthResponse>("/auth/google", {
      credential,
    });
    const session = captureSession(data);

    return {
      ...session,
      user: session.user ? toAppUser(session.user) : undefined,
    };
  },

  logout: async () => {
    try {
      const { data } = await api.post<AuthResponse>("/auth/logout");

      return data;
    } finally {
      // Runs even when the request fails: the cookie is cleared server-side, and
      // a token whose session may be gone must not stay in memory either.
      clearCsrfToken();
    }
  },
};

