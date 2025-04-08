import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem,
  TextField, Typography, Box, Divider, Alert
} from '@mui/material';

const StatusUpdateDialog = ({ open, onClose, onUpdateStatus, order, statuses }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  
  // Réinitialiser les états lorsque la boîte de dialogue s'ouvre
  React.useEffect(() => {
    if (open && order) {
      setSelectedStatus(order.status);
      setComment('');
      setError('');
    }
  }, [open, order]);
  
  // Gérer la mise à jour du statut
  const handleUpdate = () => {
    if (!selectedStatus) {
      setError('Veuillez sélectionner un statut');
      return;
    }
    
    onUpdateStatus(selectedStatus, comment);
  };
  
  if (!order) return null;
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Mettre à jour le statut de la commande
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
          Commande #{order.orderNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Client: {order.customer.firstName} {order.customer.lastName}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            label="Statut"
          >
            {statuses.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Commentaire (optionnel)"
          multiline
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ajoutez un commentaire sur la mise à jour du statut..."
        />
        
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Si vous définissez le statut sur "payée", la commande sera automatiquement marquée comme payée avec la date actuelle.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Annuler
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleUpdate}
        >
          Mettre à jour
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateDialog;