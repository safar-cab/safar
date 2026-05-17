import { createContext, useState, useCallback, type ReactNode } from 'react';
import api from '@/lib/api';
import type { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: Pick<User, '_id' | 'name' | 'phone' | 'email' | 'role'> | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string, portal: 'customer' | 'driver' | 'admin') => Promise<void>;
  register: (data: { name: string; phone: string; email?: string; password: string }, portal: 'customer' | 'driver') => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const isLoading = false;

  const login = useCallback(async (phone: string, password: string, portal: 'customer' | 'driver' | 'admin') => {
    const endpoint = portal === 'admin'
      ? '/admin/auth/login'
      : portal === 'driver'
        ? '/driver/auth/login'
        : '/customer/auth/login';

    const data = await api.post(endpoint, { phone, password }) as unknown as AuthResponse;
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (formData: { name: string; phone: string; email?: string; password: string }, portal: 'customer' | 'driver') => {
    const endpoint = portal === 'driver' ? '/driver/auth/register' : '/customer/auth/register';
    const data = await api.post(endpoint, formData) as unknown as AuthResponse;
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
