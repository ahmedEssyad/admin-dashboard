import { createTheme } from '@mui/material/styles';

const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Bleu moderne
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6', // Violet moderne
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Vert moderne
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444', // Rouge moderne
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b', // Orange moderne
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0ea5e9', // Bleu clair moderne
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Arrière-plan plus doux
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Texte gris-bleu foncé
      secondary: '#64748b', // Texte gris-bleu plus clair
    },
    divider: 'rgba(100, 116, 139, 0.12)', // Séparateur subtil
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Pas de texte en majuscules pour les boutons
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Rayons plus arrondis pour un look moderne
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.05)',
    '0px 6px 12px rgba(0,0,0,0.05)',
    '0px 8px 16px rgba(0,0,0,0.05)',
    '0px 10px 20px rgba(0,0,0,0.05)',
    // ... autres niveaux d'ombre
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          borderBottom: '1px solid rgba(100, 116, 139, 0.12)',
        },
        head: {
          backgroundColor: 'rgba(100, 116, 139, 0.05)',
          color: '#1e293b',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 2,
          '&.Mui-selected': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(100, 116, 139, 0.08)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
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
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default adminTheme;