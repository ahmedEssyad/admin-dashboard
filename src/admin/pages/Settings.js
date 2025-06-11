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
  ListItemIcon
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  ColorLens as ThemeIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useTheme } from '../../shared/contexts/ThemeContext';

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
    language: 'fr',
    securityAlerts: true,
    twoFactorAuth: false
  });
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const { currentUser, updateProfile } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  
  useEffect(() => {
    // Simuler le chargement des paramètres de l'utilisateur
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
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
        
        {/* Onglet Apparence */}
        <TabPanel value={value} index={1}>
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
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={darkMode}
                            onChange={toggleTheme}
                            name="darkMode"
                            color="primary"
                          />
                        }
                        label={darkMode ? "Mode sombre activé" : "Mode clair activé"}
                      />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: darkMode ? 'primary.main' : 'transparent',
                            border: '2px solid',
                            borderColor: darkMode ? 'primary.main' : 'divider',
                            mr: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                          }}
                          onClick={darkMode ? undefined : toggleTheme}
                        >
                          <DarkModeIcon sx={{ color: darkMode ? 'white' : 'text.secondary' }} />
                        </Box>
                        
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: !darkMode ? 'primary.main' : 'transparent',
                            border: '2px solid',
                            borderColor: !darkMode ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                          }}
                          onClick={darkMode ? toggleTheme : undefined}
                        >
                          <LightModeIcon sx={{ color: !darkMode ? 'white' : 'text.secondary' }} />
                        </Box>
                      </Box>
                    </Box>
                    
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
        <TabPanel value={value} index={2}>
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