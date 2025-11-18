import { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import { LOCAL_STORAGE_USER_KEY, LOCAL_STORAGE_PASSWORD_KEY } from '../constants';

// In a real app, this would be an async API call. We'll simulate that.
const fakeApiCall = (delay = 500) => new Promise(resolve => setTimeout(resolve, delay));

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const login = useCallback((username: string, password: string): boolean => {
    const storedPassword = localStorage.getItem(LOCAL_STORAGE_PASSWORD_KEY) || 'password';
    // Mock user validation
    if (username === 'admin' && password === storedPassword) {
      const newUser = { username };
      setUser(newUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    // Note: We don't clear logs, api key or data on logout for persistence demonstration
  }, []);
  
  const changePassword = useCallback(async (currentPassword, newPassword): Promise<{ success: boolean; error?: string }> => {
    await fakeApiCall(); // Simulate network latency
    const storedPassword = localStorage.getItem(LOCAL_STORAGE_PASSWORD_KEY) || 'password';
    if (currentPassword !== storedPassword) {
      return { success: false, error: 'Current password is not correct.' };
    }
    localStorage.setItem(LOCAL_STORAGE_PASSWORD_KEY, newPassword);
    return { success: true };
  }, []);

  return { user, login, logout, changePassword };
};