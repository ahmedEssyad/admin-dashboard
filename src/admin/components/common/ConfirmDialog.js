import React from 'react';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button 
} from '@mui/material';

function ConfirmDialog({ 
  open, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Annuler
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;