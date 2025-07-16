
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  username: string;
  role: 'superadmin' | 'lv2admin' | 'scorekeeper' | 'user';
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthorized: (allowedRoles: User['role'][]) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://two025-energy-event-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'c815d7ba0b568849563496a6ae9b899c296b209f3d66283d27435d4bba9d794f',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const userData: User = result.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Role-based redirection
        if (userData.role === 'superadmin') {
          router.push('/super-admin-dashboard');
        } else if (userData.role === 'lv2admin') {
          router.push('/lv2-admin-dashboard');
        } else if (userData.role === 'scorekeeper') {
          router.push('/scorekeeper-dashboard');
        } else {
          router.push('/');
        }
      } else {
        throw new Error(result.message || 'Invalid username or password.');
      }
    } catch (error) {
        throw error; // Re-throw the error to be caught by the calling component
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };
  
  const isAuthorized = (allowedRoles: User['role'][]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const value = { user, isLoading, login, logout, isAuthorized };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
