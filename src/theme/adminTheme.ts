import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * Admin Panel Theme Configuration
 * Supports both light and dark modes with jewelry brand aesthetics
 */
export const getAdminTheme = (mode: 'light' | 'dark') => {
  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
        light: mode === 'light' ? '#42a5f5' : '#e3f2fd',
        dark: mode === 'light' ? '#1565c0' : '#42a5f5',
      },
      secondary: {
        main: mode === 'light' ? '#d4af37' : '#ffd700', // Gold accent for jewelry brand
        light: mode === 'light' ? '#e8c468' : '#ffea00',
        dark: mode === 'light' ? '#b8921f' : '#ffc400',
      },
      background: {
        default: mode === 'light' ? '#f5f7fa' : '#0a1929',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#1a1a1a' : '#ffffff',
        secondary: mode === 'light' ? '#666666' : '#b0b0b0',
      },
      success: {
        main: mode === 'light' ? '#2e7d32' : '#66bb6a',
      },
      error: {
        main: mode === 'light' ? '#d32f2f' : '#f44336',
      },
      warning: {
        main: mode === 'light' ? '#ed6c02' : '#ffa726',
      },
      info: {
        main: mode === 'light' ? '#0288d1' : '#29b6f6',
      },
      divider: mode === 'light' ? '#e0e0e0' : '#333333',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none', // No uppercase buttons
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(0,0,0,0.08)'
              : '0 2px 8px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: mode === 'light'
              ? '0 2px 4px rgba(0,0,0,0.08)'
              : '0 2px 4px rgba(0,0,0,0.3)',
          },
          elevation2: {
            boxShadow: mode === 'light'
              ? '0 4px 8px rgba(0,0,0,0.1)'
              : '0 4px 8px rgba(0,0,0,0.35)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRight: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #333333',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: mode === 'light'
              ? '0 1px 3px rgba(0,0,0,0.08)'
              : '0 1px 3px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
