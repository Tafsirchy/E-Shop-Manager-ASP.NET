"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, clearToken, getToken, setToken } from "./api";

export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

export interface LoginResult {
  token: string;
  email: string;
  name: string;
  role: string;
  merge?: {
    mergedCartCount: number;
    conflicts?: string[];
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, guestSessionId?: string) => Promise<LoginResult>;
  register: (name: string, email: string, password: string, guestSessionId?: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return getToken();
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      // No stored token: mark the provider ready (async, avoids render cascade).
      void Promise.resolve().then(() => setLoading(false));
      return;
    }

    apiFetch<AuthUser>("/api/auth/me")
      .then(setUser)
      .catch(() => {
        // Token invalid or expired — clear it.
        clearToken();
        setTokenState(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, guestSessionId?: string) => {
    const result = await apiFetch<LoginResult>("/api/auth/login", {
      method: "POST",
      body: { email, password, guestSessionId },
      auth: false,
    });
    setToken(result.token);
    setTokenState(result.token);
    setUser({ email: result.email, name: result.name, role: result.role });
    return result;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, guestSessionId?: string) => {
      const result = await apiFetch<LoginResult>("/api/auth/register", {
        method: "POST",
        body: { name, email, password, guestSessionId },
        auth: false,
      });
      setToken(result.token);
      setTokenState(result.token);
      setUser({ email: result.email, name: result.name, role: result.role });
      return result;
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
