import React, { useState } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { 
  Inventory as SimpleIcon, 
  Category as VariableIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosConfig';

const ProductTypeSelector = ({ productId, productType, onProductTypeChange }) => {
  const [type, setType] = useState(productType || 'simple');
  const [openDialog, setOpenDialog] = useState(false);
  const [targetType, setTargetType] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (event, newType) => {
    if (newType && newType !== type) {
      setTargetType(newType);
      setOpenDialog(true);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Vérifier si productId est défini et valide avant de procéder
      if (!productId) {
        toast.error("ID du produit non défini. Veuillez d'abord enregistrer le produit avant de le convertir.");
        return;
      }
      
      const endpoint = `/products/${productId}/convert-to-${targetType}`;
      const response = await axiosInstance.put(endpoint);
      
      if (response.data && response.data.product) {
        setType(targetType);
        
        if (onProductTypeChange) {
          onProductTypeChange(targetType, response.data.product);
        }
        
        toast.success(`Produit converti en produit ${targetType === 'simple' ? 'simple' : 'variable'} avec succès.`);
      }
    } catch (error) {
      console.error('Erreur lors de la conversion du produit:', error);
      toast.error(`Erreur lors de la conversion du produit: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  const handleCancel = () => {
    setOpenDialog(false);
    setTargetType(null);
  };

  const getTypeLabel = (type) => {
    return type === 'simple' ? 'Produit simple' : 'Produit variable';
  };

  const getTypeDescription = (type) => {
    return type === 'simple' 
      ? 'Un produit unique sans variations (couleur, taille, etc.)' 
      : 'Un produit avec plusieurs variations (couleur, taille, etc.)';
  };

  const getConfirmMessage = () => {
    if (targetType === 'simple') {
      return 'Cette action va convertir le produit variable en produit simple. Toutes les variations seront fusionnées et le stock total sera conservé. Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?';
    } else {
      return 'Cette action va convertir le produit simple en produit variable. Une variation par défaut sera créée avec le stock actuel. Vous pourrez ensuite ajouter d\'autres variations. Voulez-vous continuer ?';
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Type de produit
      </Typography>
      
      <ToggleButtonGroup
        value={type}
        exclusive
        onChange={handleTypeChange}
        aria-label="type de produit"
        sx={{ mb: 1 }}
      >
        <ToggleButton value="simple" aria-label="produit simple">
          <SimpleIcon sx={{ mr: 1 }} />
          Simple
        </ToggleButton>
        <ToggleButton value="variable" aria-label="produit variable">
          <VariableIcon sx={{ mr: 1 }} />
          Variable
        </ToggleButton>
      </ToggleButtonGroup>
      
      <Typography variant="body2" color="text.secondary">
        {getTypeDescription(type)}
      </Typography>
      
      {/* Dialogue de confirmation */}
      <Dialog
        open={openDialog}
        onClose={handleCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Convertir en {getTypeLabel(targetType)}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {getConfirmMessage()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm} 
            autoFocus 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Conversion en cours...' : 'Convertir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductTypeSelector;