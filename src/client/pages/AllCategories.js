import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Grid, Box, Container, Breadcrumbs, Link, 
  Skeleton, TextField, InputAdornment, Fade
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from '@mui/icons-material';
import axiosInstance from '../../shared/api/axiosConfig';
import CategoryCard from '../components/common/CategoryCard';

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/categories');
      setCategories(response.data);
      setFilteredCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filtrage des catégories
  useEffect(() => {
    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Rendu du squelette pendant le chargement
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="text" width="60%" height={30} />
        </Box>
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={200} 
                sx={{ 
                  borderRadius: 2, 
                  mb: 1 
                }} 
              />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link 
            component={RouterLink} 
            underline="hover" 
            color="inherit" 
            to="/"
          >
            Accueil
          </Link>
          <Typography color="text.primary">Catégories</Typography>
        </Breadcrumbs>
        
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 2,
            fontWeight: 'bold',
            background: '-webkit-linear-gradient(45deg, #3494E6, #2196F3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Toutes les catégories
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          Parcourez notre sélection de catégories pour trouver les produits qui vous intéressent
        </Typography>

        {/* Barre de recherche */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }
          }}
        />
      </Box>
      
      {filteredCategories.length === 0 ? (
        <Fade in>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '50vh',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Aucune catégorie trouvée
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Essayez un autre terme de recherche
            </Typography>
          </Box>
        </Fade>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid 
            container 
            spacing={3} 
            sx={{ 
              display: 'flex', 
              alignItems: 'stretch' 
            }}
          >
            {filteredCategories.map((category, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={category._id}
                component={motion.div}
                variants={itemVariants}
              >
                <CategoryCard 
                  category={category} 
                  index={index} 
                />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}
    </Container>
  );
};

export default AllCategories;