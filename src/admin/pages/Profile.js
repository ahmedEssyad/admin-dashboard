import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert
} from '@mui/material';
import { Save as SaveIcon, Person as PersonIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../shared/contexts/AuthContext';

// Constantes pour les rôles
const ROLE_LABELS = {
  superAdmin: 'Super Admin',
  productManager: 'Responsable des produits',
  orderManager: 'Responsable des commandes',
  contentEditor: 'Éditeur de contenu'
};

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Préremplir les champs avec les données de l'utilisateur
    if (currentUser) {
      setFormData({
        ...formData,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Réinitialiser l'erreur de mot de passe si l'utilisateur modifie l'un des champs de mot de passe
    if (['currentPassword', 'newPassword', 'confirmPassword'].includes(name)) {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    // Vérifier si les mots de passe correspondent
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return false;
    }

    // Vérifier que le mot de passe actuel est fourni si un nouveau mot de passe est défini
    if (formData.newPassword && !formData.currentPassword) {
      setPasswordError('Veuillez saisir votre mot de passe actuel pour confirmer le changement.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Préparer les données à envoyer
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      // Ajouter les mots de passe uniquement s'ils sont fournis
      if (formData.newPassword) {
        profileData.currentPassword = formData.currentPassword;
        profileData.newPassword = formData.newPassword;
      }

      const result = await updateProfile(profileData);

      if (result.success) {
        toast.success(result.message);
        // Réinitialiser les champs de mot de passe
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.message);
        if (result.message.includes('mot de passe actuel')) {
          setPasswordError(result.message);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Une erreur est survenue lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  // Formater les permissions pour l'affichage
  const formatPermissions = () => {
    if (!currentUser || !currentUser.permissions) return [];

    const result = [];
    Object.entries(currentUser.permissions).forEach(([resource, actions]) => {
      Object.entries(actions).forEach(([action, isAllowed]) => {
        if (isAllowed) {
          result.push(`${resource}.${action}`);
        }
      });
    });
    return result;
  };

  // Obtenir un libellé lisible pour une permission
  const getPermissionLabel = (permString) => {
    const [resource, action] = permString.split('.');
    const resourceLabels = {
      products: 'Produits',
      categories: 'Catégories',
      orders: 'Commandes',
      companies: 'Entreprises',
      admins: 'Administrateurs'
    };
    
    const actionLabels = {
      create: 'Créer',
      read: 'Voir',
      update: 'Modifier',
      delete: 'Supprimer'
    };

    return `${actionLabels[action] || action} ${resourceLabels[resource] || resource}`;
  };

  // Obtenir une couleur pour chaque type d'action
  const getActionColor = (action) => {
    switch(action) {
      case 'create': return 'success';
      case 'read': return 'info';
      case 'update': return 'warning';
      case 'delete': return 'error';
      default: return 'default';
    }
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Chargement des informations du profil...</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profil
      </Typography>

      <Grid container spacing={3}>
        {/* Informations de profil */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                <PersonIcon fontSize="inherit" />
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {currentUser.username}
              </Typography>
              
              <Chip
                label={ROLE_LABELS[currentUser.role] || currentUser.role}
                color={currentUser.role === 'superAdmin' ? 'error' : 'primary'}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" align="center">
                {`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Nom non défini'}
              </Typography>
              
              {currentUser.email && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {currentUser.email}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Affichage des permissions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Permissions
              </Typography>
              
              {currentUser.role === 'superAdmin' ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  En tant que Super Admin, vous avez accès à toutes les fonctionnalités.
                </Alert>
              ) : (
                <>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {formatPermissions().map((perm) => {
                      const [, action] = perm.split('.');
                      return (
                        <Chip
                          key={perm}
                          label={getPermissionLabel(perm)}
                          size="small"
                          color={getActionColor(action)}
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Ces permissions sont déterminées par votre rôle. Contactez un Super Admin pour toute modification.
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Formulaire de modification du profil */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations personnelles
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Changer de mot de passe
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mot de passe actuel"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nouveau mot de passe"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmer le nouveau mot de passe"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={!!passwordError}
                    helperText={passwordError}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;