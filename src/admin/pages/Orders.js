import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Paper, Tabs, Tab, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Chip, Tooltip, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, InputLabel, MenuItem,
  Select, CircularProgress, Alert, Collapse, Card, CardContent,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Assessment as AssessmentIcon,
  ShowChart as ChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { fr } from 'date-fns/locale';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { toast } from 'react-toastify';

import axiosInstance from '../../shared/api/axiosConfig';
import OrderDetails from '../components/orders/OrderDetails';
import OrdersChart from '../components/orders/OrdersChart';
import StatusUpdateDialog from '../components/orders/StatusUpdateDialog';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A52A2A', '#7B68EE', '#FF6347', '#20B2AA'];

const Orders = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [selectedStatsTab, setSelectedStatsTab] = useState(0);
  
  // États pour les modales
  const [viewOrder, setViewOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  
  // Statistiques
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    ordersByStatus: [],
    ordersByDay: []
  });

  // Les différents statuts possibles pour une commande
  const orderStatuses = [
    { value: 'en attente', label: 'En attente', color: 'warning' },
    { value: 'confirmée', label: 'Confirmée', color: 'info' },
    { value: 'en préparation', label: 'En préparation', color: 'secondary' },
    { value: 'expédiée', label: 'Expédiée', color: 'primary' },
    { value: 'livrée', label: 'Livrée', color: 'success' },
    { value: 'payée', label: 'Payée', color: 'success' },
    { value: 'annulée', label: 'Annulée', color: 'error' }
  ];

  // Charger les données initiales au montage du composant
  useEffect(() => {
    fetchOrders();
  }, []);

  // Recharger lorsque les filtres changent
  useEffect(() => {
    if (statusFilter || (dateRange.startDate && dateRange.endDate)) {
      fetchOrders();
    }
  }, [statusFilter, dateRange.startDate, dateRange.endDate]);
  // Charger les commandes
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mode développement - Utiliser des données de test si nécessaire
      const DEV_MODE = false; // Désactivé - utilise les vraies données de la DB
      
      if (DEV_MODE) {
        // Code du mode développement (désactivé)
        // ...
      } else {
        // Code normal d'API - Utiliser les vraies données de la DB
        let params = {};
        if (statusFilter) params.status = statusFilter;
        if (dateRange.startDate && dateRange.endDate) {
          params.startDate = dateRange.startDate.toISOString();
          params.endDate = dateRange.endDate.toISOString();
        }
        
        // Vérifier si le token est présent
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette section.');
          setLoading(false);
          return;
        }
        
        // Mode débogage - afficher le rôle de l'utilisateur
        const userRole = localStorage.getItem('role');
        
        // Gérer le cas spécial où l'utilisateur est un responsable produit
        if (userRole === 'productManager') {
          setError('En tant que responsable produit, vous n\'avez pas accès à la gestion des commandes.');
          setLoading(false);
          return;
        }
        
        const response = await axiosInstance.get('/orders', { params });
        
        if (response.data.success) {
          setOrders(response.data.data);
          setFilteredOrders(response.data.data);
          setError(''); // Effacer l'erreur en cas de succès
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      
      let errorMessage = 'Impossible de charger les commandes. Veuillez réessayer plus tard.';
      
      // Gérer spécifiquement les erreurs d'autorisation
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Vous n\'avez pas les droits nécessaires pour accéder à cette section. ' +
                         'Contactez un administrateur si vous pensez qu\'il s\'agit d\'une erreur.';
          
          // Afficher des informations sur le rôle pour le débogage
          const userRole = localStorage.getItem('role');
          
          if (error.response.data && error.response.data.role) {
            errorMessage += ` (Rôle détecté: ${error.response.data.role})`;
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
          // Rediriger vers la page de login après un délai
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Charger les statistiques
  const fetchStats = async () => {
    try {
      // Mode développement ou API
      const DEV_MODE = false; // Désactivé - utiliser les vraies données
      
      // Filtrer les commandes selon la plage de dates si nécessaire
      const filteredOrders = dateRange.startDate && dateRange.endDate 
        ? orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate;
          })
        : orders;
  
      // Calculer les statistiques
      const stats = {
        totalOrders: filteredOrders.length,
        totalRevenue: filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        ordersByStatus: Object.entries(
          filteredOrders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {})
        ).map(([status, count]) => ({
          _id: status,
          count: count,
          total: filteredOrders
            .filter(o => o.status === status)
            .reduce((sum, order) => sum + order.totalAmount, 0)
        })),
        ordersByDay: Object.entries(
          filteredOrders.reduce((acc, order) => {
            const date = new Date(order.createdAt).toLocaleDateString('fr-FR');
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {})
        ).map(([name, count]) => ({ name, count }))
      };
  
      setStats(stats);
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      // En mode développement, générer des statistiques factices en cas d'erreur
      if (DEV_MODE) {
        // Code du mode développement (désactivé)
        // ...
      }
    }
  };
  // Méthodes de statistiques
  const getOrdersByStatus = () => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const getOrdersByPriceRange = () => {
    return [
      { 
        name: '< 50 MRU', 
        value: orders.filter(o => o.totalAmount < 50).length 
      },
      { 
        name: '50-100 MRU', 
        value: orders.filter(o => o.totalAmount >= 50 && o.totalAmount < 100).length 
      },
      { 
        name: '100-200 MRU', 
        value: orders.filter(o => o.totalAmount >= 100 && o.totalAmount < 200).length 
      },
      { 
        name: '200-500 MRU', 
        value: orders.filter(o => o.totalAmount >= 200 && o.totalAmount < 500).length 
      },
      { 
        name: '> 500 MRU', 
        value: orders.filter(o => o.totalAmount >= 500).length 
      }
    ];
  };

  const getMonthlyData = () => {
    const now = new Date();
    let monthsData = [];
    
    let monthsToShow;
    switch (selectedPeriod) {
      case '3months':
        monthsToShow = 3;
        break;
      case '6months':
        monthsToShow = 6;
        break;
      case '12months':
        monthsToShow = 12;
        break;
      default:
        monthsToShow = 3;
    }

    for (let i = 0; i < monthsToShow; i++) {
      const month = subMonths(now, i);
      const monthName = format(month, 'MMMM yyyy', { locale: fr });

      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === month.getMonth() && 
               orderDate.getFullYear() === month.getFullYear();
      });

      const monthStats = {
        name: monthName,
        totalOrders: monthOrders.length,
        totalRevenue: monthOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        averageOrderValue: monthOrders.length > 0 
          ? monthOrders.reduce((sum, order) => sum + order.totalAmount, 0) / monthOrders.length 
          : 0
      };

      monthsData.push(monthStats);
    }

    return monthsData.reverse();
  };
  // Export Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    const ordersData = orders.map(order => ({
      'N° de commande': order.orderNumber,
      'Date': format(new Date(order.createdAt), 'dd/MM/yyyy'),
      'Client': `${order.customer.firstName} ${order.customer.lastName}`,
      'Téléphone': order.customer.phone,
      'Montant total': order.totalAmount,
      'Statut': order.status,
      'Payée': order.isPaid ? 'Oui' : 'Non',
      'Méthode de paiement': order.paymentMethod || 'N/A',
      'Adresse de livraison': `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`
    }));
    
    const ordersWorksheet = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(workbook, ordersWorksheet, 'Commandes');
    
    const statusData = getOrdersByStatus().map(status => ({
      'Statut': status.name,
      'Nombre de commandes': status.count
    }));
    
    const statusWorksheet = XLSX.utils.json_to_sheet(statusData);
    XLSX.utils.book_append_sheet(workbook, statusWorksheet, 'Statuts des commandes');
    
    const monthlyData = getMonthlyData().map(month => ({
      'Mois': month.name,
      'Nombre de commandes': month.totalOrders,
      'Chiffre d\'affaires': month.totalRevenue.toFixed(2),
      'Valeur moyenne des commandes': month.averageOrderValue.toFixed(2)
    }));
    
    const monthlyWorksheet = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlyWorksheet, 'Statistiques mensuelles');
    
    XLSX.writeFile(workbook, `Rapport_Commandes_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Données exportées avec succès');
  };

  // Effectuer la recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    const results = orders.filter(order => 
      order.orderNumber?.toLowerCase().includes(lowercaseSearch) ||
      `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.toLowerCase().includes(lowercaseSearch) ||
      (order.customer?.phone && order.customer.phone.includes(searchTerm))
    );
    
    setFilteredOrders(results);
  }, [searchTerm, orders]);

  // Charger les données initiales
  useEffect(() => {
    if (orders.length > 0) {
      fetchStats();
    }
  }, [orders, dateRange.startDate, dateRange.endDate]);
  // Gérer les changements d'onglet
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Réinitialiser les filtres
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateRange({ startDate: null, endDate: null });
  };

  // Gérer les détails et mise à jour des commandes
  const handleViewOrder = (order) => {
    setViewOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleOpenStatusUpdate = (order) => {
    setOrderToUpdate(order);
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = async (newStatus, comment) => {
    try {
      if (!orderToUpdate) return;
      
      // Mode développement - mise à jour simulée
      const DEV_MODE = false; // Désactivé - utiliser la vraie API
      
      if (DEV_MODE) {
        // Code du mode développement (désactivé)
        // ...
      } else {
        // Mode production - vraie requête API
        const response = await axiosInstance.patch(`/orders/${orderToUpdate._id}/status`, {
          status: newStatus,
          comment
        });
        
        if (response.data.success) {
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order._id === orderToUpdate._id ? response.data.data : order
            )
          );
          
          // Mettre à jour également la liste filtrée
          setFilteredOrders(prevOrders => 
            prevOrders.map(order => 
              order._id === orderToUpdate._id ? response.data.data : order
            )
          );
          
          setIsStatusDialogOpen(false);
          setOrderToUpdate(null);
          
          toast.success(`Statut mis à jour avec succès: ${newStatus}`);
          
          fetchStats();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError('Impossible de mettre à jour le statut. Veuillez réessayer plus tard.');
      
      // Afficher plus de détails sur l'erreur pour le débogage
      if (error.response && error.response.data) {
        console.error('Détails de l\'erreur:', error.response.data);
      }
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'default';
  };
  // Rendu des statistiques
  const renderStats = () => (
    <>
      <Tabs
        value={selectedStatsTab}
        onChange={(e, newValue) => setSelectedStatsTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        centered
        sx={{ mb: 3 }}
      >
        <Tab icon={<AssessmentIcon />} label="Vue d'ensemble" />
        <Tab icon={<ChartIcon />} label="Tendances" />
        <Tab icon={<PieChartIcon />} label="Répartition" />
      </Tabs>

      {selectedStatsTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: theme.palette.primary.light, color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total des commandes</Typography>
                <Typography variant="h3">{stats.totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: theme.palette.success.light, color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Chiffre d'affaires</Typography>
                <Typography variant="h3">{stats.totalRevenue.toFixed(2)} MRU</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: theme.palette.warning.light, color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Commandes en attente</Typography>
                <Typography variant="h3">
                  {stats.ordersByStatus?.find(s => s._id === 'en attente')?.count || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Commandes par statut</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={getOrdersByStatus()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" name="Nombre de commandes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Autres graphiques et statistiques ici... */}
        </Grid>
      )}

      {/* Reste du code pour les autres onglets... */}
    </>
  );

  // Affichage de la liste des commandes
  const renderOrdersList = () => (
    <Box>
      {/* Barre de recherche et filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtres
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchOrders();
                  fetchStats();
                }}
                disabled={loading}
              >
                {loading ? 'Actualisation...' : 'Actualiser'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportToExcel}
              >
                Exporter (Excel)
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        <Collapse in={showFilters}>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Statut"
                  >
                    <MenuItem value="">Tous</MenuItem>
                    {orderStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={fr}>
                  <DatePicker
                    label="Date de début"
                    value={dateRange.startDate}
                    onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={fr}>
                  <DatePicker
                    label="Date de fin"
                    value={dateRange.endDate}
                    onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  fullWidth
                >
                  Effacer les filtres
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
      
      {/* Tableau des commandes */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredOrders.length === 0 ? (
        <Alert severity="info">
          Aucune commande ne correspond à vos critères de recherche.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° de commande</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Paiement</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.customer.firstName} {order.customer.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customer.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.totalAmount.toFixed(2)} MRU</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.isPaid ? "Payée" : "En attente"} 
                      color={order.isPaid ? "success" : "default"}
                      size="small"
                      variant={order.isPaid ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir les détails">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleViewOrder(order)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier le statut">
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleOpenStatusUpdate(order)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Gestion des commandes
      </Typography>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 3 }}
        variant="scrollable"
      >
        <Tab label={`Liste des commandes (${filteredOrders.length})`} />
        <Tab label="Statistiques" />
      </Tabs>
      
      {activeTab === 0 && renderOrdersList()}
      {activeTab === 1 && renderStats()}
      
      {/* Boîte de dialogue des détails d'une commande */}
      <Dialog 
        open={isViewDialogOpen} 
        onClose={() => setIsViewDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Détails de la commande {viewOrder?.orderNumber}
        </DialogTitle>
        <DialogContent dividers>
          {viewOrder && <OrderDetails order={viewOrder} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Boîte de dialogue de mise à jour du statut */}
      <StatusUpdateDialog
        open={isStatusDialogOpen}
        onClose={() => {
          setIsStatusDialogOpen(false);
          setOrderToUpdate(null);
        }}
        onUpdateStatus={handleStatusUpdate}
        order={orderToUpdate}
        statuses={orderStatuses}
      />
    </Box>
  );
};

export default Orders;