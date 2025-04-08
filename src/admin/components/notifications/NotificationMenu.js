import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  List,
  ListItem,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../shared/api/axiosConfig';
import { toast } from 'react-toastify';

const NotificationMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const open = Boolean(anchorEl);
  
  // Charger les notifications lors du montage et périodiquement
  useEffect(() => {
    fetchNotifications();
    
    // Actualiser les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/notifications', {
        params: { limit: 10 }
      });
      
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClick = async (notification) => {
    try {
      // Marquer comme lu
      if (!notification.read) {
        await axiosInstance.patch(`/notifications/${notification._id}/read`);
        
        // Mettre à jour l'état local
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, read: true } : n
        ));
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Naviguer vers le lien s'il existe
      if (notification.link) {
        navigate(notification.link);
      }
      
      handleCloseMenu();
    } catch (error) {
      console.error('Erreur lors du traitement de la notification:', error);
      toast.error('Erreur lors du traitement de la notification');
    }
  };
  
  const handleDeleteNotification = async (event, notificationId) => {
    event.stopPropagation(); // Empêcher le clic sur la notification parent
    
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      
      // Mettre à jour l'état local
      const updatedNotifications = notifications.filter(n => n._id !== notificationId);
      setNotifications(updatedNotifications);
      
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      toast.error('Erreur lors de la suppression de la notification');
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
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
  
  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleOpenMenu}
          aria-label="notifications"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              startIcon={<DoneAllIcon />}
              size="small"
              onClick={handleMarkAllAsRead}
            >
              Tout marquer comme lu
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucune notification
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={format(new Date(notification.createdAt), 'PPP à p', { locale: fr })}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: notification.read ? 'normal' : 'bold'
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption'
                  }}
                />
                <IconButton
                  size="small"
                  edge="end"
                  onClick={(e) => handleDeleteNotification(e, notification._id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
        
        <Divider />
        
        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            size="small"
            onClick={() => {
              handleCloseMenu();
              navigate('/admin/settings');
            }}
          >
            Voir toutes les notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationMenu;
