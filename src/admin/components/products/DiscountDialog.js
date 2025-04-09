import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, InputAdornment
} from '@mui/material';

/**
 * Dialogue de gestion des remises pour un produit
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.open - Indique si le dialogue est ouvert
 * @param {Function} props.onClose - Fonction appelée lors de la fermeture
 * @param {Object} props.discountData - Données de la remise
 * @param {Function} props.onChange - Fonction appelée lors du changement des champs
 * @param {Function} props.onSubmit - Fonction appelée lors de la soumission
 */
const DiscountDialog = ({
  open,
  onClose,
  discountData,
  onChange,
  onSubmit
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Gérer la remise</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="discountedPrice"
              label="Prix remisé (€)"
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
              value={discountData.discountedPrice}
              onChange={onChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="discountDuration"
              label="Valable jusqu'au"
              type="date"
              fullWidth
              value={discountData.discountDuration}
              onChange={onChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!discountData.discountedPrice}
        >
          Appliquer la remise
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscountDialog;