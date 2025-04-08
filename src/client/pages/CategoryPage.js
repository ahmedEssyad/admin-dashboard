import React, { useState, useEffect } from 'react';
import { 
  Typography, Grid, Card, CardActionArea, CardContent, CardMedia, 
  Box, Container, Breadcrumbs, Link, Tabs, Tab, Skeleton,
  Chip, Divider, Button
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../../shared/api/axiosConfig';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les détails de la catégorie
        const categoryResponse = await axiosInstance.get(`/categories/${id}`);
        setCategory(categoryResponse.data);
        
        // Récupérer les sous-catégories de cette catégorie
        if (categoryResponse.data.subcategories_id) {
          setSubcategories(categoryResponse.data.subcategories_id);
        }
        
        // Récupérer les entreprises liées à cette catégorie
        if (categoryResponse.data.companies_id) {
          setCompanies(categoryResponse.data.companies_id);
        }
        
        // Récupérer les produits de cette catégorie
        const productsResponse = await axiosInstance.get(`/products/category/${id}`);
        setProducts(productsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données de la catégorie:', error);
        navigate('/404');
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [id, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryFilter = (subcategoryId) => {
    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategoryId);
    }
  };

  // Filtrer les produits en fonction de la sous-catégorie sélectionnée
  const filteredProducts = selectedSubcategory
    ? products.filter(product => 
        product.subcategories_id.some(sub => 
          (typeof sub === 'object' ? sub._id : sub) === selectedSubcategory
        )
      )
    : products;

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
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 3, mt: 2 }} />
          <Skeleton variant="text" width="50%" height={30} />
          <Skeleton variant="text" width="80%" height={20} />
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" width="100%" height={50} />
        </Box>
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Si la catégorie n'est pas trouvée
  if (!category) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h5" color="error" sx={{ mt: 4 }}>
          Catégorie non trouvée
        </Typography>
        <Button component={RouterLink} to="/categories" variant="contained" sx={{ mt: 2 }}>
          Retour aux catégories
        </Button>
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
          <Link component={RouterLink} underline="hover" color="inherit" to="/categories">
            Catégories
          </Link>
          <Typography color="text.primary">{category.name}</Typography>
        </Breadcrumbs>
        
        <Box
          sx={{
            mt: 2,
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            height: 200,
            position: 'relative',
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${category.logo || 'https://via.placeholder.com/1200x200?text=Catégorie'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
              },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              p: 3,
              color: 'white',
              zIndex: 1,
            }}
          >
            <Typography variant="h3" component="h1">
              {category.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              {category.description || `Découvrez notre gamme de produits ${category.name}`}
            </Typography>
          </Box>
        </Box>
        
        {subcategories.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Sous-catégories
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {subcategories.map((subcategory) => (
                <Chip
                  key={subcategory._id}
                  label={subcategory.name}
                  clickable
                  color={selectedSubcategory === subcategory._id ? 'primary' : 'default'}
                  onClick={() => handleSubcategoryFilter(subcategory._id)}
                />
              ))}
            </Box>
          </Box>
        )}
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Tous les produits" />
          <Tab label="Marques" />
        </Tabs>
      </Box>
      
      {tabValue === 0 ? (
        <>
          <Typography variant="h5" gutterBottom>
            {selectedSubcategory 
              ? `Produits de la sous-catégorie ${subcategories.find(s => s._id === selectedSubcategory)?.name || ''}`
              : `Produits de la catégorie ${category.name}`}
          </Typography>
          
          {filteredProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                    <motion.div variants={itemVariants}>
                      <Card sx={{ height: '100%' }}>
                        <CardActionArea 
                          component={RouterLink} 
                          to={`/products/${product._id}`}
                          sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="180"
                              image={product.mainPicture || 'https://via.placeholder.com/300x180?text=Produit'}
                              alt={product.nom}
                            />
                            {product.discountedPrice && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 10,
                                  right: 10,
                                  backgroundColor: 'error.main',
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: 1,
                                  fontWeight: 'bold',
                                }}
                              >
                                -{Math.round((1 - product.discountedPrice / product.oldPrice) * 100)}%
                              </Box>
                            )}
                          </Box>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="div" noWrap>
                              {product.nom}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {product.Company_id?.nom || 'Marque non spécifiée'}
                            </Typography>
                            {product.discountedPrice ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                  sx={{ textDecoration: 'line-through', mr: 1 }}
                                >
                                  {product.oldPrice} €
                                </Typography>
                                <Typography variant="h6" color="error.main">
                                  {product.discountedPrice} €
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="h6" sx={{ mt: 1 }}>
                                {product.oldPrice} €
                              </Typography>
                            )}
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Aucun produit trouvé dans cette catégorie
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Marques de la catégorie {category.name}
          </Typography>
          
          {companies.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                {companies.map((company) => (
                  <Grid item xs={12} sm={6} md={4} key={company._id}>
                    <motion.div variants={itemVariants}>
                      <Card>
                        <CardActionArea component={RouterLink} to={`/companies/${company._id}`}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={company.logo || 'https://via.placeholder.com/300x140?text=Marque'}
                            alt={company.nom}
                            sx={{ objectFit: 'contain', p: 2, bgcolor: 'grey.100' }}
                          />
                          <CardContent>
                            <Typography variant="h6" component="div">
                              {company.nom}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Aucune marque trouvée pour cette catégorie
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CategoryPage;