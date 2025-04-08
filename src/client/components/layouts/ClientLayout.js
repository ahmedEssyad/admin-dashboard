import React from 'react';
import { 
  Box, 
  Container, 
  CssBaseline, 
  ThemeProvider, 
  createTheme 
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

// Configuration du thème personnalisé
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Bleu Material Design
      light: '#42a5f5',
      dark: '#1565c0'
    },
    background: {
      default: '#f4f6f8', // Gris très clair
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          scroll-behavior: smooth;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `
    }
  }
});

const pageVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.99 
  },
  in: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  out: { 
    opacity: 0, 
    scale: 1.01,
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

const ClientLayout = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default
        }}
      >
        <Navbar />
        
        <AnimatePresence mode="wait">
          <motion.main
            key={window.location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            style={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <Box 
              component="section" 
              sx={{ 
                flexGrow: 1, 
                py: { xs: 2, sm: 4 }, 
                mt: { xs: 6, sm: 8 } 
              }}
            >
              <Container 
                maxWidth="lg"
                sx={{
                  '@media (max-width:600px)': {
                    px: { xs: 1, sm: 2 }
                  }
                }}
              >
                {children}
              </Container>
            </Box>
          </motion.main>
        </AnimatePresence>
        
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default ClientLayout;