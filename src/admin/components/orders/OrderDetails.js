import React from 'react';
import {
  Box, Typography, Grid, Paper, Divider, Chip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  List, ListItem, ListItemText, Avatar, Stepper, Step, StepLabel
} from '@mui/material';

const OrderDetails = ({ order }) => {
  if (!order) return null;
  
  // Statuts pour le stepper
  const allStatuses = ['en attente', 'confirmée', 'en préparation', 'expédiée', 'livrée', 'payée'];
  
  // Obtenir l'index actuel dans le flux de statuts
  // Si le statut est "annulée", on affiche différemment
  const getCurrentStatusIndex = () => {
    if (order.status === 'annulée') return -1;
    return allStatuses.indexOf(order.status);
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  return (
    <Box>
      {/* En-tête */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Commande #{order.orderNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Créée le {formatDate(order.createdAt)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
          <Chip 
            label={order.status} 
            color={order.status === 'annulée' ? 'error' : 
                   order.status === 'livrée' || order.status === 'payée' ? 'success' : 
                   order.status === 'expédiée' ? 'primary' : 
                   order.status === 'en préparation' ? 'secondary' : 
                   'warning'}
            sx={{ mb: 1 }}
          />
          <Typography variant="body2">
            Paiement: {order.isPaid ? 'Payé' : 'En attente de paiement'}
            {order.paymentDate && ` (${formatDate(order.paymentDate)})`}
          </Typography>
        </Grid>
      </Grid>
      
      {/* Stepper de progression */}
      {order.status !== 'annulée' ? (
        <Box sx={{ mb: 4, mt: 3 }}>
          <Stepper activeStep={getCurrentStatusIndex()} alternativeLabel>
            {allStatuses.map((label) => (
              <Step key={label}>
                <StepLabel>{label.charAt(0).toUpperCase() + label.slice(1)}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      ) : (
        <Box sx={{ mb: 4, mt: 3, bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
          <Typography color="error" align="center">
            Cette commande a été annulée
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      {/* Informations client et livraison */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Informations client
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography>
              {order.customer.firstName} {order.customer.lastName}
            </Typography>
            
            <Typography variant="body2">
              Téléphone: {order.customer.phone}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Adresse de livraison
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body1">
              {order.shippingAddress.address}
            </Typography>
            <Typography variant="body1">
              {order.shippingAddress.postalCode} {order.shippingAddress.city}
            </Typography>
            <Typography variant="body1">
              {order.shippingAddress.country}
            </Typography>
            {order.shippingAddress.additionalInfo && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Informations complémentaires: {order.shippingAddress.additionalInfo}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Produits commandés */}
      <Typography variant="h6" gutterBottom>
        Produits commandés
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell align="center">Prix unitaire</TableCell>
              <TableCell align="center">Quantité</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {order.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {item.product && item.product.mainPicture && (
                      <Avatar
                        src={item.product.mainPicture}
                        alt={item.productName}
                        variant="rounded"
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                    )}
                    <Box>
                      <Typography variant="body2">{item.productName}</Typography>
                      {item.product && item.product.Company_id && (
                        <Typography variant="caption" color="text.secondary">
                          {typeof item.product.Company_id === 'object'
                            ? item.product.Company_id.nom
                            : 'Marque'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">{item.price.toFixed(2)} €</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">{item.totalPrice.toFixed(2)} €</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                Total
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                {order.totalAmount.toFixed(2)} €
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Historique des statuts */}
      <Typography variant="h6" gutterBottom>
        Historique
      </Typography>
      <Paper variant="outlined" sx={{ p: 0 }}>
        <List sx={{ width: '100%' }}>
          {order.statusHistory?.map((history, index) => (
            <ListItem key={index} divider={index < order.statusHistory.length - 1}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      Statut: <Chip size="small" label={history.status} sx={{ ml: 1 }} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(history.date)}
                    </Typography>
                  </Box>
                }
                secondary={history.comment && `Commentaire: ${history.comment}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      
      {/* Notes */}
      {order.notes && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notes
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2">{order.notes}</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default OrderDetails;