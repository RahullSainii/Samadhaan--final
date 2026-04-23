import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthResponse } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: any) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    api.post('/auth/logout')
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setUser(null);
      });
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.data);
        } catch (error) {
          console.error('Failed to fetch user', error);
          logout();
        }
      }
      setIsLoading(false);
    };
    fetchMe();
  }, [token, logout]);

  const login = async (credentials: any) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { accessToken, refreshToken, user: loggedInUser } = response.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData: any) => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    const { accessToken, refreshToken, user: registeredUser } = response.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
    setUser(registeredUser);
    return registeredUser;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
