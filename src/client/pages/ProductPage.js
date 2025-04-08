import React, { useState, useEffect } from 'react';
import { 
  Typography, Grid, Box, Container, Breadcrumbs, Link, Skeleton,
  Card, CardContent, Chip, Button, Divider, Table, TableBody, 
  TableCell, TableRow, Tabs, Tab, Paper, Snackbar, Alert
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  LocalOffer as LocalOfferIcon 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import axiosInstance from '../../shared/api/axiosConfig';
import ProductCard from '../components/common/ProductCard';
import { useCart } from '../../shared/contexts/CartContext';
import { useWishlist } from '../../shared/contexts/WishlistContext';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // État pour gérer les notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Hooks de contexte pour le panier et la liste de souhaits
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les détails du produit
        const productResponse = await axiosInstance.get(`/products/${id}`);
        setProduct(productResponse.data);
        
        // Définir l'image principale
        if (productResponse.data.mainPicture) {
          setMainImage(productResponse.data.mainPicture);
        } else if (productResponse.data.pictures && productResponse.data.pictures.length > 0) {
          setMainImage(productResponse.data.pictures[0]);
        }
        
        // Récupérer les produits liés (même catégorie)
        if (productResponse.data.categoriesa_id && productResponse.data.categoriesa_id.length > 0) {
          const categoryId = typeof productResponse.data.categoriesa_id[0] === 'object' 
            ? productResponse.data.categoriesa_id[0]._id 
            : productResponse.data.categoriesa_id[0];
            
          const relatedResponse = await axiosInstance.get(`/products/category/${categoryId}`);
          
          // Filtrer pour exclure le produit actuel et limiter à 4 produits
          const filteredProducts = relatedResponse.data
            .filter(p => p._id !== id)
            .slice(0, 4);
            
          setRelatedProducts(filteredProducts);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données du produit:', error);
        navigate('/404');
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate]);

  // Gestionnaire pour cliquer sur une image miniature
  const handleImageClick = (image) => {
    setMainImage(image);
  };

  // Gestionnaire pour changer d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Gestionnaire pour fermer la notification
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Fonction pour ajouter au panier avec notification
  const handleAddToCart = () => {
    if (product && product.quantite > 0) {
      addToCart(product);
      // Afficher une notification de succès
      setNotification({
        open: true,
        message: `${product.nom} a été ajouté à votre panier`,
        severity: 'success'
      });
    }
  };

  // Fonction pour ajouter aux favoris avec notification
  const handleAddToWishlist = () => {
    if (product) {
      addToWishlist(product);
      // Afficher une notification de succès
      setNotification({
        open: true,
        message: `${product.nom} a été ajouté à vos favoris`,
        severity: 'success'
      });
    }
  };

  // Configuration pour le slider des images miniatures
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        }
      }
    ]
  };

  // Rendu du squelette pendant le chargement
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="50%" height={30} />
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2, mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="40%" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={100} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width={180} height={50} sx={{ borderRadius: 1 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Si le produit n'est pas trouvé
  if (!product) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h5" color="error" sx={{ mt: 4 }}>
          Produit non trouvé
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
          Retour à l'accueil
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* File d'Ariane */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} underline="hover" color="inherit" to="/">
            Accueil
          </Link>
          {product.categoriesa_id && product.categoriesa_id.length > 0 && (
            <Link 
              component={RouterLink} 
              underline="hover" 
              color="inherit" 
              to={`/categories/${typeof product.categoriesa_id[0] === 'object' ? product.categoriesa_id[0]._id : product.categoriesa_id[0]}`}
            >
              {typeof product.categoriesa_id[0] === 'object' ? product.categoriesa_id[0].name : 'Catégorie'}
            </Link>
          )}
          <Typography color="text.primary">{product.nom}</Typography>
        </Breadcrumbs>
      </Box>
      
      <Grid container spacing={4}>
        {/* Colonne de gauche - Images */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box 
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                overflow: 'hidden',
                boxShadow: 3,
                bgcolor: 'background.paper',
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={mainImage || 'https://via.placeholder.com/600x400?text=Produit'}
                alt={product.nom}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain'
                }}
              />
            </Box>
            
            {/* Slider d'images miniatures */}
            {product.pictures && product.pictures.length > 1 && (
              <Box sx={{ mt: 2 }}>
                <Slider {...sliderSettings}>
                  {product.pictures.map((image, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        p: 0.5,
                        cursor: 'pointer',
                      }}
                    >
                      <Box
                        sx={{ 
                          width: 80,
                          height: 80,
                          overflow: 'hidden',
                          borderRadius: 1,
                          border: mainImage === image ? '2px solid' : '1px solid',
                          borderColor: mainImage === image ? 'primary.main' : 'grey.300',
                        }}
                        onClick={() => handleImageClick(image)}
                      >
                        <img
                          src={image}
                          alt={`${product.nom} - Image ${index + 1}`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Slider>
              </Box>
            )}
          </motion.div>
        </Grid>
        
        {/* Colonne de droite - Informations */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              {product.nom}
            </Typography>
            
            {/* Information sur la marque */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" component="div" color="text.secondary">
                Marque:
              </Typography>
              <Link 
                component={RouterLink} 
                to={`/companies/${typeof product.Company_id === 'object' ? product.Company_id._id : product.Company_id}`} 
                underline="hover" 
                color="primary" 
                sx={{ ml: 1 }}
              >
                {typeof product.Company_id === 'object' ? product.Company_id.nom : 'Entreprise'}
              </Link>
            </Box>
            
            {/* Affichage du prix et remise */}
            <Box sx={{ mb: 3 }}>
              {product.discountedPrice ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through', mr: 2 }}
                    >
                      {product.oldPrice} €
                    </Typography>
                    <Typography variant="h4" color="error.main" fontWeight="bold">
                      {product.discountedPrice} €
                    </Typography>
                    <Chip 
                      label={`-${Math.round((1 - product.discountedPrice / product.oldPrice) * 100)}%`} 
                      color="error" 
                      size="small" 
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  {product.discountDuration && (
                    <Typography variant="body2" color="error">
                      Promotion valable jusqu'au {new Date(product.discountDuration).toLocaleDateString()}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="h4" fontWeight="bold">
                  {product.oldPrice} €
                </Typography>
              )}
            </Box>
            
            {/* Indicateur de stock */}
            <Box sx={{ mb: 3 }}>
              {product.quantite !== undefined && (
                <Chip 
                  label={
                    product.quantite > 10 
                      ? 'En stock' 
                      : product.quantite > 0 
                        ? `Plus que ${product.quantite} en stock` 
                        : 'Rupture de stock'
                  }
                  color={
                    product.quantite > 10 
                      ? 'success' 
                      : product.quantite > 0 
                        ? 'warning' 
                        : 'error'
                  }
                  variant="outlined"
                />
              )}
            </Box>
            
            {/* Description du produit */}
            <Typography variant="body1" paragraph>
              {product.description || 'Aucune description disponible pour ce produit.'}
            </Typography>
            
            {/* Boutons d'action avec gestionnaires d'événements */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CartIcon />}
                disabled={product.quantite === 0}
                sx={{ flexGrow: 1 }}
                onClick={handleAddToCart}
              >
                Ajouter au panier
              </Button>
              <Button
                variant="outlined"
                startIcon={<FavoriteIcon />}
                onClick={handleAddToWishlist}
              >
                Favoris
              </Button>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
      
      {/* Onglets d'informations */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Paper sx={{ boxShadow: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
          >
            <Tab label="Détails" />
            <Tab label="Caractéristiques" />
            {product.categoriesa_id && product.categoriesa_id.length > 0 && (
              <Tab label="Catégories" />
            )}
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Détails du produit
                </Typography>
                <Typography variant="body1" paragraph>
                  {product.description || 'Aucune description détaillée disponible pour ce produit.'}
                </Typography>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Caractéristiques
                </Typography>
                {product.features ? (
                  <Typography variant="body1">
                    {product.features}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune caractéristique spécifiée pour ce produit.
                  </Typography>
                )}
              </Box>
            )}
            
            {tabValue === 2 && product.categoriesa_id && product.categoriesa_id.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Catégories
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {product.categoriesa_id.map((category, index) => (
                    <Chip
                      key={index}
                      label={typeof category === 'object' ? category.name : 'Catégorie'}
                      component={RouterLink}
                      to={`/categories/${typeof category === 'object' ? category._id : category}`}
                      clickable
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                
                {product.subcategories_id && product.subcategories_id.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Sous-catégories
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {product.subcategories_id.map((subcategory, index) => (
                        <Chip
                          key={index}
                          label={typeof subcategory === 'object' ? subcategory.name : 'Sous-catégorie'}
                          component={RouterLink}
                          to={`/categories/${typeof subcategory.categories_id === 'object' ? subcategory.categories_id._id : subcategory.categories_id}`}
                          clickable
                          color="secondary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
      
      {/* Produits liés */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 8, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Produits similaires
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {relatedProducts.map((relatedProduct, index) => (
              <Grid item xs={12} sm={6} md={3} key={relatedProduct._id}>
                <ProductCard product={relatedProduct} index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Composant de notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductPage;