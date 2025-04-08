import React from 'react';
import { 
  Typography, Box, Container, Button, Paper 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon, Search as SearchIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          sx={{ 
            p: 5, 
            mt: 6, 
            borderRadius: 2, 
            textAlign: 'center',
            boxShadow: 3
          }}
        >
          <Typography 
            variant="h1" 
            component="h1" 
            color="primary"
            sx={{ 
              fontWeight: 'bold', 
              fontSize: { xs: '4rem', md: '6rem' }
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ mb: 3 }}
          >
            Page non trouvée
          </Typography>
          
          <Typography variant="body1" paragraph>
            La page que vous recherchez n'existe pas ou a été déplacée.
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              startIcon={<HomeIcon />}
              size="large"
            >
              Retour à l'accueil
            </Button>
            <Button
              component={RouterLink}
              to="/search"
              variant="outlined"
              startIcon={<SearchIcon />}
              size="large"
            >
              Rechercher un produit
            </Button>
          </Box>
          
          <Box 
            sx={{ 
              mt: 5, 
              pt: 3, 
              borderTop: '1px solid', 
              borderColor: 'divider'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default NotFound;