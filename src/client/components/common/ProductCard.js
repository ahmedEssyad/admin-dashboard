import React from 'react';
import { 
  Card, CardContent, CardMedia, Typography, Box, 
  CardActionArea, Chip, IconButton, CardActions, Button,
  Tooltip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useCart } from '../../../shared/contexts/CartContext';
import { useWishlist } from '../../../shared/contexts/WishlistContext';
import { toast } from 'react-toastify';
import { 
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as CartIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  if (!product || !product._id) {
    console.error('Product data is invalid:', product);
    return null;
  }

  const isProductInWishlist = isInWishlist(product._id);

  // Calculer le pourcentage de réduction si le produit est en promotion
  const discountPercentage = product.discountedPrice 
    ? Math.round((1 - product.discountedPrice / product.oldPrice) * 100) 
    : 0;

  // Ajouter un délai basé sur l'index pour l'animation staggered
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: index ? index * 0.1 : 0
      }
    }
  };

  const handleWishlistToggle = (e) => {
    try {
      e.preventDefault(); // Empêcher la navigation
      if (isProductInWishlist) {
        removeFromWishlist(product._id);
        toast.success('Produit retiré de la liste de souhaits');
      } else {
        addToWishlist(product);
        toast.success('Produit ajouté à la liste de souhaits');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion de la wishlist:', error);
      toast.error('Une erreur est survenue');
    }
  };

  const handleAddToCart = (e) => {
    try {
      e.preventDefault(); // Empêcher la navigation
      if (product.quantite === 0) {
        toast.error('Produit en rupture de stock');
        return;
      }
      addToCart(product);
      toast.success('Produit ajouté au panier');
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast.error('Une erreur est survenue');
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s ease',
          borderRadius: 3,
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: 6
          }
        }}
        elevation={2}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardActionArea 
            component={Link} 
            to={`/products/${product._id}`}
            sx={{ 
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transition: 'background-color 0.3s ease',
                backgroundColor: 'transparent'
              },
              '&:hover::before': {
                backgroundColor: 'rgba(0,0,0,0.05)'
              }
            }}
          >
            {product.mainPicture ? (
              <LazyLoadImage
                src={product.mainPicture}
                alt={product.nom}
                effect="blur"
                style={{ 
                  height: 250, 
                  width: '100%', 
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.3s ease'
                }}
                wrapperProps={{
                  style: { 
                    width: '100%', 
                    height: 250,
                    overflow: 'hidden'
                  }
                }}
              />
            ) : (
              <CardMedia
                component="img"
                height="250"
                image="https://via.placeholder.com/300x250?text=Produit"
                alt={product.nom}
              />
            )}
          </CardActionArea>
          
          {/* Badges de statut */}
          <Box sx={{ position: 'absolute', top: 10, width: '100%', px: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              {product.discountedPrice && (
                <Chip
                  label={`-${discountPercentage}%`}
                  color="error"
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    mr: 1
                  }}
                />
              )}
              {product.quantite !== undefined && product.quantite > 0 && product.quantite <= 5 && (
                <Chip
                  label={`Stock: ${product.quantite}`}
                  color="warning"
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
            
            <Tooltip title={isProductInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}>
              <IconButton
                onClick={handleWishlistToggle}
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'background.default',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isProductInWishlist ? (
                  <FavoriteIcon color="error" />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
          
        <CardContent sx={{ flexGrow: 1, pb: 0 }}>
          <Typography 
            variant="h6" 
            component="div" 
            noWrap 
            title={product.nom}
            sx={{ mb: 1 }}
          >
            {product.nom}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {product.Company_id?.nom || 'Marque non spécifiée'}
          </Typography>
          
          {/* Description courte - optionnelle */}
          {product.description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 1
              }}
            >
              {product.description}
            </Typography>
          )}
          
          {/* Prix */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            {product.discountedPrice ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ 
                    textDecoration: 'line-through', 
                    mr: 1,
                    opacity: 0.7
                  }}
                >
                  {product.oldPrice} €
                </Typography>
                <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                  {product.discountedPrice} €
                </Typography>
              </Box>
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {product.oldPrice} €
              </Typography>
            )}
            
            <Tooltip title="Détails du produit">
              <IconButton 
                component={Link} 
                to={`/products/${product._id}`}
                size="small"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    color: 'primary.main',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            startIcon={<CartIcon />}
            fullWidth
            onClick={handleAddToCart}
            disabled={product.quantite === 0}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              '&:not(:disabled):hover': {
                transform: 'scale(1.02)',
                boxShadow: 4
              },
              transition: 'all 0.3s ease'
            }}
          >
            {product.quantite === 0 ? 'Épuisé' : 'Ajouter au panier'}
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default ProductCard;