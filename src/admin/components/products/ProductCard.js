import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardMedia, CardContent, Box, Typography, Grid, Chip,
  IconButton, Tooltip
} from '@mui/material';
import { Edit, Delete, LocalOffer, Photo, AttachMoney, Category } from '@mui/icons-material';
import { format } from 'date-fns';

/**
 * Composant de carte produit pour afficher un produit dans la liste
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.product - Données du produit
 * @param {Function} props.onEdit - Fonction appelée pour éditer le produit
 * @param {Function} props.onDelete - Fonction appelée pour supprimer le produit
 * @param {Function} props.onManageImages - Fonction appelée pour gérer les images
 * @param {Function} props.onManageDiscount - Fonction appelée pour gérer la remise
 * @param {Function} props.onRemoveDiscount - Fonction appelée pour supprimer la remise
 */
const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onManageImages, 
  onManageDiscount, 
  onRemoveDiscount 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={product.mainPicture || '/placeholder-image.jpg'}
        alt={product.nom}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {product.nom}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.description?.substring(0, 100)}
          {product.description?.length > 100 ? '...' : ''}
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Prix:</strong> {product.oldPrice} €
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Stock:</strong> {product.quantite}
            </Typography>
          </Grid>
          {product.discountedPrice && (
            <Grid item xs={12}>
              <Typography variant="body2" color="error">
                <strong>Prix réduit:</strong> {product.discountedPrice} €
                {product.discountDuration && (
                  <span> (jusqu'au {format(new Date(product.discountDuration), 'dd/MM/yyyy')})</span>
                )}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="body2">
              <strong>Entreprise:</strong> {product.Company_id?.nom || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {product.categoriesa_id?.map((category) => (
                <Chip
                  key={category?._id || `temp-${Math.random()}`}
                  label={category?.name || 'N/A'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Tooltip title="Modifier">
            <IconButton onClick={() => navigate(`/admin/products/edit/${product._id}`)}>
              <Edit />
            </IconButton>
          </Tooltip>
          {product.productType === 'variable' && (
            <Tooltip title="Produit variable">
              <IconButton color="secondary">
                <Category />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Supprimer">
            <IconButton onClick={() => onDelete(product._id)}>
              <Delete color="error" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title="Gérer les images">
            <IconButton onClick={() => onManageImages(product)}>
              <Photo color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title={product.discountedPrice ? "Modifier la remise" : "Ajouter une remise"}>
            <IconButton onClick={() => onManageDiscount(product)}>
              <LocalOffer color={product.discountedPrice ? "error" : "action"} />
            </IconButton>
          </Tooltip>
          {product.discountedPrice && (
            <Tooltip title="Supprimer la remise">
              <IconButton onClick={() => onRemoveDiscount(product._id)}>
                <AttachMoney color="error" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default ProductCard;