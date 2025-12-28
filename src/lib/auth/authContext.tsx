'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const COOKIE_NAME = 'inad_auth';
const COOKIE_EXPIRY = 7; // days

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check cookie on mount
    const authCookie = Cookies.get(COOKIE_NAME);
    setIsAuthenticated(authCookie === 'authenticated');
    setIsLoading(false);
  }, []);

  const login = (password: string): boolean => {
    const correctPassword = process.env.NEXT_PUBLIC_APP_PASSWORD;

    // If no password is configured, allow access (for development)
    if (!correctPassword) {
      console.warn('No password configured. Set NEXT_PUBLIC_APP_PASSWORD to enable authentication.');
      Cookies.set(COOKIE_NAME, 'authenticated', { expires: COOKIE_EXPIRY });
      setIsAuthenticated(true);
      return true;
    }

    if (password === correctPassword) {
      Cookies.set(COOKIE_NAME, 'authenticated', { expires: COOKIE_EXPIRY });
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    Cookies.remove(COOKIE_NAME);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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
