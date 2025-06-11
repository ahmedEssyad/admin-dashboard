import React from 'react';
import {
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  Divider, 
  Typography, 
  useTheme, 
  Tooltip,
  Avatar,
  Collapse,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Layers as SubcategoryIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  LocalOffer as OfferIcon,
  BarChart as StatisticsIcon,
  Person as ProfileIcon,
  ShoppingCart as OrdersIcon,
  SupervisorAccount as AdminUsersIcon,
  ExpandLess,
  ExpandMore,
  ShoppingBasket as ProductsIcon,
  Storefront as StoreIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const theme = useTheme();
  const { currentUser, hasPermission } = useAuth();
  const location = useLocation(); 
  const [openSubmenu, setOpenSubmenu] = React.useState(null);

  // Gestion des sous-menus
  const handleSubmenuToggle = (id) => {
    setOpenSubmenu(openSubmenu === id ? null : id);
  };

  // Vérifier si un élément de menu est actif (pour les sous-menus)
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Vérifier si un sous-menu devrait être ouvert par défaut
  React.useEffect(() => {
    // Ouvrir automatiquement le sous-menu contenant la page active
    const activeSubmenu = menuItems.find(item => 
      item.subItems && item.subItems.some(subItem => isActive(subItem.path))
    );
    
    if (activeSubmenu) {
      setOpenSubmenu(activeSubmenu.id);
    }
  }, [location.pathname]);

  // Définir les éléments du menu avec leurs conditions d'affichage basées sur les permissions
  const menuItems = [
    {
      id: 'dashboard',
      text: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
      show: true, // Visible pour tous
      badge: null
    },
    {
      id: 'catalog',
      text: 'Catalogue',
      icon: <StoreIcon />,
      show: (hasPermission('products', 'read') && currentUser?.role !== 'orderManager') || 
            (hasPermission('categories', 'read') && currentUser?.role === 'contentEditor'),
      subItems: [
        {
          id: 'products',
          text: 'Produits',
          icon: <ProductsIcon />,
          path: '/admin/products',
          show: hasPermission('products', 'read') && currentUser?.role !== 'orderManager',
          badge: null
        },
        {
          id: 'categories',
          text: 'Catégories',
          icon: <CategoryIcon />,
          path: '/admin/categories',
          show: hasPermission('categories', 'read') && 
                (currentUser?.role === 'contentEditor' || currentUser?.role === 'superAdmin'),
          badge: null
        },
        {
          id: 'subcategories',
          text: 'Sous-catégories',
          icon: <SubcategoryIcon />,
          path: '/admin/subcategories',
          show: hasPermission('categories', 'read') && 
                (currentUser?.role === 'contentEditor' || currentUser?.role === 'superAdmin'),
          badge: null
        }
      ]
    },
    {
      id: 'companies',
      text: 'Entreprises',
      icon: <BusinessIcon />,
      path: '/admin/companies',
      show: hasPermission('companies', 'read') && 
            (currentUser?.role === 'contentEditor' || currentUser?.role === 'superAdmin'),
      badge: null
    },
    {
      id: 'promotions',
      text: 'Promotions',
      icon: <OfferIcon />,
      path: '/admin/promotions',
      show: hasPermission('products', 'update') && currentUser?.role !== 'orderManager',
      badge: null
    },
    {
      id: 'orders',
      text: 'Commandes',
      icon: <OrdersIcon />,
      path: '/admin/orders',
      show: hasPermission('orders', 'read') && currentUser?.role !== 'productManager',
      badge: { count: 8, color: 'error' } // Exemple de badge pour les nouvelles commandes
    },
    {
      id: 'statistics',
      text: 'Statistiques',
      icon: <StatisticsIcon />,
      path: '/admin/statistics',
      show: true, // Visible pour tous
      badge: null
    },
    {
      id: 'admin-users',
      text: 'Administrateurs',
      icon: <AdminUsersIcon />,
      path: '/admin/admin-users',
      show: hasPermission('admins', 'read'),
      badge: null
    },
    {
      id: 'profile',
      text: 'Profil',
      icon: <ProfileIcon />,
      path: '/admin/profile',
      show: true, // Visible pour tous
      badge: null
    },
    {
      id: 'settings',
      text: 'Paramètres',
      icon: <SettingsIcon />,
      path: '/admin/settings',
      show: true, // Visible pour tous
      badge: null
    }
  ];

  // Filtrer les éléments du menu en fonction des permissions
  const visibleMenuItems = menuItems.filter(item => item.show);

  const isDarkMode = theme.palette.mode === 'dark';

  const drawer = (
    <div>
      <Box sx={{ 
        py: 3, 
        px: 2,
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: 'white'
      }}>
        <Avatar 
          alt="Logo" 
          src="/logo.png" 
          sx={{ 
            width: 60, 
            height: 60, 
            mb: 1,
            bgcolor: 'white',
            p: 1
          }}
        />
        <Typography variant="h6" fontWeight="bold" align="center" sx={{ mb: 0.5 }}>
          Admin Dashboard
        </Typography>
        {currentUser && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Tooltip title="Votre rôle">
              <Typography 
                variant="caption" 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                  borderRadius: '12px',
                  py: 0.5,
                  px: 1.5,
                  display: 'inline-block',
                  fontWeight: 500
                }}
              >
                {currentUser.role === 'superAdmin' && 'Super Admin'}
                {currentUser.role === 'productManager' && 'Responsable produits'}
                {currentUser.role === 'orderManager' && 'Responsable commandes'}
                {currentUser.role === 'contentEditor' && 'Éditeur de contenu'}
              </Typography>
            </Tooltip>
          </Box>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <List sx={{ px: 1 }}>
          {visibleMenuItems.map((item) => (
            item.subItems ? (
              <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    onClick={() => handleSubmenuToggle(item.id)}
                    sx={{
                      borderRadius: 2,
                      color: openSubmenu === item.id ? theme.palette.primary.main : theme.palette.text.primary,
                      bgcolor: openSubmenu === item.id 
                        ? (isDarkMode ? 'rgba(37, 99, 235, 0.16)' : 'rgba(37, 99, 235, 0.08)') 
                        : 'transparent',
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: openSubmenu === item.id ? theme.palette.primary.main : theme.palette.text.secondary,
                      minWidth: 40
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {openSubmenu === item.id ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openSubmenu === item.id} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.filter(subItem => subItem.show).map((subItem) => (
                      <ListItem key={subItem.id} disablePadding sx={{ pl: 2, mb: 0.5 }}>
                        <ListItemButton
                          component={NavLink}
                          to={subItem.path}
                          sx={{
                            borderRadius: 2,
                            pl: 2,
                            color: isActive(subItem.path) ? theme.palette.primary.main : theme.palette.text.primary,
                            bgcolor: isActive(subItem.path) 
                              ? (isDarkMode ? 'rgba(37, 99, 235, 0.16)' : 'rgba(37, 99, 235, 0.08)') 
                              : 'transparent',
                            '&:hover': {
                              bgcolor: isDarkMode ? 'rgba(37, 99, 235, 0.24)' : 'rgba(37, 99, 235, 0.12)',
                            }
                          }}
                        >
                          <ListItemIcon sx={{ 
                            color: isActive(subItem.path) ? theme.palette.primary.main : theme.palette.text.secondary,
                            minWidth: 36
                          }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={subItem.text} 
                            primaryTypographyProps={{ fontSize: '0.9rem' }}
                          />
                          {subItem.badge && (
                            <Badge badgeContent={subItem.badge.count} color={subItem.badge.color} />
                          )}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{
                    borderRadius: 2,
                    color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
                    bgcolor: isActive(item.path) 
                      ? (isDarkMode ? 'rgba(37, 99, 235, 0.16)' : 'rgba(37, 99, 235, 0.08)') 
                      : 'transparent',
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(37, 99, 235, 0.24)' : 'rgba(37, 99, 235, 0.12)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.secondary,
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.badge && (
                    <Badge badgeContent={item.badge.count} color={item.badge.color} />
                  )}
                </ListItemButton>
              </ListItem>
            )
          ))}
        </List>
      </Box>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block' }}>
          © {new Date().getFullYear()} Admin Dashboard
          <br />
          Version 1.0.0
        </Typography>
      </Box>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* La version mobile du drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Améliore la performance sur mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.1)'
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* La version desktop du drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: isDarkMode 
              ? '1px solid rgba(255, 255, 255, 0.05)' 
              : '1px solid rgba(0, 0, 0, 0.05)'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;