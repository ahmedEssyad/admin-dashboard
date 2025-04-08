import React, { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Grid, Box, Container, Breadcrumbs, Link, Skeleton,
  TextField, InputAdornment, Card, CardContent, CardMedia,
  CardActionArea, Paper, useMediaQuery, useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Search as SearchIcon,
  Store as StoreIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import axiosInstance from '../../shared/api/axiosConfig';

const AllCompanies = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/companies');
        setCompanies(response.data);
        setFilteredCompanies(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des entreprises:', error);
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filtrer les entreprises lors de la recherche
  useEffect(() => {
    const filtered = companies.filter(company => 
      company.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  // Obtenir les lettres uniques pour l'index alphabétique
  const alphabetIndex = useMemo(() => {
    const letters = new Set(
      filteredCompanies.map(company => company.nom.charAt(0).toUpperCase())
    );
    return Array.from(letters).sort();
  }, [filteredCompanies]);

  // Regrouper les entreprises par lettre
  const groupedCompanies = useMemo(() => {
    const grouped = {};
    filteredCompanies.forEach(company => {
      const firstLetter = company.nom.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(company);
    });
    
    // Trier les entreprises dans chaque groupe
    Object.keys(grouped).forEach(letter => {
      grouped[letter].sort((a, b) => a.nom.localeCompare(b.nom));
    });
    
    return grouped;
  }, [filteredCompanies]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
        
        <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 4 }} />
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
            <Grid item xs={6} sm={4} md={3} key={item}>
              <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton variant="text" width="80%" />
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
          <Typography color="text.primary">Marques</Typography>
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
          Toutes les marques
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          Découvrez notre sélection de marques et leurs produits
        </Typography>
      </Box>
      
      <Paper 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 2, 
          boxShadow: 2,
          transition: 'all 0.3s ease'
        }}
      >
        <TextField
          fullWidth
          placeholder="Rechercher une marque..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <Link 
                  component="button" 
                  onClick={() => setSearchTerm('')}
                  sx={{ color: 'text.secondary' }}
                >
                  Effacer
                </Link>
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
      </Paper>
      
      {/* Index alphabétique */}
      {!searchTerm && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {alphabetIndex.map(letter => (
            <Link
              key={letter}
              href={`#letter-${letter}`}
              underline="hover"
              sx={{ 
                width: 35, 
                height: 35, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: 'primary.light',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'primary.main',
                  transform: 'scale(1.1)'
                }
              }}
            >
              {letter}
            </Link>
          ))}
        </Box>
      )}
      
      {filteredCompanies.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Object.keys(groupedCompanies).sort().map(letter => (
            <Box key={letter} id={`letter-${letter}`}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mt: 4, 
                  mb: 2, 
                  borderBottom: '2px solid', 
                  borderColor: 'primary.main',
                  paddingBottom: 1
                }}
              >
                {letter}
              </Typography>
              
              <Grid container spacing={3}>
                {groupedCompanies[letter].map((company, index) => (
                  <Grid item xs={6} sm={4} md={3} key={company._id}>
                    <motion.div variants={itemVariants}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'translateY(-10px)',
                          }
                        }}
                        elevation={2}
                      >
                        <CardActionArea 
                          component={RouterLink} 
                          to={`/companies/${company._id}`}
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'stretch' 
                          }}
                        >
                          <Box 
                            sx={{ 
                              height: 120, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              bgcolor: 'grey.100',
                              p: 2
                            }}
                          >
                            {company.logo ? (
                              <LazyLoadImage
                                src={company.logo}
                                alt={company.nom}
                                effect="blur"
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '100%', 
                                  objectFit: 'contain' 
                                }}
                              />
                            ) : (
                              <StoreIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                            )}
                          </Box>
                          <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                            <Typography 
                              variant="h6" 
                              component="div" 
                              align="center"
                              noWrap
                            >
                              {company.nom}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </motion.div>
      ) : (
        <Paper
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            Aucune marque trouvée
          </Typography>
          <Typography variant="body1">
            Essayez un autre terme de recherche.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default AllCompanies;