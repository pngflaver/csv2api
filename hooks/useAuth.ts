
import { useState, useCallback } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  // Login now calls backend for validation
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        setUser({ username });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    // Note: We don't clear logs, api key or data on logout for persistence demonstration
  }, []);

  // Change password by calling backend
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: currentPassword, newPassword })
      });
      if (res.ok) {
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || 'Password change failed.' };
      }
    } catch (e) {
      return { success: false, error: 'Network error.' };
    }
  }, []);

  return { user, login, logout, changePassword };
};