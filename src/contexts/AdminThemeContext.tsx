import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getAdminTheme } from '../theme/adminTheme';

interface AdminThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeContext);

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

/**
 * AdminThemeProvider
 * Manages theme state (light/dark mode) for admin panel
 * Persists user preference in localStorage
 */
export const AdminThemeProvider: React.FC<AdminThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Load saved theme preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('adminThemeMode') as 'light' | 'dark' | null;
      if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
        setMode(savedMode);
      }
    }
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminThemeMode', newMode);
      }
      return newMode;
    });
  };

  // Memoize theme to avoid unnecessary re-renders
  const theme = useMemo(() => getAdminTheme(mode), [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode]
  );

  return (
    <AdminThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AdminThemeContext.Provider>
  );
};

export default AdminThemeContext;
