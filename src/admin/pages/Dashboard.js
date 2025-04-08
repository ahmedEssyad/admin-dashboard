import React, { useState, useEffect } from 'react';
import { 
  Typography, Grid, Paper, Box, CircularProgress 
} from '@mui/material';
import { 
  Category, ShoppingCart, Store 
} from '@mui/icons-material';
import axiosInstance from '../../shared/api/axiosConfig';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/stats');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Impossible de charger les statistiques.');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <Category sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4">{stats?.categories || 0}</Typography>
            <Typography variant="h6">Catégories</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'secondary.light',
              color: 'white',
            }}
          >
            <ShoppingCart sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4">{stats?.products || 0}</Typography>
            <Typography variant="h6">Produits</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <Store sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4">{stats?.companies || 0}</Typography>
            <Typography variant="h6">Entreprises</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Bienvenue dans votre panneau d'administration
        </Typography>
        <Typography variant="body1">
          Utilisez le menu à gauche pour gérer votre catalogue de produits, catégories et entreprises.
        </Typography>
      </Box>
    </div>
  );
}

export default Dashboard;