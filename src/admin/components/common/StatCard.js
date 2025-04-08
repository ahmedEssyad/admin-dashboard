import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

/**
 * Carte de statistiques réutilisable
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Titre de la statistique
 * @param {string|number} props.value - Valeur de la statistique
 * @param {string} [props.subtitle] - Description de la statistique
 * @param {React.ReactNode} props.icon - Icône représentant la statistique
 * @param {string} [props.color] - Couleur de l'icône/thème (primary, secondary, success, error, warning, info)
 * @param {boolean} [props.loading] - État de chargement
 * @param {React.ReactNode} [props.chart] - Composant graphique optionnel
 * @param {Object} [props.change] - Information sur le changement (valeur et direction)
 * @param {Function} [props.onMoreClick] - Fonction pour le clic sur "plus d'options"
 * @returns {JSX.Element} Carte de statistiques
 */
const StatCard = ({ 
  title, 
  value, 
  subtitle,
  icon, 
  color = 'primary',
  loading = false,
  chart,
  change,
  onMoreClick
}) => {
  const theme = useTheme();
  
  // Déterminer la couleur à utiliser du thème
  const getColorFromTheme = () => {
    return theme.palette[color]?.main || theme.palette.primary.main;
  };

  // Déterminer la couleur pour l'indicateur de changement
  const getChangeColor = () => {
    if (!change) return theme.palette.text.secondary;
    
    if (change.type === 'increase') {
      return change.positive 
        ? theme.palette.success.main 
        : theme.palette.error.main;
    } else if (change.type === 'decrease') {
      return change.positive 
        ? theme.palette.success.main 
        : theme.palette.error.main;
    }
    
    return theme.palette.text.secondary;
  };

  // Déterminer l'icône/texte pour l'indicateur de changement
  const getChangeText = () => {
    if (!change) return null;
    
    const prefix = change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : '';
    return `${prefix}${change.value}${change.unit || '%'}`;
  };

  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative', 
      overflow: 'visible'
    }}>
      <CardContent sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2
        }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h4" 
                component="div" 
                fontWeight="bold"
                sx={{ mr: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : value}
              </Typography>
              
              {change && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 500,
                    color: getChangeColor(),
                    backgroundColor: `${getChangeColor()}15`,
                    py: 0.5,
                    px: 1,
                    borderRadius: 1
                  }}
                >
                  {getChangeText()}
                </Typography>
              )}
            </Box>
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${getColorFromTheme()}15`,
                color: getColorFromTheme(),
                borderRadius: '50%',
                width: 40,
                height: 40,
                mr: onMoreClick ? 1 : 0
              }}
            >
              {icon}
            </Box>
            
            {onMoreClick && (
              <Tooltip title="Plus d'options">
                <IconButton 
                  size="small" 
                  onClick={onMoreClick}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        {/* Graphique optionnel */}
        {chart && (
          <Box sx={{ mt: 2, height: 60 }}>
            {chart}
          </Box>
        )}
      </CardContent>
      
      {/* Arrière-plan décoratif */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: `linear-gradient(to right, transparent, ${getColorFromTheme()}05)`,
          borderTopRightRadius: theme.shape.borderRadius,
          borderBottomRightRadius: theme.shape.borderRadius,
          zIndex: 0
        }} 
      />
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  loading: PropTypes.bool,
  chart: PropTypes.node,
  change: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.oneOf(['increase', 'decrease', 'neutral']).isRequired,
    positive: PropTypes.bool.isRequired,
    unit: PropTypes.string
  }),
  onMoreClick: PropTypes.func
};

export default StatCard;