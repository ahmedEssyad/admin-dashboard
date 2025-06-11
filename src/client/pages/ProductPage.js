import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Grid, Box, Typography, Paper, Tabs, Tab, Divider, 
  Button, IconButton, Chip, Rating, Stack, Breadcrumbs, Badge,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  FormControl, RadioGroup, FormControlLabel, Radio, Tooltip, Alert,
  Snackbar, ImageList, ImageListItem, CircularProgress, Skeleton, Avatar,
  Card, CardContent
} from '@mui/material';
import { 
  ShoppingCart as CartIcon, 
  Favorite, FavoriteBorder,
  LocalShipping as ShippingIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  KeyboardReturn as ReturnIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import axiosInstance from '../../shared/api/axiosConfig';
import ProductCard from '../components/common/ProductCard';
import { useCart } from '../../shared/contexts/CartContext';
import { useWishlist } from '../../shared/contexts/WishlistContext';
import styled from '@emotion/styled';

// Fonction utilitaire pour déterminer si une couleur est foncée
const isColorDark = (hexColor) => {
  // Pour les couleurs nommées, utiliser une correspondance simple
  const namedColors = {
    'black': true,
    'navy': true,
    'darkblue': true,
    'darkgreen': true,
    'darkred': true,
    'brown': true,
    'purple': true
  };
  
  if (namedColors[hexColor.toLowerCase()]) {
    return true;
  }
  
  // Convertir en RGB et calculer la luminosité
  let r, g, b;
  
  // Format hexadécimal
  if (hexColor.startsWith('#')) {
    hexColor = hexColor.substring(1);
    
    // Format #RGB
    if (hexColor.length === 3) {
      r = parseInt(hexColor[0] + hexColor[0], 16);
      g = parseInt(hexColor[1] + hexColor[1], 16);
      b = parseInt(hexColor[2] + hexColor[2], 16);
    } 
    // Format #RRGGBB
    else if (hexColor.length === 6) {
      r = parseInt(hexColor.substring(0, 2), 16);
      g = parseInt(hexColor.substring(2, 4), 16);
      b = parseInt(hexColor.substring(4, 6), 16);
    } else {
      return false; // Fallback pour couleur invalide
    }
  } else {
    return false; // Couleur non-hexadécimale, assumer claire
  }
  
  // Calculer la luminosité perçue (formule standard)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5; // Si < 0.5, considérer comme foncée
};

// Composant pour les images de variation avec zoom
const VariationImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  cursor: 'zoom-in',
  borderRadius: '8px',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

// Indicateur de couleur
const ColorIndicator = styled(Box)(({ color }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: color,
  border: '2px solid #fff',
  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.15)'
  }
}));

