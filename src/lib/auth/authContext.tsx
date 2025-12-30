'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

type UserRole = 'admin' | 'viewer' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  login: (password: string, targetRole: 'admin' | 'viewer') => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_COOKIE = 'casa_auth_admin';
const VIEWER_COOKIE = 'casa_auth_viewer';
const COOKIE_EXPIRY = 7; // days

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    // Check cookies on mount
    const adminCookie = Cookies.get(ADMIN_COOKIE);
    const viewerCookie = Cookies.get(VIEWER_COOKIE);

    if (adminCookie === 'authenticated') {
      setIsAuthenticated(true);
      setRole('admin');
    } else if (viewerCookie === 'authenticated') {
      setIsAuthenticated(true);
      setRole('viewer');
    }
    setIsLoading(false);
  }, []);

  const login = (password: string, targetRole: 'admin' | 'viewer'): boolean => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.NEXT_PUBLIC_APP_PASSWORD;
    const viewerPassword = process.env.NEXT_PUBLIC_VIEWER_PASSWORD;

    if (targetRole === 'admin') {
      // If no password is configured, allow access (for development)
      if (!adminPassword) {
        console.warn('No admin password configured. Set NEXT_PUBLIC_ADMIN_PASSWORD to enable authentication.');
        Cookies.set(ADMIN_COOKIE, 'authenticated', { expires: COOKIE_EXPIRY });
        setIsAuthenticated(true);
        setRole('admin');
        return true;
      }

      if (password === adminPassword) {
        Cookies.set(ADMIN_COOKIE, 'authenticated', { expires: COOKIE_EXPIRY });
        setIsAuthenticated(true);
        setRole('admin');
        return true;
      }
    } else if (targetRole === 'viewer') {
      // If no viewer password is configured, allow access (for development)
      if (!viewerPassword) {
        console.warn('No viewer password configured. Set NEXT_PUBLIC_VIEWER_PASSWORD to enable authentication.');
        Cookies.set(VIEWER_COOKIE, 'authenticated', { expires: COOKIE_EXPIRY });
        setIsAuthenticated(true);
        setRole('viewer');
        return true;
      }

      if (password === viewerPassword) {
        Cookies.set(VIEWER_COOKIE, 'authenticated', { expires: COOKIE_EXPIRY });
        setIsAuthenticated(true);
        setRole('viewer');
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    Cookies.remove(ADMIN_COOKIE);
    Cookies.remove(VIEWER_COOKIE);
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, role, login, logout }}>
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
