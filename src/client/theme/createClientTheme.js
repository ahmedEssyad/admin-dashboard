import { createTheme } from '@mui/material/styles';

// Fonction qui crée un thème client basé sur le mode (light ou dark)
const createClientTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#3f51b5',
        light: '#757de8',
        dark: '#002984',
        contrastText: '#fff',
      },
      secondary: {
        main: '#f50057',
        light: '#ff4081',
        dark: '#c51162',
        contrastText: '#fff',
      },
      ...(mode === 'light'
        ? {
            // Mode clair
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: 'rgba(0, 0, 0, 0.87)',
              secondary: 'rgba(0, 0, 0, 0.6)',
            },
          }
        : {
            // Mode sombre
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: 'rgba(255, 255, 255, 0.87)',
              secondary: 'rgba(255, 255, 255, 0.6)',
            },
          }),
    },
    typography: {
      fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 500,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
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
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0px 2px 4px rgba(0, 0, 0, 0.2)'
                : '0px 2px 4px rgba(0, 0, 0, 0.5)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light'
              ? '0px 5px 15px rgba(0, 0, 0, 0.05)'
              : '0px 5px 15px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: mode === 'light'
                ? '0px 10px 20px rgba(0, 0, 0, 0.1)'
                : '0px 10px 20px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light'
              ? '0px 2px 4px rgba(0, 0, 0, 0.05)'
              : '0px 2px 4px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: mode === 'light'
              ? '1px solid rgba(0, 0, 0, 0.05)'
              : '1px solid rgba(255, 255, 255, 0.05)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: mode === 'light'
                ? 'rgba(63, 81, 181, 0.1)'
                : 'rgba(63, 81, 181, 0.2)',
              '&:hover': {
                backgroundColor: mode === 'light'
                  ? 'rgba(63, 81, 181, 0.15)'
                  : 'rgba(63, 81, 181, 0.25)',
              },
            },
            '&:hover': {
              backgroundColor: mode === 'light'
                ? 'rgba(0, 0, 0, 0.04)'
                : 'rgba(255, 255, 255, 0.04)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: mode === 'light'
                  ? 'rgba(0, 0, 0, 0.23)'
                  : 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: mode === 'light'
                  ? 'rgba(0, 0, 0, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)',
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

export default createClientTheme;