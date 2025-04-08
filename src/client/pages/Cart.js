import React from 'react';
import {
  Container, Typography, Box, Paper, Grid, IconButton,
  Button, TextField, Divider, useTheme, Avatar, 
  Badge, Card, CardContent, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingBag as ShoppingBagIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useCart } from '../../shared/contexts/CartContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Cart = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Fonction pour obtenir le bon prix du produit (corrige le problème NaN)
  const getProductPrice = (product) => {
    // Essayez d'abord de récupérer le prix réduit s'il existe
    if (product.discountedPrice && !isNaN(parseFloat(product.discountedPrice))) {
      return parseFloat(product.discountedPrice);
    }
    
    // Sinon, essayez le prix régulier s'il existe
    if (product.oldPrice && !isNaN(parseFloat(product.oldPrice))) {
      return parseFloat(product.oldPrice);
    }
    
    // Sinon, essayez le champ 'price' direct s'il existe
    if (product.price && !isNaN(parseFloat(product.price))) {
      return parseFloat(product.price);
    }
    
    // Si aucun prix valide n'est trouvé, retourner 0
    return 0;
  };
  
  // Fonction pour obtenir l'image du produit
  const getProductImage = (product) => {
    if (product.mainPicture) return product.mainPicture;
    if (product.pictures && product.pictures.length > 0) return product.pictures[0];
    if (product.image) return product.image;
    return 'https://via.placeholder.com/100x100?text=Produit';
  };
  
  // Fonction pour obtenir le nom du produit
  const getProductName = (product) => {
    return product.nom || product.name || 'Produit sans nom';
  };
  
  // Fonction pour passer à la page de checkout
  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  // Panier vide
  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              borderRadius: 2,
              background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`
            }}
          >
            <ShoppingBagIcon sx={{ fontSize: 80, color: 'primary.light', mb: 2, opacity: 0.7 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Votre panier est vide
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
              Vous n'avez pas encore ajouté de produits à votre panier. Découvrez notre catalogue pour trouver des produits qui vous plaisent.
            </Typography>
            <Button
              component={RouterLink}
              to="/products"
              variant="contained"
              color="primary"
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Découvrir nos produits
            </Button>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  // Panier avec produits
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold"
          sx={{ 
            pb: 1,
            borderBottom: `3px solid ${theme.palette.primary.main}`,
            display: 'inline-block'
          }}
        >
          Mon Panier
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
          {cartItems.length} {cartItems.length > 1 ? 'articles' : 'article'} dans votre panier
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Liste des produits */}
        <Grid item xs={12} lg={8}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {cartItems.map((item) => {
                const productPrice = getProductPrice(item);
                const productImage = getProductImage(item);
                const productName = getProductName(item);
                
                return (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                  >
                    <Card 
                      elevation={0} 
                      sx={{ 
                        mb: 2, 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: 'transparent'
                        }
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 2
                          }}
                        >
                          {/* Image du produit */}
                          <Box
                            component={RouterLink}
                            to={`/products/${item._id}`}
                            sx={{
                              borderRadius: 2,
                              overflow: 'hidden',
                              flexShrink: 0,
                              width: { xs: '100%', sm: 120 },
                              height: { xs: 200, sm: 120 },
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              background: theme.palette.grey[100],
                              textDecoration: 'none'
                            }}
                          >
                            <img
                              src={productImage}
                              alt={productName}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          </Box>
                          
                          {/* Informations du produit */}
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                              variant="h6" 
                              component={RouterLink}
                              to={`/products/${item._id}`}
                              sx={{ 
                                textDecoration: 'none',
                                color: 'text.primary',
                                '&:hover': {
                                  color: 'primary.main'
                                },
                                display: 'block',
                                mb: 1
                              }}
                            >
                              {productName}
                            </Typography>
                            
                            {item.Company_id && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Marque: {typeof item.Company_id === 'object' ? item.Company_id.nom : item.Company_id}
                              </Typography>
                            )}
                            
                            <Typography variant="body1" fontWeight="medium" color="primary">
                              Prix unitaire: {productPrice.toFixed(2)} €
                            </Typography>
                            
                            {/* Contrôles de quantité */}
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mt: 2,
                                gap: 1
                              }}
                            >
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                                sx={{ 
                                  border: '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              
                              <TextField
                                size="small"
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value) && value > 0) {
                                    updateQuantity(item._id, value);
                                  }
                                }}
                                sx={{ 
                                  width: 60,
                                  '& .MuiOutlinedInput-input': {
                                    textAlign: 'center',
                                    py: 1
                                  }
                                }}
                                InputProps={{ 
                                  inputProps: { 
                                    min: 1, 
                                    style: { textAlign: 'center' } 
                                  } 
                                }}
                              />
                              
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                sx={{ 
                                  border: '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          
                          {/* Prix total et bouton supprimer */}
                          <Box 
                            sx={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: { xs: 'flex-start', sm: 'flex-end' },
                              justifyContent: 'space-between',
                              minWidth: { xs: 'auto', sm: 120 },
                              mt: { xs: 2, sm: 0 }
                            }}
                          >
                            <Typography variant="h6" color="primary.dark" fontWeight="bold">
                              {(productPrice * item.quantity).toFixed(2)} €
                            </Typography>
                            
                            <Tooltip title="Supprimer du panier">
                              <IconButton
                                color="error"
                                onClick={() => removeFromCart(item._id)}
                                sx={{ 
                                  mt: { xs: 1, sm: 2 },
                                  '&:hover': {
                                    bgcolor: 'error.lighter'
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                            </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </Paper>
          </motion.div>
          
          {/* Bouton continuer les achats */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              component={RouterLink}
              to="/products"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Continuer les achats
            </Button>
          </Box>
        </Grid>
        
        {/* Résumé de commande */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                position: 'sticky', 
                top: 100,
                background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})` 
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom 
                fontWeight="bold"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3
                }}
              >
                Résumé de la commande
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Détails des prix */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Sous-total</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getCartTotal().toFixed(2)} €
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Frais de livraison</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {cartItems.length > 0 ? 'Gratuit' : '0.00 €'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">TVA (20%)</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {(getCartTotal() * 0.2).toFixed(2)} €
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Total</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.dark">
                  {getCartTotal().toFixed(2)} €
                </Typography>
              </Box>
              
              {/* Bouton de paiement */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 5
                  }
                }}
                onClick={handleProceedToCheckout}
              >
                Passer à la caisse
              </Button>
              
              {/* Infos supplémentaires */}
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: 'primary.lighter', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                <InfoIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Livraison offerte pour toute commande en France métropolitaine. Retours gratuits sous 30 jours.
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;