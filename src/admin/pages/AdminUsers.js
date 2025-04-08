import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Block as BlockIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../shared/contexts/AuthContext';

// Constantes pour les rôles
const ROLES = [
  { value: 'superAdmin', label: 'Super Admin', description: 'Accès complet à toutes les fonctionnalités' },
  { value: 'productManager', label: 'Responsable des produits', description: 'Gestion des produits uniquement' },
  { value: 'orderManager', label: 'Responsable des commandes', description: 'Gestion des commandes uniquement' },
  { value: 'contentEditor', label: 'Éditeur de contenu', description: 'Gestion des catégories et descriptions' }
];

const AdminUsers = () => {
  const { currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' ou 'edit'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'contentEditor',
    active: true
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/auth/admins');
      setAdmins(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des administrateurs:', error);
      toast.error('Erreur lors du chargement des administrateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, admin = null) => {
    setDialogMode(mode);
    setSelectedAdmin(admin);
    
    if (mode === 'edit' && admin) {
      setFormData({
        username: admin.username,
        password: '', // Ne pas pré-remplir le mot de passe
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email || '',
        role: admin.role,
        active: admin.active !== false
      });
    } else {
      // Reset form for 'add' mode
      setFormData({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'contentEditor',
        active: true
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAdmin(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async () => {
    try {
      // Validation de base
      if (!formData.username) {
        toast.error('Le nom d\'utilisateur est requis');
        return;
      }

      if (dialogMode === 'add' && !formData.password) {
        toast.error('Le mot de passe est requis pour un nouvel administrateur');
        return;
      }

      if (dialogMode === 'add') {
        // Créer un nouvel administrateur
        await axiosInstance.post('/auth/admins', formData);
        toast.success('Administrateur créé avec succès');
      } else {
        // Mettre à jour un administrateur existant
        const updatedData = { ...formData };
        
        // Ne pas envoyer le mot de passe s'il est vide
        if (!updatedData.password) {
          delete updatedData.password;
        }
        
        await axiosInstance.put(`/auth/admins/${selectedAdmin._id}`, updatedData);
        toast.success('Administrateur mis à jour avec succès');
      }
      
      handleCloseDialog();
      fetchAdmins();
    } catch (error) {
      console.error('Erreur lors de l\'opération:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Une erreur est survenue');
      }
    }
  };

  const handleOpenDeleteDialog = (admin) => {
    setAdminToDelete(admin);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setAdminToDelete(null);
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    try {
      await axiosInstance.delete(`/auth/admins/${adminToDelete._id}`);
      toast.success('Administrateur supprimé avec succès');
      fetchAdmins();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Une erreur est survenue lors de la suppression');
      }
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const getRoleLabel = (roleValue) => {
    const role = ROLES.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  // Vérifier si l'utilisateur actuel est lui-même
  const isSelf = (adminId) => {
    return currentUser && currentUser.id === adminId;
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des administrateurs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Ajouter un administrateur
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nom d'utilisateur</TableCell>
                <TableCell>Nom complet</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Dernière connexion</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Chargement en cours...
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun administrateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin._id} hover>
                    <TableCell>
                      {admin.username}
                      {isSelf(admin._id) && (
                        <Chip
                          size="small"
                          label="Vous"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{`${admin.firstName || ''} ${admin.lastName || ''}`}</TableCell>
                    <TableCell>{admin.email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(admin.role)}
                        color={admin.role === 'superAdmin' ? 'error' : 'primary'}
                        variant={admin.role === 'superAdmin' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      {admin.active !== false ? (
                        <Chip
                          icon={<CheckIcon />}
                          label="Actif"
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<BlockIcon />}
                          label="Inactif"
                          color="error"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {admin.lastLogin 
                        ? new Date(admin.lastLogin).toLocaleString() 
                        : 'Jamais connecté'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Modifier">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog('edit', admin)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {!isSelf(admin._id) && (
                        <Tooltip title="Supprimer">
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(admin)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogue d'ajout/édition d'administrateur */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Ajouter un administrateur' : 'Modifier l\'administrateur'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="username"
                label="Nom d'utilisateur"
                value={formData.username}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={dialogMode === 'edit'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label={dialogMode === 'add' ? 'Mot de passe' : 'Nouveau mot de passe (laisser vide pour ne pas modifier)'}
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required={dialogMode === 'add'}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="firstName"
                label="Prénom"
                value={formData.firstName}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="lastName"
                label="Nom"
                value={formData.lastName}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Rôle</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Rôle"
                >
                  {ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      <Box>
                        <Typography variant="body1">{role.label}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {dialogMode === 'edit' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={handleInputChange}
                      name="active"
                      color="primary"
                    />
                  }
                  label="Actif"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Créer' : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'administrateur 
            <strong>{adminToDelete?.username}</strong> ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={handleDeleteAdmin} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;