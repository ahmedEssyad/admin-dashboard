import React, { useState, useEffect } from 'react';
import { 
  Typography, Grid, Box, Container, Breadcrumbs, Link, Skeleton,
  TextField, InputAdornment, FormControl, InputLabel, Select,
  MenuItem, Slider, Pagination, Divider, Chip, Paper
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../../shared/api/axiosConfig';
import ProductCard from '../components/common/ProductCard';

// Fonction pour extraire les paramètres de l'URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const location = useLocation();
  
  // État local
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query.get('q') || '');
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [hasDiscount, setHasDiscount] = useState(query.get('discount') === 'true');
  const [sortBy, setSortBy] = useState('relevance');
  
  const ITEMS_PER_PAGE = 12;

  // Rechercher les produits lors du changement des filtres ou de la page
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Construire l'URL de recherche
        let searchParams = {};
        
        if (searchTerm) {
          searchParams.q = searchTerm;
        }
        
        if (selectedCategories.length > 0) {
          searchParams.categoryId = selectedCategories.join(',');
        }
        
        if (priceRange[0] > 0 || priceRange[1] < 1000) {
          searchParams.minPrice = priceRange[0];
          searchParams.maxPrice = priceRange[1];
        }
        
        if (hasDiscount) {
          searchParams.hasDiscount = 'true';
        }
        
        // Effectuer la recherche
        const response = await axiosInstance.get('/products', { params: searchParams });
        
        // Tri des résultats
        let sortedProducts = [...response.data];
        if (sortBy === 'priceAsc') {
          sortedProducts.sort((a, b) => (a.discountedPrice || a.oldPrice) - (b.discountedPrice || b.oldPrice));
        } else if (sortBy === 'priceDesc') {
          sortedProducts.sort((a, b) => (b.discountedPrice || b.oldPrice) - (a.discountedPrice || a.oldPrice));
        } else if (sortBy === 'newest') {
          sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        setProducts(sortedProducts);
        setTotalResults(sortedProducts.length);
        
        // Récupérer les catégories pour les filtres
        if (categories.length === 0) {
          const categoriesResponse = await axiosInstance.get('/categories');
          setCategories(categoriesResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la recherche de produits:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchTerm, selectedCategories, priceRange, hasDiscount, sortBy, page]);

  // Gérer la recherche
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(e.target.value);
      setPage(1);
      
      // Mettre à jour l'URL pour refléter la recherche
      const params = new URLSearchParams();
      if (e.target.value) params.set('q', e.target.value);
      if (hasDiscount) params.set('discount', 'true');
      navigate({ pathname: location.pathname, search: params.toString() });
    }
  };
  
  // Gérer le changement de page
  const handleChangePage = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  // Gérer le changement de catégorie
  const handleCategoryChange = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
    setPage(1);
  };
  
  // Gérer le changement de plage de prix
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };
  
  // Gérer le changement de tri
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
  // Gérer le changement de filtre de remise
  const handleDiscountChange = () => {
    setHasDiscount(!hasDiscount);
    setPage(1);
    
    // Mettre à jour l'URL
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (!hasDiscount) params.set('discount', 'true');
    navigate({ pathname: location.pathname, search: params.toString() });
  };
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
  
  // Obtenir les produits pour la page actuelle
  const paginatedProducts = products.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  
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

  // Titre de la page basé sur les filtres
  const getPageTitle = () => {
    if (hasDiscount) {
      return "Produits en promotion";
    } else if (searchTerm) {
      return `Résultats pour "${searchTerm}"`;
    } else if (selectedCategories.length > 0) {
      const categoryNames = selectedCategories.map(catId => {
        const category = categories.find(c => c._id === catId);
        return category ? category.name : '';
      }).filter(Boolean);
      
      return `Produits ${categoryNames.join(', ')}`;
    } else {
      return "Tous les produits";
    }
  };

  // Rendu du squelette pendant le chargement
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="50%" height={40} />
          <Skeleton variant="text" width="30%" height={30} />
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Skeleton variant="rectangular" height={400} width="100%" sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Skeleton variant="rectangular" height={300} width="100%" sx={{ borderRadius: 2, mb: 1 }} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} underline="hover" color="inherit" to="/">
            Accueil
          </Link>
          <Typography color="text.primary">Recherche</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
          {getPageTitle()}
        </Typography>
        {totalResults > 0 ? (
          <Typography variant="subtitle1" color="text.secondary">
            {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
          </Typography>
        ) : (
          <Typography variant="subtitle1" color="text.secondary">
            Aucun résultat trouvé
          </Typography>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {/* Sidebar avec filtres */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rechercher
            </Typography>
            <TextField
              fullWidth
              placeholder="Rechercher des produits..."
              defaultValue={searchTerm}
              onKeyPress={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Catégories
            </Typography>
            <Box sx={{ mb: 3 }}>
              {categories.map((category) => (
                <Box
                  key={category._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    '&:hover': {
                      color: 'primary.main',
                      cursor: 'pointer',
                    },
                    color: selectedCategories.includes(category._id) ? 'primary.main' : 'inherit',
                    fontWeight: selectedCategories.includes(category._id) ? 'bold' : 'normal',
                  }}
                  onClick={() => handleCategoryChange(category._id)}
                >
                  <Typography variant="body2">
                    {category.name}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Prix
            </Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                {priceRange[0]} €
              </Typography>
              <Typography variant="body2">
                {priceRange[1]} € {priceRange[1] === 1000 ? '+' : ''}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Promotions
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
                '&:hover': {
                  color: 'primary.main',
                  cursor: 'pointer',
                },
                color: hasDiscount ? 'error.main' : 'inherit',
                fontWeight: hasDiscount ? 'bold' : 'normal',
              }}
              onClick={handleDiscountChange}
            >
              <LocalOfferIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">
                Produits en promotion
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Résultats de recherche */}
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                Filtres actifs:
              </Typography>
              <Box sx={{ display: 'flex', ml: 1, flexWrap: 'wrap' }}>
                {selectedCategories.map(catId => {
                  const category = categories.find(c => c._id === catId);
                  return category ? (
                    <Chip
                      key={catId}
                      label={category.name}
                      size="small"
                      onDelete={() => handleCategoryChange(catId)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ) : null;
                })}
                
                {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <Chip
                    label={`Prix: ${priceRange[0]}€ - ${priceRange[1]}€`}
                    size="small"
                    onDelete={() => setPriceRange([0, 1000])}
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                
                {hasDiscount && (
                  <Chip
                    label="En promotion"
                    size="small"
                    color="error"
                    onDelete={handleDiscountChange}
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
              </Box>
            </Box>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="sort-select-label">Trier par</InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sortBy}
                label="Trier par"
                onChange={handleSortChange}
                size="small"
              >
                <MenuItem value="relevance">Pertinence</MenuItem>
                <MenuItem value="priceAsc">Prix croissant</MenuItem>
                <MenuItem value="priceDesc">Prix décroissant</MenuItem>
                <MenuItem value="newest">Plus récent</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {paginatedProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                {paginatedProducts.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <ProductCard product={product} index={index} />
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handleChangePage} 
                    color="primary" 
                    showFirstButton 
                    showLastButton
                  />
                </Box>
              )}
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
                Aucun résultat trouvé
              </Typography>
              <Typography variant="body1" paragraph>
                Essayez de modifier vos filtres ou d'utiliser des termes de recherche différents.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchResults;