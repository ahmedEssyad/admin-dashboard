import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, Typography, Grid, Card, CardMedia, CardContent, 
  CardActionArea, Button, Container, Skeleton, Divider, 
  useMediaQuery, useTheme, IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { 
  ShoppingCart as CartIcon, 
  Favorite as WishlistIcon 
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { useCart } from '../../shared/contexts/CartContext';
import { useWishlist } from '../../shared/contexts/WishlistContext';

// Simple image optimization function
const getOptimizedImageUrl = (url, width, height) => {
  if (!url) return `https://via.placeholder.com/${width}x${height}?text=Image`;
  
  // If using Cloudinary
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
  }
  
  // If using your own API
  if (url.startsWith('/uploads/')) {
    return `${url}?w=${width}&h=${height}`;
  }
  
  return url;
};

// Simple debounce utility
const debounce = (fn, delay = 100) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Preload critical images
const preloadHeroImage = (imageUrl) => {
  if (!imageUrl) return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = imageUrl;
  link.type = 'image/webp'; // Ajout du type pour les images webp
  link.crossOrigin = 'anonymous'; // Ajout pour les images provenant de domaines externes
  
  document.head.appendChild(link);
};

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const heroRef = useRef(null); // Reference for LCP tracking
  
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Optimized cart handler with debounce to improve INP
  const handleAddToCart = useCallback(
    debounce((e, product) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product);
    }, 100),
    [addToCart]
  );

  // Optimized wishlist handler with debounce
  const handleAddToWishlist = useCallback(
    debounce((e, product) => {
      e.preventDefault();
      e.stopPropagation();
      addToWishlist(product);
    }, 100),
    [addToWishlist]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Using regular axios calls since getCached might have issues
      const [categoriesResponse, promotionsResponse, productsResponse] = await Promise.all([
        axiosInstance.get('/categories'),
        axiosInstance.get('/products/promotions'),
        axiosInstance.get('/products')
      ]);

      const limitedCategories = categoriesResponse.data.slice(0, 4);
      setCategories(limitedCategories);
      
      const limitedPromotions = promotionsResponse.data.slice(0, 4);
      setPromotions(limitedPromotions);
      
      // Preload the hero image once we have it
      if (limitedPromotions.length > 0 && limitedPromotions[0].mainPicture) {
        preloadHeroImage(limitedPromotions[0].mainPicture);
      }
      
      const nonPromotionProducts = productsResponse.data.filter(
        product => !promotionsResponse.data.some(p => p._id === product._id)
      );
      
      const shuffled = nonPromotionProducts.sort(() => 0.5 - Math.random());
      setFeaturedProducts(shuffled.slice(0, 4));
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError(error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Track LCP for performance monitoring
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime / 1000, 'seconds');
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        return () => {
          lcpObserver.disconnect();
        };
      } catch (e) {
        console.error('Performance monitoring not supported', e);
      }
    }
  }, [fetchData]);

  // Use transform instead of y position to avoid layout shifts
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05 // Reduced for faster appearance
      }
    }
  };
  
  const itemVariants = {
    hidden: { transform: 'translateY(20px)', opacity: 0 },
    visible: {
      transform: 'translateY(0)',
      opacity: 1,
      transition: {
        duration: 0.3 // Faster transition
      }
    }
  };

  // Gestion des erreurs
  if (error) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h4" color="error">
            Erreur de chargement
          </Typography>
          <Typography>
            Impossible de charger les données. Veuillez réessayer ultérieurement.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchData}
            sx={{ mt: 2 }}
          >
            Réessayer
          </Button>
        </Box>
      </Container>
    );
  }

  // Écran de chargement
  if (loading) {
    return (
      <Container>
        <Box sx={{ mb: 6 }}>
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height={isMobile ? 200 : 400} 
            sx={{ borderRadius: 2, mb: 2 }} 
          />
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height={200} 
                  sx={{ borderRadius: 2, mb: 1 }} 
                />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section optimized for LCP */}
      <Box
        ref={heroRef}
        sx={{
          height: { xs: '50vh', md: '60vh' },
          position: 'relative',
          mb: 6,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3,
          bgcolor: 'grey.100', // Fallback color before image loads
        }}
      >
        {/* Replace background-image with img element for better LCP performance */}
        {/* Placeholder div with same dimensions to prevent layout shift */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'grey.600',
          }}
        />
        <Box
          component="img"
          src={getOptimizedImageUrl(promotions[0]?.mainPicture, 1600, 900) || 'https://via.placeholder.com/1200x600'}
          alt="Hero banner"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.6)',
          }}
          // Use lowercase attributes for React compatibility
          fetchpriority="high"
          decoding="async"
          loading="eager"
          width="1600"
          height="900"
        />
        
        <Container sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              color: 'white',
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            <Typography 
              variant={isMobile ? "h4" : "h2"} 
              component="h1" 
              gutterBottom
              sx={{ maxWidth: { md: '70%' } }}
            >
              Découvrez notre catalogue de produits
            </Typography>
            <Typography 
              variant={isMobile ? "body1" : "h5"} 
              gutterBottom 
              sx={{ 
                mb: 4, 
                maxWidth: { md: '60%' },
                mx: { xs: 'auto', md: 'unset' }
              }}
            >
              Une sélection de qualité pour tous vos besoins
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'center', md: 'flex-start' } 
            }}>
              <Button
                component={RouterLink}
                to="/categories"
                variant="contained"
                color="primary"
                size="large"
              >
                Explorer les catégories
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container>
        {/* Sections de Catégories */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Nos Catégories
          </Typography>
          <Divider sx={{ mb: 4, mx: 'auto', width: '100px' }} />
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {categories.map((category) => (
                <Grid item xs={6} md={3} key={category._id}>
                  <motion.div variants={itemVariants}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        transition: 'transform 0.3s',
                        '&:hover': { 
                          transform: 'scale(1.05)',
                          boxShadow: 3 
                        }
                      }}
                    >
                      <CardActionArea 
                        component={RouterLink} 
                        to={`/categories/${category._id}`}
                        sx={{ height: '100%' }}
                      >
                        <Box sx={{ height: 140, overflow: 'hidden' }}>
                          <LazyLoadImage
                            src={getOptimizedImageUrl(category.logo, 300, 140) || 'https://via.placeholder.com/300x140?text=Catégorie'}
                            alt={category.name}
                            effect="blur"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        <CardContent>
                          <Typography variant="h6" component="div" noWrap>
                            {category.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              component={RouterLink} 
              to="/categories" 
              variant="outlined" 
              color="primary"
            >
              Voir toutes les catégories
            </Button>
          </Box>
        </Box>

        {/* Section Promotions - Optimized */}
        {promotions.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mt: 8 }}>
              Promotions Spéciales
            </Typography>
            <Divider sx={{ mb: 4, mx: 'auto', width: '100px' }} />
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                {promotions.map((product) => (
                  <Grid item xs={12} sm={6} md={3} key={product._id}>
                    <motion.div 
                      variants={itemVariants}
                      style={{ height: '100%' }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%', 
                          position: 'relative',
                          transition: 'transform 0.3s',
                          '&:hover': { 
                            transform: 'scale(1.05)',
                            boxShadow: 3 
                          }
                        }}
                      >
                        <CardActionArea 
                          component={RouterLink} 
                          to={`/products/${product._id}`}
                          sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                          <Box sx={{ position: 'relative', width: '100%' }}>
                            <Box sx={{ position: 'relative', width: '100%', height: 180 }}>
                              <CardMedia
                                component="img"
                                height="180"
                                width="300"
                                image={getOptimizedImageUrl(product.mainPicture, 300, 180) || 'https://via.placeholder.com/300x180?text=Produit'}
                                alt={product.nom}
                                loading="lazy"
                                sx={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
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
                          </Box>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="div" noWrap>
                              {product.nom}
                            </Typography>
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
                          </CardContent>
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: 10, 
                              left: 10, 
                              display: 'flex', 
                              gap: 1 
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => handleAddToCart(e, product)}
                              sx={{ 
                                bgcolor: 'white', 
                                '&:hover': { bgcolor: 'primary.light' } 
                              }}
                            >
                              <CartIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => handleAddToWishlist(e, product)}
                              sx={{ 
                                bgcolor: 'white', 
                                '&:hover': { bgcolor: 'primary.light' } 
                              }}
                            >
                              <WishlistIcon />
                            </IconButton>
                          </Box>
                        </CardActionArea>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                component={RouterLink} 
                to="/search?discount=true" 
                variant="outlined" 
                color="error"
              >
                Voir toutes les promotions
              </Button>
            </Box>
          </Box>
        )}

        {/* Section Produits Populaires - Optimized */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mt: 8 }}>
            Produits Populaires
          </Typography>
          <Divider sx={{ mb: 4, mx: 'auto', width: '100px' }} />
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {featuredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <motion.div 
                    variants={itemVariants}
                    style={{ height: '100%' }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%', 
                        position: 'relative',
                        transition: 'transform 0.3s',
                        '&:hover': { 
                          transform: 'scale(1.05)',
                          boxShadow: 3 
                        }
                      }}
                    >
                      <CardActionArea 
                        component={RouterLink} 
                        to={`/products/${product._id}`}
                        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                      >
                        <Box sx={{ position: 'relative', width: '100%', height: 180 }}>
                          <CardMedia
                            component="img"
                            height="180"
                            width="300"
                            image={getOptimizedImageUrl(product.mainPicture, 300, 180) || 'https://via.placeholder.com/300x180?text=Produit'}
                            alt={product.nom}
                            loading="lazy"
                            sx={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="div" noWrap>
                            {product.nom}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" noWrap>
                            {product.Company_id?.nom || 'Marque'}
                          </Typography>
                          <Typography variant="h6" sx={{ mt: 1 }}>
                            {product.oldPrice} €
                          </Typography>
                        </CardContent>
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 10, 
                            left: 10, 
                            display: 'flex', 
                            gap: 1 
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => handleAddToCart(e, product)}
                            sx={{ 
                              bgcolor: 'white', 
                              '&:hover': { bgcolor: 'primary.light' } 
                            }}
                          >
                            <CartIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleAddToWishlist(e, product)}
                            sx={{ 
                              bgcolor: 'white', 
                              '&:hover': { bgcolor: 'primary.light' } 
                            }}
                          >
                            <WishlistIcon />
                          </IconButton>
                        </Box>
                      </CardActionArea>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              component={RouterLink} 
              to="/products" 
              variant="outlined" 
              color="primary"
            >
              Voir tous les produits
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;