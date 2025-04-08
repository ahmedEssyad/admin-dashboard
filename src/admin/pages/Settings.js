import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Tab,
  Tabs,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  ColorLens as ThemeIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../shared/contexts/AuthContext';
import axiosInstance from '../../shared/api/axiosConfig';
import notificationService from '../../shared/services/notificationService';

// Composant pour afficher le contenu par onglet
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Settings() {
  const [value, setValue] = useState(0);
  const [userSettings, setUserSettings] = useState({
    notificationsEnabled: true,
    emailNotifications: false,
    darkMode: false,
    language: 'fr',
    securityAlerts: true,
    twoFactorAuth: false
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationPage, setNotificationPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const { currentUser, updateProfile } = useAuth();
  
  const ITEMS_PER_PAGE = 10;
  
  useEffect(() => {
    // Simuler le chargement des paramètres de l'utilisateur
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Charger les notifications
    fetchNotifications();
  }, [notificationPage]);
  
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const skip = (notificationPage - 1) * ITEMS_PER_PAGE;
      
      const response = await notificationService.getNotifications({
        limit: ITEMS_PER_PAGE,
        skip
      });
      
      setNotifications(response.data);
      setTotalNotifications(response.total);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };
  
  const handleSettingChange = (event) => {
    const { name, checked } = event.target;
    setUserSettings(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Simuler l'enregistrement des paramètres
    toast.success(`Paramètre ${name} mis à jour`);
  };
  
  const handleLanguageChange = (event) => {
    setUserSettings(prev => ({
      ...prev,
      language: event.target.value
    }));
    
    toast.success('Langue mise à jour');
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Vérification des mots de passe
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    try {
      // Simuler une API pour changer le mot de passe
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordSuccess('Mot de passe mis à jour avec succès');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setPasswordError('Erreur lors du changement de mot de passe');
    }
  };
  
  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      
      toast.success('Notification marquée comme lue');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
      toast.error('Erreur lors de la mise à jour de la notification');
    }
  };
  
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Mettre à jour l'état local
      setNotifications(notifications.filter(n => n._id !== notificationId));
      setTotalNotifications(prev => prev - 1);
      
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      toast.error('Erreur lors de la suppression de la notification');
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
      toast.error('Erreur lors de la mise à jour des notifications');
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'success':
        return <SuccessIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>
      
      <Paper sx={{ mt: 3 }}>
        <Tabs 
          value={value} 
          onChange={handleTabChange} 
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          centered
        >
          <Tab label="Profil" />
          <Tab label="Notifications" />
          <Tab label="Apparence" />
          <Tab label="Sécurité" />
        </Tabs>
        
        {/* Onglet Profil */}
        <TabPanel value={value} index={0}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Informations personnelles
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  value={currentUser?.username || ''}
                  disabled
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={currentUser?.email || ''}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={currentUser?.firstName || ''}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={currentUser?.lastName || ''}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="contained" color="primary">
                    Enregistrer les modifications
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Onglet Notifications */}
        <TabPanel value={value} index={1}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Paramètres de notification
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Options de notification
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userSettings.notificationsEnabled}
                          onChange={handleSettingChange}
                          name="notificationsEnabled"
                          color="primary"
                        />
                      }
                      label="Activer les notifications"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userSettings.emailNotifications}
                          onChange={handleSettingChange}
                          name="emailNotifications"
                          color="primary"
                          disabled={!userSettings.notificationsEnabled}
                        />
                      }
                      label="Recevoir les notifications par email"
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Historique des notifications
                  </Typography>
                  
                  <Button
                    startIcon={<NotificationIcon />}
                    onClick={markAllAsRead}
                    disabled={notifications.every(n => n.read)}
                  >
                    Tout marquer comme lu
                  </Button>
                </Box>
                
                {notificationsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : notifications.length === 0 ? (
                  <Alert severity="info">
                    Aucune notification
                  </Alert>
                ) : (
                  <List>
                    {notifications.map((notification) => (
                      <ListItem
                        key={notification._id}
                        sx={{
                          backgroundColor: notification.read ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
                          borderRadius: 1,
                          mb: 1
                        }}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => deleteNotification(notification._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          {getNotificationIcon(notification.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={notification.message}
                          secondary={
                            <>
                              {format(new Date(notification.createdAt), 'PPP à p', { locale: fr })}
                              {!notification.read && (
                                <Button
                                  size="small"
                                  sx={{ ml: 2 }}
                                  onClick={() => markNotificationAsRead(notification._id)}
                                >
                                  Marquer comme lu
                                </Button>
                              )}
                            </>
                          }
                          primaryTypographyProps={{
                            fontWeight: notification.read ? 'normal' : 'bold'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                
                {/* Pagination simplifiée */}
                {totalNotifications > ITEMS_PER_PAGE && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                      disabled={notificationPage === 1}
                      onClick={() => setNotificationPage(prev => prev - 1)}
                    >
                      Précédent
                    </Button>
                    <Typography sx={{ mx: 2 }}>
                      Page {notificationPage} sur {Math.ceil(totalNotifications / ITEMS_PER_PAGE)}
                    </Typography>
                    <Button
                      disabled={notificationPage >= Math.ceil(totalNotifications / ITEMS_PER_PAGE)}
                      onClick={() => setNotificationPage(prev => prev + 1)}
                    >
                      Suivant
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Onglet Apparence */}
        <TabPanel value={value} index={2}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Paramètres d'affichage
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Thème
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userSettings.darkMode}
                          onChange={handleSettingChange}
                          name="darkMode"
                          color="primary"
                        />
                      }
                      label="Mode sombre"
                    />
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                      Langue
                    </Typography>
                    
                    <TextField
                      select
                      label="Langue"
                      value={userSettings.language}
                      onChange={handleLanguageChange}
                      SelectProps={{
                        native: true,
                      }}
                      fullWidth
                      variant="outlined"
                      sx={{ mt: 1 }}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="de">Deutsch</option>
                      <option value="ar">العربية</option>
                    </TextField>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Onglet Sécurité */}
        <TabPanel value={value} index={3}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Paramètres de sécurité
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Changement de mot de passe
                    </Typography>
                    
                    {passwordError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {passwordError}
                      </Alert>
                    )}
                    
                    {passwordSuccess && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {passwordSuccess}
                      </Alert>
                    )}
                    
                    <form onSubmit={handleSubmitPassword}>
                      <TextField
                        fullWidth
                        label="Mot de passe actuel"
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        variant="outlined"
                        margin="normal"
                        required
                      />
                      
                      <TextField
                        fullWidth
                        label="Nouveau mot de passe"
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        variant="outlined"
                        margin="normal"
                        required
                      />
                      
                      <TextField
                        fullWidth
                        label="Confirmer le nouveau mot de passe"
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        variant="outlined"
                        margin="normal"
                        required
                      />
                      
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Changer le mot de passe
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Sécurité du compte
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userSettings.securityAlerts}
                          onChange={handleSettingChange}
                          name="securityAlerts"
                          color="primary"
                        />
                      }
                      label="Notifications de sécurité"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userSettings.twoFactorAuth}
                          onChange={handleSettingChange}
                          name="twoFactorAuth"
                          color="primary"
                        />
                      }
                      label="Authentification à deux facteurs"
                    />
                    
                    {userSettings.twoFactorAuth && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        L'authentification à deux facteurs est activée. Une étape supplémentaire de vérification sera requise lors de la connexion.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default Settings;
