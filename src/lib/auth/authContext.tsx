'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { UserRole } from './session';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  csrfToken: string | null;
  login: (password: string, targetRole: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

interface SessionResponse {
  authenticated: boolean;
  role: UserRole | null;
  csrfToken: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const applySession = useCallback((session: SessionResponse) => {
    setIsAuthenticated(session.authenticated);
    setRole(session.role);
    setCsrfToken(session.csrfToken);
  }, []);

  const clearSession = useCallback(() => {
    setIsAuthenticated(false);
    setRole(null);
    setCsrfToken(null);
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        clearSession();
        return;
      }

      const session = (await response.json()) as SessionResponse;
      applySession(session);
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (password: string, targetRole: UserRole): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, role: targetRole }),
      });

      if (!response.ok) {
        clearSession();
        return false;
      }

      const session = (await response.json()) as SessionResponse;
      applySession(session);
      return session.authenticated;
    } catch {
      clearSession();
      return false;
    }
  }, [applySession, clearSession]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        role,
        csrfToken,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