// Indicateur de taille
const SizeBox = styled(Box)(({ selected, disabled }) => ({
  minWidth: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px solid ${selected ? '#1976d2' : disabled ? '#e0e0e0' : '#e0e0e0'}`,
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: selected ? 'rgba(25, 118, 210, 0.08)' : disabled ? '#f5f5f5' : 'white',
  color: disabled ? '#9e9e9e' : selected ? '#1976d2' : 'inherit',
  '&:hover': {
    backgroundColor: disabled ? '#f5f5f5' : selected ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0,0,0,0.04)'
  }
}));

// Indicateur de quantité
const QuantitySelector = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  overflow: 'hidden',
  width: 'fit-content'
});

const QuantityButton = styled(Button)({
  minWidth: '36px',
  padding: '4px 8px',
  borderRadius: '0',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.08)'
  }
});

const QuantityDisplay = styled(Box)({
  padding: '4px 16px',
  minWidth: '40px',
  textAlign: 'center',
  userSelect: 'none'
});

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  // États du produit
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // État de l'interface
  const [selectedImage, setSelectedImage] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWish, setIsInWish] = useState(false);
  
  // État des variations
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [variationStock, setVariationStock] = useState(null);
  
  // État des notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Validation de l'ID au démarrage
  useEffect(() => {
    // Vérifier si l'ID est valide (MongoDB ObjectId format)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (!id || !isValidObjectId) {
      console.warn('ID de produit invalide:', id);
      navigate('/404', { replace: true });
      return;
    }
  }, [id, navigate]);

  // Vérifier si le produit est dans la liste de souhaits
  useEffect(() => {
    if (product) {
      setIsInWish(isInWishlist(product._id));
    }
  }, [product, isInWishlist]);
  
  // Charger les données du produit
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosInstance.get(`/products/${id}`);
        
        if (!response.data || !response.data._id) {
          throw new Error('Produit non trouvé');
        }
        
        setProduct(response.data);
        
        // Initialiser les valeurs par défaut pour les variations
        if (response.data.productType === 'variable' && response.data.availableVariations?.length > 0) {
          // Trouver une variation disponible pour sélection par défaut
          const availableVariation = response.data.availableVariations.find(v => v.available);
          
          if (availableVariation) {
            setSelectedColor(availableVariation.attributes.color || null);
            setSelectedSize(availableVariation.attributes.size || null);
            setSelectedVariation(availableVariation);
            setVariationStock(availableVariation.quantity);
          }
        } else {
          // Pour les produits simples
          setVariationStock(response.data.quantite);
        }
        
        // Charger les produits associés
        if (response.data.categoriesa_id?.length > 0) {
          const categoryId = typeof response.data.categoriesa_id[0] === 'object' 
            ? response.data.categoriesa_id[0]._id 
            : response.data.categoriesa_id[0];
            
          const relatedResponse = await axiosInstance.get(`/products/category/${categoryId}?limit=4`);
          const filtered = relatedResponse.data.filter(p => p._id !== id).slice(0, 4);
          setRelatedProducts(filtered);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement du produit:', err);
        
        // Si erreur 404, rediriger vers la page 404
        if (err.response?.status === 404) {
          navigate('/404', { replace: true });
          return;
        }
        
        setError('Une erreur est survenue lors du chargement des informations du produit.');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProductData();
    }
  }, [id, navigate]);
  
  // Filtrer les variations disponibles en fonction des sélections actuelles
  const availableColors = useMemo(() => {
    if (!product || !product.availableVariations) return [];
    
    const colors = new Set();
    product.availableVariations.forEach(variation => {
      if (variation.attributes.color) {
        // Si une taille est sélectionnée, ne montrer que les couleurs disponibles pour cette taille
        if (!selectedSize || variation.attributes.size === selectedSize) {
          colors.add(variation.attributes.color);
        }
      }
    });
    
    return Array.from(colors);
  }, [product, selectedSize]);
  
  const availableSizes = useMemo(() => {
    if (!product || !product.availableVariations) return [];
    
    const sizes = new Set();
    product.availableVariations.forEach(variation => {
      if (variation.attributes.size) {
        // Si une couleur est sélectionnée, ne montrer que les tailles disponibles pour cette couleur
        if (!selectedColor || variation.attributes.color === selectedColor) {
          sizes.add(variation.attributes.size);
        }
      }
    });
    
    return Array.from(sizes);
  }, [product, selectedColor]);
  
  // Vérifier la disponibilité d'une taille spécifique
  const isSizeAvailable = (size) => {
    if (!product || !product.availableVariations) return false;
    
    return product.availableVariations.some(
      v => v.attributes.size === size && 
      (selectedColor ? v.attributes.color === selectedColor : true) && 
      v.available
    );
  };
  
  // Gérer le changement de couleur
  const handleColorChange = (color) => {
    setSelectedColor(color);
    
    // Trouver une variation correspondante
    if (product && product.availableVariations) {
      const newVariation = product.availableVariations.find(
        v => v.attributes.color === color && 
        (selectedSize ? v.attributes.size === selectedSize : true) &&
        v.available
      );
      
      if (newVariation) {
        setSelectedVariation(newVariation);
        setVariationStock(newVariation.quantity);
        
        // Si aucune taille n'est sélectionnée mais que cette variation a une taille, la sélectionner
        if (!selectedSize && newVariation.attributes.size) {
          setSelectedSize(newVariation.attributes.size);
        }
      } else {
        // Si aucune variation n'est disponible avec la taille actuelle, réinitialiser la taille
        setSelectedSize(null);
        setSelectedVariation(null);
        setVariationStock(null);
      }
    }
  };
  
  // Gérer le changement de taille
  const handleSizeChange = (size) => {
    setSelectedSize(size);
    
    // Trouver une variation correspondante
    if (product && product.availableVariations) {
      const newVariation = product.availableVariations.find(
        v => v.attributes.size === size && 
        (selectedColor ? v.attributes.color === selectedColor : true) &&
        v.available
      );
      
      if (newVariation) {
        setSelectedVariation(newVariation);
        setVariationStock(newVariation.quantity);
        
        // Si aucune couleur n'est sélectionnée mais que cette variation a une couleur, la sélectionner
        if (!selectedColor && newVariation.attributes.color) {
          setSelectedColor(newVariation.attributes.color);
        }
      } else {
        // Si aucune variation n'est disponible avec la couleur actuelle, réinitialiser la couleur
        setSelectedColor(null);
        setSelectedVariation(null);
        setVariationStock(null);
      }
    }
  };
  
  // Gérer la quantité
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    
    const maxStock = variationStock || (product ? product.quantite : 0);
    if (newQuantity > maxStock) {
      newQuantity = maxStock;
      setNotification({
        open: true,
        message: `Stock limité à ${maxStock} unités pour ce produit`,
        severity: 'warning'
      });
    }
    
    setQuantity(newQuantity);
  };
  
  // Ajouter au panier
  const handleAddToCart = () => {
    try {
      if (!product) return;
      
      if (product.productType === 'variable' && !selectedVariation) {
        setNotification({
          open: true,
          message: 'Veuillez sélectionner une variante du produit',
          severity: 'warning'
        });
        return;
      }
      
      if (product.productType === 'variable') {
        // Ajouter le produit avec sa variation
        addToCart({
          ...product,
          variationId: selectedVariation.variationId,
          selectedColor: selectedVariation.attributes.color,
          selectedSize: selectedVariation.attributes.size,
          price: selectedVariation.price || product.oldPrice,
          quantity: quantity
        });
      } else {
        // Ajouter le produit simple
        addToCart({
          ...product,
          quantity: quantity
        });
      }
      
      setNotification({
        open: true,
        message: 'Produit ajouté au panier',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setNotification({
        open: true,
        message: 'Une erreur est survenue',
        severity: 'error'
      });
    }
  };
  
  // Ajouter/Retirer de la liste de souhaits
  const handleWishlistToggle = () => {
    try {
      if (!product) return;
      
      if (isInWish) {
        removeFromWishlist(product._id);
        setIsInWish(false);
        setNotification({
          open: true,
          message: 'Produit retiré de la liste de souhaits',
          severity: 'info'
        });
      } else {
        addToWishlist(product);
        setIsInWish(true);
        setNotification({
          open: true,
          message: 'Produit ajouté à la liste de souhaits',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Erreur avec la liste de souhaits:', error);
      setNotification({
        open: true,
        message: 'Une erreur est survenue',
        severity: 'error'
      });
    }
  };
  
  // Fermer la notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Changer l'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Erreur de chargement
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Container>
    );
  }
  
  // Chargement
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} animation="wave" />
            <Box sx={{ display: 'flex', mt: 2 }}>
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} variant="rectangular" width={80} height={80} sx={{ mr: 1 }} animation="wave" />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} width="80%" animation="wave" />
            <Skeleton variant="text" height={30} width="60%" animation="wave" />
            <Skeleton variant="text" height={50} width="40%" animation="wave" />
            <Skeleton variant="rectangular" height={120} animation="wave" sx={{ my: 2 }} />
            <Skeleton variant="rectangular" height={50} width="60%" animation="wave" sx={{ my: 2 }} />
            <Skeleton variant="rectangular" height={50} animation="wave" />
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Produit introuvable.
        </Alert>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/"
          sx={{ mt: 2 }}
        >
          Retour à l'accueil
        </Button>
      </Container>
    );
  }
  
  // Afficher l'image principale en fonction de la sélection
  const mainImage = selectedVariation && selectedVariation.mainPicture
    ? selectedVariation.mainPicture
    : product.pictures && product.pictures.length > 0
      ? product.pictures[selectedImage]
      : 'https://via.placeholder.com/600x600?text=Produit';
  
  // Déterminer le prix actuel du produit
  const currentPrice = selectedVariation && selectedVariation.price
    ? selectedVariation.price
    : product.discountedPrice || product.oldPrice;
  
  // Calculer le pourcentage de réduction
  const discountPercentage = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.oldPrice) * 100)
    : 0;
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Fil d'Ariane */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Accueil
        </RouterLink>
        {product.categoriesa_id && product.categoriesa_id.length > 0 && (
          <RouterLink 
            to={`/categories/${typeof product.categoriesa_id[0] === 'object' ? product.categoriesa_id[0]._id : product.categoriesa_id[0]}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {typeof product.categoriesa_id[0] === 'object' ? product.categoriesa_id[0].name : 'Catégorie'}
          </RouterLink>
        )}
        <Typography color="text.primary">{product.nom}</Typography>
      </Breadcrumbs>
      
      <Grid container spacing={4}>
        {/* Galerie d'images */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              position: 'relative',
              mb: 2,
              height: 500
            }}
          >
            {product.discountedPrice && (
              <Chip
                label={`-${discountPercentage}%`}
                color="error"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 2,
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  padding: '0 6px'
                }}
              />
            )}
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%' }}
            >
              <VariationImage
                src={mainImage}
                alt={product.nom}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </motion.div>
          </Paper>
          
          {/* Miniatures d'images */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {product.pictures && product.pictures.map((pic, index) => (
              <Box
                key={index}
                onClick={() => setSelectedImage(index)}
                sx={{
                  width: 80,
                  height: 80,
                  border: index === selectedImage ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                <img
                  src={pic}
                  alt={`${product.nom} - vue ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ))}
            
            {/* Afficher les images de variation si disponibles */}
            {selectedVariation && selectedVariation.pictures && selectedVariation.pictures.map((pic, index) => (
              <Box
                key={`var-${index}`}
                sx={{
                  width: 80,
                  height: 80,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.9 },
                  position: 'relative'
                }}
              >
                <img
                  src={pic}
                  alt={`${product.nom} - ${selectedVariation.attributes.color || ''} ${selectedVariation.attributes.size || ''}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.6rem',
                    padding: '2px 0'
                  }}
                >
                  Variation
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
        
        {/* Informations produit */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.nom}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {product.Company_id && (
                <Typography 
                  variant="subtitle1" 
                  component={RouterLink}
                  to={`/companies/${product.Company_id._id}`}
                  sx={{ 
                    textDecoration: 'none',
                    color: 'primary.main',
                    mr: 2,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {product.Company_id.nom}
                </Typography>
              )}
              
              <Chip 
                label={product.productType === 'variable' ? 'Produit à options' : 'Produit simple'} 
                size="small" 
                variant="outlined"
                sx={{ mr: 1 }}
              />
              
              <Chip 
                label={variationStock > 0 ? 'En stock' : 'Épuisé'} 
                color={variationStock > 0 ? 'success' : 'error'}
                size="small"
              />
            </Box>
            
            {/* Prix */}
            <Box sx={{ mb: 3 }}>
              {product.discountedPrice ? (
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography 
                    variant="h3" 
                    component="span" 
                    color="error.main" 
                    sx={{ fontWeight: 'bold', mr: 2 }}
                  >
                    {currentPrice} MRU
                  </Typography>
                  <Typography 
                    variant="h6" 
                    component="span" 
                    sx={{ 
                      textDecoration: 'line-through',
                      color: 'text.secondary'
                    }}
                  >
                    {product.oldPrice} MRU
                  </Typography>
                </Box>
              ) : (
                <Typography variant="h3" component="span" sx={{ fontWeight: 'bold' }}>
                  {currentPrice} MRU
                </Typography>
              )}
            </Box>
            
            {/* Description courte */}
            <Typography variant="body1" sx={{ mb: 3 }}>
              {product.description}
            </Typography>
            
            {/* Options pour produits variables */}
            {product.productType === 'variable' && (
              <Box sx={{ mb: 3 }}>
                {/* Sélection de couleur */}
                {availableColors.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Couleur:</strong> {selectedColor || 'Sélectionnez une couleur'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {availableColors.map((color) => (
                        <Box
                          key={color}
                          onClick={() => handleColorChange(color)}
                          sx={{
                            position: 'relative',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <ColorIndicator 
                            color={color.toLowerCase()}
                            sx={{
                              outline: selectedColor === color ? '2px solid #1976d2' : 'none',
                              outlineOffset: 2
                            }}
                          />
                          {selectedColor === color && (
                            <CheckIcon 
                              sx={{ 
                                position: 'absolute',
                                color: isColorDark(color.toLowerCase()) ? 'white' : 'black',
                                fontSize: 16
                              }} 
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Sélection de taille */}
                {availableSizes.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Taille:</strong> {selectedSize || 'Sélectionnez une taille'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {availableSizes.map((size) => {
                        const isAvailable = isSizeAvailable(size);
                        return (
                          <SizeBox
                            key={size}
                            selected={selectedSize === size}
                            disabled={!isAvailable}
                            onClick={() => isAvailable && handleSizeChange(size)}
                          >
                            {size}
                          </SizeBox>
                        );
                      })}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Guide des tailles disponible dans la description
                    </Typography>
                  </Box>
                )}
                
                {/* Statut du stock */}
                <Typography 
                  variant="body2" 
                  color={selectedVariation && selectedVariation.available ? 'success.main' : 'error.main'}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2 
                  }}
                >
                  {selectedVariation && selectedVariation.available ? (
                    <>
                      <CheckIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {variationStock > 5 
                        ? 'En stock' 
                        : `Dernières pièces disponibles (${variationStock})`}
                    </>
                  ) : (
                    <>
                      <CloseIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Sélectionnez une combinaison disponible
                    </>
                  )}
                </Typography>
              </Box>
            )}
            
            {/* Sélecteur de quantité */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Quantité:</strong>
              </Typography>
              <QuantitySelector>
                <QuantityButton 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </QuantityButton>
                <QuantityDisplay>
                  {quantity}
                </QuantityDisplay>
                <QuantityButton 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= (variationStock || product.quantite || 0)}
                >
                  +
                </QuantityButton>
              </QuantitySelector>
            </Box>
            
            {/* Boutons d'action */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CartIcon />}
                disabled={(product.productType === 'variable' && !selectedVariation) || 
                         (selectedVariation && !selectedVariation.available) ||
                         (product.productType === 'simple' && product.quantite <= 0)}
                onClick={handleAddToCart}
                sx={{ 
                  flex: '1 1 auto',
                  minWidth: '200px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 5
                  }
                }}
              >
                Ajouter au panier
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={isInWish ? <Favorite color="error" /> : <FavoriteBorder />}
                onClick={handleWishlistToggle}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  minWidth: '180px'
                }}
              >
                {isInWish ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </Button>
            </Box>
            
            {/* Information de livraison et retour */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShippingIcon fontSize="small" sx={{ mr: 1 }} />
                  Livraison
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                  Livraison gratuite à partir de 10 000 MRU d'achats.
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReturnIcon fontSize="small" sx={{ mr: 1 }} />
                  Retours
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                  Retour possible sous 14 jours.
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon fontSize="small" sx={{ mr: 1 }} />
                  Paiement sécurisé
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Paiement sécurisé par carte bancaire ou à la livraison.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
      
      {/* Onglets d'information produit */}
      <Box sx={{ mt: 6 }}>
        <Paper elevation={0} sx={{ boxShadow: 1, borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              backgroundColor: 'grey.50'
            }}
          >
            <Tab label="Description" />
            <Tab label="Détails" />
            <Tab label="Catégories" />
            {product.productType === 'variable' && <Tab label="Tableau des tailles" />}
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Description complète
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {product.description || 'Aucune description disponible pour ce produit.'}
                </Typography>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Caractéristiques
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {product.features || 'Aucune caractéristique disponible pour ce produit.'}
                </Typography>
                
                {/* Informations supplémentaires */}
                <Box sx={{ mt: 3 }}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Référence</TableCell>
                          <TableCell>{product.id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Marque</TableCell>
                          <TableCell>{product.Company_id ? product.Company_id.nom : 'Non spécifiée'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Type de produit</TableCell>
                          <TableCell>{product.productType === 'variable' ? 'Produit à options' : 'Produit simple'}</TableCell>
                        </TableRow>
                        {selectedVariation && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                            <TableCell>{selectedVariation.sku}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
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
                          to={`/categories/${typeof subcategory === 'object' && subcategory.categories_id ? 
                            (typeof subcategory.categories_id === 'object' ? subcategory.categories_id._id : subcategory.categories_id) 
                            : '#'}`}
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
            
            {tabValue === 3 && product.productType === 'variable' && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Tableau des tailles et disponibilités
                </Typography>
                
                {product.availableVariations && product.availableVariations.length > 0 ? (
                  <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell><strong>Couleur</strong></TableCell>
                          <TableCell><strong>Taille</strong></TableCell>
                          <TableCell align="right"><strong>Prix</strong></TableCell>
                          <TableCell align="center"><strong>Disponibilité</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {product.availableVariations.map((variation, index) => (
                          <TableRow 
                            key={index}
                            sx={{ 
                              '&:hover': { bgcolor: 'action.hover' },
                              bgcolor: selectedVariation && selectedVariation.variationId === variation.variationId ? 'primary.light' : 'inherit',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              if (variation.available) {
                                setSelectedColor(variation.attributes.color);
                                setSelectedSize(variation.attributes.size);
                                setSelectedVariation(variation);
                                setVariationStock(variation.quantity);
                              }
                            }}
                          >
                            <TableCell>
                              {variation.attributes.color ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    sx={{ 
                                      width: 20, 
                                      height: 20, 
                                      borderRadius: '50%', 
                                      bgcolor: variation.attributes.color.toLowerCase(),
                                      border: '1px solid',
                                      borderColor: 'grey.300',
                                      mr: 1
                                    }} 
                                  />
                                  {variation.attributes.color}
                                </Box>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{variation.attributes.size || '-'}</TableCell>
                            <TableCell align="right">
                              {variation.price ? (
                                `${variation.price} MRU`
                              ) : (
                                `${product.oldPrice} MRU`
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={variation.available ? 'Disponible' : 'Épuisé'} 
                                color={variation.available ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune information de tailles disponible pour ce produit.
                  </Typography>
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