import React, { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Grid, Box, Container, Breadcrumbs, Link, 
  Skeleton, TextField, InputAdornment, Paper, 
  FormControl, InputLabel, Select, MenuItem, 
  Chip, Stack, Slider, Button, IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  Clear as ClearIcon 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosConfig';
import ProductCard from '../components/common/ProductCard';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    company: '',
    priceRange: [0, 1000],
    onSale: false
  });
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Fetch products and auxiliary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse, companiesResponse] = await Promise.all([
          axiosInstance.get('/products'),
          axiosInstance.get('/categories'),
          axiosInstance.get('/companies')
        ]);
        
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        setCompanies(companiesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Optimized filtering with useMemo
  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter - Fixed: using categoriesa_id
    if (filters.category) {
      result = result.filter(product => {
        if (product.categoriesa_id && Array.isArray(product.categoriesa_id)) {
          return product.categoriesa_id.some(category => 
            category && category.name === filters.category
          );
        }
        return false;
      });
    }

    // Company filter - Fixed: handling both populated and non-populated Company_id
    if (filters.company) {
      result = result.filter(product => {
        // Case 1: Company_id is a populated object
        if (product.Company_id && typeof product.Company_id === 'object' && product.Company_id.nom) {
          return product.Company_id.nom === filters.company;
        }
        
        // Case 2: Company_id is just an ObjectId string
        if (product.Company_id && typeof product.Company_id === 'string') {
          const company = companies.find(c => c._id === product.Company_id);
          return company && company.nom === filters.company;
        }
        
        return false;
      });
    }

    // Price range filter
    result = result.filter(product => 
      product.oldPrice >= filters.priceRange[0] && 
      product.oldPrice <= filters.priceRange[1]
    );

    // Sale filter
    if (filters.onSale) {
      result = result.filter(product => product.discountedPrice);
    }

    return result;
  }, [searchTerm, filters, products, companies]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      company: '',
      priceRange: [0, 1000],
      onSale: false
    });
    setSearchTerm('');
  };

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

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="text" width="60%" height={30} />
        </Box>
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
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
          <Typography color="text.primary">Tous les produits</Typography>
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
          Notre catalogue de produits
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          Découvrez notre large sélection de produits ({filteredProducts.length} produits)
        </Typography>
      </Box>

      {/* Filters */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          alignItems: 'center' 
        }}
      >
        {/* Search */}
        <TextField
          label="Rechercher"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm('')} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ flex: 1, minWidth: 250 }}
        />

        {/* Category Filter */}
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Catégorie</InputLabel>
          <Select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            label="Catégorie"
          >
            <MenuItem value="">Toutes les catégories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category._id} value={category.name}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Company Filter */}
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Marque</InputLabel>
          <Select
            value={filters.company}
            onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
            label="Marque"
          >
            <MenuItem value="">Toutes les marques</MenuItem>
            {companies.map(company => (
              <MenuItem key={company._id} value={company.nom}>
                {company.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Price Range */}
        <Box sx={{ width: 250 }}>
          <Typography gutterBottom>Prix (€)</Typography>
          <Slider
            value={filters.priceRange}
            onChange={(e, newValue) => setFilters(prev => ({ ...prev, priceRange: newValue }))}
            valueLabelDisplay="auto"
            max={1000}
            step={10}
          />
        </Box>

        {/* Sale Filter */}
        <FormControl>
          <Button
            color={filters.onSale ? "primary" : "inherit"}
            variant={filters.onSale ? "contained" : "outlined"}
            onClick={() => setFilters(prev => ({ ...prev, onSale: !prev.onSale }))}
          >
            Promotions
          </Button>
        </FormControl>

        {/* Clear Filters */}
        <Button 
          variant="outlined" 
          color="error" 
          onClick={clearFilters}
          startIcon={<ClearIcon />}
        >
          Réinitialiser
        </Button>
      </Paper>

      {/* Active Filters */}
      {(searchTerm || filters.category || filters.company || filters.onSale) && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1}>
            {searchTerm && (
              <Chip 
                label={`Recherche: ${searchTerm}`} 
                onDelete={() => setSearchTerm('')} 
              />
            )}
            {filters.category && (
              <Chip 
                label={`Catégorie: ${filters.category}`} 
                onDelete={() => setFilters(prev => ({ ...prev, category: '' }))} 
              />
            )}
            {filters.company && (
              <Chip 
                label={`Marque: ${filters.company}`} 
                onDelete={() => setFilters(prev => ({ ...prev, company: '' }))} 
              />
            )}
            {filters.onSale && (
              <Chip 
                label="Promotions" 
                onDelete={() => setFilters(prev => ({ ...prev, onSale: false }))} 
              />
            )}
          </Stack>
        </Box>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {filteredProducts.map((product, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={product._id}
                component={motion.div}
                variants={itemVariants}
              >
                <ProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      ) : (
        <Paper
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 2 
          }}
        >
          <Typography variant="h6" gutterBottom>
            Aucun produit trouvé
          </Typography>
          <Typography variant="body1">
            Essayez de modifier vos filtres ou votre recherche.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={clearFilters}
          >
            Réinitialiser les filtres
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default AllProducts;