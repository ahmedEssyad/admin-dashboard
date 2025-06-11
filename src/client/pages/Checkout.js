import React, { useState } from 'react';
import {
  Container, Typography, Box, Paper, Grid, Button, 
  TextField, Stepper, Step, StepLabel, Divider,
  Radio, RadioGroup, FormControlLabel, FormControl,
  FormLabel, Alert, CircularProgress, List, ListItem,
  ListItemText, ListItemAvatar, Avatar
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  AccountCircle as AccountIcon,
  Payment as PaymentIcon,
  CheckCircle as ConfirmIcon
} from '@mui/icons-material';
import { useCart } from '../../shared/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../shared/api/axiosConfig';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  // États du formulaire
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    
    phone: ''
  });
  
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'Mauritanie',
    additionalInfo: ''
  });
  
  // Étapes du processus de commande
  const steps = ['Informations client', 'Adresse de livraison', 'Confirmation'];
  
  // Gérer les changements dans le formulaire client
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // Gérer les changements dans le formulaire d'adresse
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };
  
  // Validation du formulaire client
  const validateCustomerInfo = () => {
    if (!customerInfo.firstName.trim()) return "Le prénom est requis";
    if (!customerInfo.lastName.trim()) return "Le nom est requis";
    
    if (!customerInfo.phone.trim()) return "Le numéro de téléphone est requis";
    return "";
  };
  
  // Validation du formulaire d'adresse
  const validateShippingAddress = () => {
    if (!shippingAddress.address.trim()) return "L'adresse est requise";
    if (!shippingAddress.city.trim()) return "La ville est requise";
    if (!shippingAddress.postalCode.trim()) return "Le code postal est requis";
    return "";
  };
  
  // Passer à l'étape suivante
  const handleNext = () => {
    let validationError = "";
    
    if (activeStep === 0) {
      validationError = validateCustomerInfo();
    } else if (activeStep === 1) {
      validationError = validateShippingAddress();
    }
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setActiveStep(prevStep => prevStep + 1);
  };
  
  // Revenir à l'étape précédente
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
    setError('');
  };
  
  // Soumettre la commande
  const handleSubmitOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Préparer les données de la commande
      const orderData = {
        customer: customerInfo,
        shippingAddress,
        items: cartItems.map(item => {
          // Structure de base pour tous les produits
          const orderItem = {
            product: item._id,
            quantity: item.quantity
          };
          
          // Ajouter les informations de variation pour les produits variables
          if (item.productType === 'variable') {
            // Si le produit a un variationId, l'ajouter
            if (item.variationId) {
              orderItem.variationId = item.variationId;
            }
            
            // Ajouter les attributs de variation si disponibles
            if (item.selectedColor || item.selectedSize) {
              orderItem.variation = {
                color: item.selectedColor || null,
                size: item.selectedSize || null
              };
            }
          }
          
          return orderItem;
        })
      };
      
      // Envoyer la commande au serveur
      const response = await axiosInstance.post('/orders', orderData);
      
      // Traiter la réponse
      if (response.data.success) {
        setOrderNumber(response.data.data.orderNumber || 'ORDER-' + new Date().getTime());
        setOrderComplete(true);
        clearCart();
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Erreur lors de la création de la commande:', error);
      
      // Message d'erreur détaillé et adapté
      let errorMessage = 'Une erreur est survenue lors de la création de votre commande.';
      
      // Détection spécifique des différents types d'erreurs
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Le serveur met trop de temps à répondre. Veuillez réessayer plus tard.';
      } else if (error.response) {
        // Erreur de réponse du serveur
        if (error.response.status === 500) {
          errorMessage = 'Erreur interne du serveur. Notre équipe a été notifiée du problème.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Les données de commande sont invalides.';
        } else if (error.response.status === 401) {
          errorMessage = 'Vous devez être connecté pour passer une commande.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Requête envoyée mais pas de réponse
        errorMessage = 'Impossible de contacter le serveur. Veuillez vérifier votre connexion Internet.';
      }
      
      setError(errorMessage);
    }
  };
  
  // Obtenir le prix d'un produit
  const getProductPrice = (product) => {
    if (product.discountedPrice) return product.discountedPrice;
    if (product.oldPrice) return product.oldPrice;
    if (product.price) return product.price;
    return 0;
  };
  
  // Obtenir l'image d'un produit
  const getProductImage = (product) => {
    if (product.mainPicture) return product.mainPicture;
    if (product.pictures && product.pictures.length > 0) return product.pictures[0];
    if (product.image) return product.image;
    return 'https://via.placeholder.com/100x100?text=Produit';
  };
  
  // Contenu de l'étape en cours
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Informations client
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Prénom"
                  name="firstName"
                  value={customerInfo.firstName}
                  onChange={handleCustomerChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Nom"
                  name="lastName"
                  value={customerInfo.lastName}
                  onChange={handleCustomerChange}
                />
              </Grid>
              

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleCustomerChange}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Adresse de livraison
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Adresse"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Ville"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Code postal"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pays"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Informations complémentaires (optionnel)"
                  name="additionalInfo"
                  multiline
                  rows={3}
                  value={shippingAddress.additionalInfo}
                  onChange={handleAddressChange}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Résumé de votre commande
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Informations client:
              </Typography>
              <Typography>
                {customerInfo.firstName} {customerInfo.lastName}
              </Typography>
              

              <Typography>{customerInfo.phone}</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Adresse de livraison:
              </Typography>
              <Typography>{shippingAddress.address}</Typography>
              <Typography>
                {shippingAddress.postalCode} {shippingAddress.city}
              </Typography>
              <Typography>{shippingAddress.country}</Typography>
              {shippingAddress.additionalInfo && (
                <Typography variant="body2" color="text.secondary">
                  {shippingAddress.additionalInfo}
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" fontWeight="bold">
              Articles commandés:
            </Typography>
            
            <List sx={{ width: '100%' }}>
              {cartItems.map(item => (
                <ListItem key={item._id} alignItems="flex-start" sx={{ py: 2, px: 0 }}>
                  <ListItemAvatar>
                    <Avatar 
                      alt={item.nom || item.name} 
                      src={getProductImage(item)}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.nom || item.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Quantité: {item.quantity}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.primary">
                          Prix unitaire: {getProductPrice(item).toFixed(2)} MRU
                        </Typography>
                        {item.productType === 'variable' && (
                          <>
                            <br />
                            <Typography component="span" variant="body2" color="text.primary">
                              {item.selectedColor && `Couleur: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && ' / '}
                              {item.selectedSize && `Taille: ${item.selectedSize}`}
                            </Typography>
                          </>
                        )}
                      </>
                    }
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {(getProductPrice(item) * item.quantity).toFixed(2)} MRU
                  </Typography>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {getCartTotal().toFixed(2)} MRU
              </Typography>
            </Box>
            
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Mode de paiement:
              </Typography>
              <Typography>
                Paiement à la livraison
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vous paierez en espèces ou par carte bancaire au moment de la livraison.
              </Typography>
            </Box>
          </Box>
        );
      default:
        return 'Étape inconnue';
    }
  };
  
  // Affichage de la commande réussie
  if (orderComplete) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ConfirmIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Merci pour votre commande !
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            N° de commande: {orderNumber}
          </Typography>
          
          <Typography variant="body1" paragraph>
            Vous pouvez suivre l'état de votre commande grâce au numéro de commande ci-dessus.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Le paiement se fera à la livraison, en espèces ou par carte bancaire.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Retour à l'accueil
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" gutterBottom align="center">
          Finaliser votre commande
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Retour
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitOrder}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Traitement en cours...' : 'Confirmer la commande'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Suivant
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Checkout;